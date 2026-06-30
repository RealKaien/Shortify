import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db";
import { getUrlSuggestions } from "./server/gemini";

const PORT = 3000;

// Helper to parse User Agent for analytics
function parseUserAgent(ua: string = "") {
  let device = "Desktop";
  let os = "Windows";
  let browser = "Chrome";

  const lowerUA = ua.toLowerCase();

  // Device detection
  if (lowerUA.includes("mobi") || lowerUA.includes("android") || lowerUA.includes("iphone")) {
    device = "Mobile";
  } else if (lowerUA.includes("ipad") || lowerUA.includes("tablet")) {
    device = "Tablet";
  }

  // OS detection
  if (lowerUA.includes("windows")) {
    os = "Windows";
  } else if (lowerUA.includes("macintosh") || lowerUA.includes("mac os")) {
    os = "macOS";
  } else if (lowerUA.includes("iphone") || lowerUA.includes("ipad")) {
    os = "iOS";
  } else if (lowerUA.includes("android")) {
    os = "Android";
  } else if (lowerUA.includes("linux")) {
    os = "Linux";
  }

  // Browser detection
  if (lowerUA.includes("edg/")) {
    browser = "Edge";
  } else if (lowerUA.includes("chrome") || lowerUA.includes("crios")) {
    browser = "Chrome";
  } else if (lowerUA.includes("firefox") || lowerUA.includes("fxios")) {
    browser = "Firefox";
  } else if (lowerUA.includes("safari") && !lowerUA.includes("chrome")) {
    browser = "Safari";
  }

  return { device, os, browser };
}

// Helper to determine Referrer
function parseReferrer(refererHeader: string = "") {
  if (!refererHeader) return "Direct";
  try {
    const url = new URL(refererHeader);
    const host = url.hostname.toLowerCase();
    if (host.includes("twitter.com") || host.includes("t.co")) return "Twitter/X";
    if (host.includes("linkedin.com")) return "LinkedIn";
    if (host.includes("github.com")) return "GitHub";
    if (host.includes("google.com")) return "Google";
    if (host.includes("ycombinator.com") || host.includes("hackernews")) return "HackerNews";
    if (host.includes("producthunt.com")) return "ProductHunt";
    return url.hostname;
  } catch {
    return "Referral";
  }
}

// Helper to generate a random country and city for local requests, but use real ones if available
function getGeoData(ip: string = "", reqHeaders: Record<string, any> = {}) {
  // Check Cloud Run / reverse proxy geo headers first
  const cfCountry = reqHeaders["cf-ipcountry"] || reqHeaders["x-appengine-country"];
  if (cfCountry && typeof cfCountry === "string") {
    return {
      country: cfCountry === "XX" ? "United States" : cfCountry,
      city: reqHeaders["cf-ipcity"] || "Major City",
    };
  }

  // Fallback for rich mock geolocations during development/preview (instead of just showing 127.0.0.1)
  const countries = ["United States", "United Kingdom", "Germany", "Japan", "Canada", "India", "France", "Australia"];
  const cities: Record<string, string[]> = {
    "United States": ["San Francisco", "New York", "Seattle", "Austin"],
    "United Kingdom": ["London", "Manchester"],
    "Germany": ["Berlin", "Munich"],
    "Japan": ["Tokyo", "Osaka"],
    "Canada": ["Toronto", "Vancouver"],
    "India": ["Bangalore", "Mumbai"],
    "France": ["Paris"],
    "Australia": ["Sydney"],
  };

  const country = countries[Math.floor(Math.random() * countries.length)];
  const countryCities = cities[country] || ["Generic City"];
  const city = countryCities[Math.floor(Math.random() * countryCities.length)];

  return { country, city };
}

