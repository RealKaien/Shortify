import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'db.json');

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
}

export interface Link {
  id: string;
  shortCode: string;
  longUrl: string;
  clicks: number;
  createdAt: string;
  alias?: string;
  expiryDate?: string;
  password?: string;
  qrCodeUrl?: string;
  title?: string;
  description?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  isProtected?: boolean;
  userId?: string | null;
}

export interface ClickEvent {
  id: string;
  linkId: string;
  timestamp: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  referrer: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  userId: string;
}

interface DatabaseSchema {
  users: User[];
  links: Link[];
  clicks: ClickEvent[];
  apiKeys: ApiKey[];
}

const defaultSchema: DatabaseSchema = {
  users: [],
  links: [],
  clicks: [],
  apiKeys: [],
};

class Database {
  private cache: DatabaseSchema | null = null;
  private writePromise: Promise<void> = Promise.resolve();

  private async read(): Promise<DatabaseSchema> {
    if (this.cache) return this.cache;
    try {
      const data = await fs.readFile(DB_FILE, 'utf-8');
      this.cache = JSON.parse(data);
      // Ensure all fields are initialized
      if (!this.cache) this.cache = { ...defaultSchema };
      this.cache.users = this.cache.users || [];
      this.cache.links = this.cache.links || [];
      this.cache.clicks = this.cache.clicks || [];
      this.cache.apiKeys = this.cache.apiKeys || [];
      return this.cache;
    } catch (error) {
      this.cache = { ...defaultSchema };
      await this.write();
      return this.cache;
    }
  }

  private async write(): Promise<void> {
    if (!this.cache) return;
    
    // Queue writes to prevent race conditions or file corruption
    this.writePromise = this.writePromise.then(async () => {
      const tempFile = `${DB_FILE}.tmp`;
      await fs.writeFile(tempFile, JSON.stringify(this.cache, null, 2), 'utf-8');
      await fs.rename(tempFile, DB_FILE);
    });
    
    return this.writePromise;
  }

  // User Operations
  async getUsers(): Promise<User[]> {
    const db = await this.read();
    return db.users;
  }

  async createUser(user: User): Promise<User> {
    const db = await this.read();
    db.users.push(user);
    await this.write();
    return user;
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const db = await this.read();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id: string): Promise<User | undefined> {
    const db = await this.read();
    return db.users.find(u => u.id === id);
  }

  // Link Operations
  async getLinks(userId?: string | null): Promise<Link[]> {
    const db = await this.read();
    if (userId) {
      return db.links.filter(l => l.userId === userId);
    }
    // Return anonymous/guest links if no userId is provided (or let them see their links)
    return db.links;
  }

  async findLinkByCode(code: string): Promise<Link | undefined> {
    const db = await this.read();
    return db.links.find(l => l.shortCode === code || l.alias === code);
  }

  async createLink(link: Link): Promise<Link> {
    const db = await this.read();
    db.links.push(link);
    await this.write();
    return link;
  }

  async updateLink(id: string, updatedFields: Partial<Link>): Promise<Link | null> {
    const db = await this.read();
    const index = db.links.findIndex(l => l.id === id);
    if (index === -1) return null;
    db.links[index] = { ...db.links[index], ...updatedFields };
    await this.write();
    return db.links[index];
  }

  async deleteLink(id: string): Promise<boolean> {
    const db = await this.read();
    const lengthBefore = db.links.length;
    db.links = db.links.filter(l => l.id !== id);
    // Also delete associated click events
    db.clicks = db.clicks.filter(c => c.linkId !== id);
    await this.write();
    return db.links.length < lengthBefore;
  }

  // Click Operations
  async getClicks(userId?: string | null): Promise<ClickEvent[]> {
    const db = await this.read();
    if (userId) {
      // Find all link IDs belonging to this user
      const userLinkIds = db.links.filter(l => l.userId === userId).map(l => l.id);
      return db.clicks.filter(c => userLinkIds.includes(c.linkId));
    }
    return db.clicks;
  }

  async createClick(click: ClickEvent): Promise<ClickEvent> {
    const db = await this.read();
    db.clicks.push(click);
    
    // Also increment clicks count on the link itself
    const link = db.links.find(l => l.id === click.linkId);
    if (link) {
      link.clicks = (link.clicks || 0) + 1;
    }
    
    await this.write();
    return click;
  }

  // API Key Operations
  async getApiKeys(userId: string): Promise<ApiKey[]> {
    const db = await this.read();
    return db.apiKeys.filter(k => k.userId === userId);
  }

  async createApiKey(key: ApiKey): Promise<ApiKey> {
    const db = await this.read();
    db.apiKeys.push(key);
    await this.write();
    return key;
  }

  async deleteApiKey(id: string, userId: string): Promise<boolean> {
    const db = await this.read();
    const lengthBefore = db.apiKeys.length;
    db.apiKeys = db.apiKeys.filter(k => !(k.id === id && k.userId === userId));
    await this.write();
    return db.apiKeys.length < lengthBefore;
  }

  async validateApiKey(keyString: string): Promise<ApiKey | undefined> {
    const db = await this.read();
    return db.apiKeys.find(k => k.key === keyString);
  }
}

export const db = new Database();