async function startServer() {
  const app = express();
  app.set("trust proxy", true);
  app.use(express.json());

  // CORS middleware for safety (if needed)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Extract auth user ID middleware (supporting standard tokens & live API keys)
  const getUserId = async (req: express.Request): Promise<string | null> => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token.startsWith("sh_live_")) {
        const apiKeyObj = await db.validateApiKey(token);
        return apiKeyObj ? apiKeyObj.userId : null;
      }
      return token;
    }
    return null;
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }

      const existingUser = await db.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email is already registered" });
      }

      const newUser = await db.createUser({
        id: `user-${Math.random().toString(36).substring(2, 9)}`,
        name,
        email,
        password, // Simple text storage for focus
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
        token: newUser.id,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await db.findUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      if (password && user.password !== password) {
        return res.status(400).json({ error: "Incorrect password" });
      }

      res.json({
        user: { id: user.id, name: user.name, email: user.email },
        token: user.id,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Links CRUD
  app.get("/api/links", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const links = await db.getLinks(userId);
      res.json(links);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/links", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const { longUrl, alias, title, description, password, isProtected, expiryDate, utmSource, utmMedium, utmCampaign } = req.body;
      
      if (!longUrl) {
        return res.status(400).json({ error: "Long URL is required" });
      }

      // Check if custom alias is already taken (case-insensitively across all links)
      if (alias) {
        const allLinks = await db.getLinks();
        const conflict = allLinks.find(
          l => (l.shortCode && l.shortCode.toLowerCase() === alias.toLowerCase()) || 
               (l.alias && l.alias.toLowerCase() === alias.toLowerCase())
        );
        if (conflict) {
          return res.status(400).json({ error: `Alias "${alias}" is already taken.` });
        }
      }

      const shortCode = alias || Math.random().toString(36).substring(2, 8);
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        `${req.protocol}://${req.get("host")}/s/${shortCode}`
      )}`;

      const newLink = await db.createLink({
        id: `link-${Math.random().toString(36).substring(2, 9)}`,
        shortCode,
        longUrl,
        alias: alias || undefined,
        clicks: 0,
        createdAt: new Date().toISOString(),
        title: title || undefined,
        description: description || undefined,
        password: password || undefined,
        isProtected: !!isProtected,
        expiryDate: expiryDate || undefined,
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
        qrCodeUrl,
        userId: userId || null,
      });

      res.status(201).json(newLink);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/links/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { alias } = req.body;

      if (alias) {
        const allLinks = await db.getLinks();
        const conflict = allLinks.find(
          l => l.id !== id && (
            (l.shortCode && l.shortCode.toLowerCase() === alias.toLowerCase()) || 
            (l.alias && l.alias.toLowerCase() === alias.toLowerCase())
          )
        );
        if (conflict) {
          return res.status(400).json({ error: `Alias "${alias}" is already taken.` });
        }
      }

      const updated = await db.updateLink(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Link not found" });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/links/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await db.deleteLink(id);
      if (!deleted) {
        return res.status(404).json({ error: "Link not found" });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Click Logging & Redirection Helper
  app.get("/api/links/code/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const link = await db.findLinkByCode(code);
      if (!link) {
        return res.status(404).json({ error: "Link not found" });
      }
      res.json(link);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/links/:id/click", async (req, res) => {
    try {
      const { id } = req.params;
      
      const ua = req.headers["user-agent"] || "";
      const referer = req.headers["referer"] || "";
      const ip = (req.headers["x-forwarded-for"] as string || "").split(",")[0].trim() || req.socket.remoteAddress || "127.0.0.1";
      
      const { device, os, browser } = parseUserAgent(ua);
      const referrer = parseReferrer(referer);
      const { country, city } = getGeoData(ip, req.headers);

      const click = await db.createClick({
        id: `click-${Math.random().toString(36).substring(2, 9)}`,
        linkId: id,
        timestamp: new Date().toISOString(),
        country,
        city,
        device,
        browser,
        os,
        referrer,
      });

      res.status(201).json(click);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Analytics Clicks List
  app.get("/api/clicks", async (req, res) => {
    try {
      const userId = await getUserId(req);
      const clicks = await db.getClicks(userId);
      res.json(clicks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Keys Management
  app.get("/api/api-keys", async (req, res) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const keys = await db.getApiKeys(userId);
      res.json(keys);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/api-keys", async (req, res) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Key name is required" });
      }

      const hex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const keyStr = `sh_live_${hex}`;

      const newKey = await db.createApiKey({
        id: `key-${Math.random().toString(36).substring(2, 9)}`,
        name,
        key: keyStr,
        createdAt: new Date().toISOString(),
        userId,
      });

      res.status(201).json(newKey);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/api-keys/:id", async (req, res) => {
    try {
      const userId = await getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { id } = req.params;
      const deleted = await db.deleteApiKey(id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Key not found or unauthorized" });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Gemini Smart Suggestions
  app.post("/api/gemini/shorten", async (req, res) => {
    try {
      const { longUrl } = req.body;
      if (!longUrl) {
        return res.status(400).json({ error: "Long URL is required" });
      }

      const suggestions = await getUrlSuggestions(longUrl);
      res.json(suggestions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite development middleware OR static folder serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
