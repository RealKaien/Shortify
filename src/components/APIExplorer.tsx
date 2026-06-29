import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Copy, Check, Play, Send, Sparkles, BookOpen, Key, Info, HelpCircle } from 'lucide-react';

interface APIExplorerProps {
  apiKeys: string[];
}

type TabType = 'curl' | 'node' | 'python';

export default function APIExplorer({ apiKeys }: APIExplorerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('curl');
  const [copied, setCopied] = useState(false);
  
  // Playground state
  const [playgroundApiKey, setPlaygroundApiKey] = useState(apiKeys[0] || 'sh_live_89a74bf28c03e8da1f6590bc2a1389de');
  const [playgroundUrl, setPlaygroundUrl] = useState('https://github.com/facebook/react');
  const [playgroundAlias, setPlaygroundAlias] = useState('react-repo');
  const [playgroundExpiry, setPlaygroundExpiry] = useState('');
  
  // Playground Output
  const [loading, setLoading] = useState(false);
  const [responseOutput, setResponseOutput] = useState<any>(null);

  const snippets = {
    curl: `curl -X POST "https://api.shortify.co/v1/links" \\
  -H "Authorization: Bearer ${playgroundApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "longUrl": "${playgroundUrl}",
    "alias": "${playgroundAlias}"${playgroundExpiry ? `, \n    "expiryDate": "${playgroundExpiry}"` : ''}
  }'`,
    node: `const response = await fetch('https://api.shortify.co/v1/links', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${playgroundApiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    longUrl: '${playgroundUrl}',
    alias: '${playgroundAlias}'${playgroundExpiry ? `, \n    expiryDate: '${playgroundExpiry}'` : ''}
  })
});

const data = await response.json();
console.log(data);`,
    python: `import requests

headers = {
    'Authorization': 'Bearer ${playgroundApiKey}',
    'Content-Type': 'application/json'
}

payload = {
    'longUrl': '${playgroundUrl}',
    'alias': '${playgroundAlias}'${playgroundExpiry ? `, \n    'expiryDate': '${playgroundExpiry}'` : ''}
}

response = requests.post(
    'https://api.shortify.co/v1/links', 
    headers=headers, 
    json=payload
)

print(response.json())`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runPlaygroundRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseOutput(null);

    // Simulate API Response latency
    setTimeout(() => {
      setLoading(false);
      const generatedCode = playgroundAlias.trim() || Math.random().toString(36).substring(2, 8);
      
      setResponseOutput({
        status: 'success',
        code: 201,
        message: 'Programmatic short link created successfully',
        data: {
          id: `link_${Math.random().toString(36).substring(2, 10)}`,
          shortCode: generatedCode,
          shortUrl: `https://shrt.dev/${generatedCode}`,
          longUrl: playgroundUrl,
          alias: playgroundAlias || null,
          isProtected: false,
          clicks: 0,
          expiryDate: playgroundExpiry || null,
          createdAt: new Date().toISOString()
        }
      });
    }, 1200);
  };

  return (
    <div id="developer-api-panel" className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-[24px] border border-[rgba(255,255,255,0.65)] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-[14px]">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-heading font-display">Developer API Console</h2>
            <p className="text-xs text-secondary-text">Integrate link redirection and metadata programmatically.</p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold text-primary font-mono bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-full">
          v1.0.4 Stable docs
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Interactive API Playground */}
        <div className="bg-white rounded-[28px] border border-[rgba(255,255,255,0.65)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Developer Sandbox</span>
            <h3 className="text-lg font-bold text-heading font-display mt-0.5">API Request Sandbox</h3>
            <p className="text-xs text-secondary-text mt-1 leading-relaxed">Fill out parameters to test the link shortening request and witness real-time schema outputs.</p>
          </div>

          <form onSubmit={runPlaygroundRequest} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-heading">API Authorization Token</label>
                <input
                  type="text"
                  required
                  value={playgroundApiKey}
                  onChange={(e) => setPlaygroundApiKey(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[12px] border border-gray-200 bg-gray-50/50 text-xs font-mono outline-none text-heading"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-heading">Long URL (Target)</label>
                <input
                  type="text"
                  required
                  value={playgroundUrl}
                  onChange={(e) => setPlaygroundUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[12px] border border-gray-200 bg-gray-50/50 text-xs outline-none text-heading"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-heading">Desired Custom Alias</label>
                <input
                  type="text"
                  value={playgroundAlias}
                  onChange={(e) => setPlaygroundAlias(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[12px] border border-gray-200 bg-gray-50/50 text-xs outline-none text-heading font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-heading">Link Expiration Date</label>
                <input
                  type="date"
                  value={playgroundExpiry}
                  onChange={(e) => setPlaygroundExpiry(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[12px] border border-gray-200 bg-gray-50/50 text-xs outline-none text-heading cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 bg-heading hover:bg-black text-white text-xs font-bold py-3.5 rounded-[18px] shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Play className="h-4 w-4 animate-spin" />
                  Compiling Programmatic Payload...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 text-primary" />
                  Send Test API Request
                </>
              )}
            </button>
          </form>

          {/* Real Sandbox Response Console */}
          <div className="space-y-1 pt-4 border-t border-gray-100">
            <span className="text-[10px] uppercase font-bold text-muted-text block">API HTTP Response Body</span>
            <div className="bg-heading/95 text-emerald-400 p-4 rounded-[18px] font-mono text-[11px] overflow-x-auto min-h-[140px] max-h-[180px] scrollbar-thin">
              {loading ? (
                <span className="text-gray-400 animate-pulse">POST /v1/links HTTP/1.1... Resolving API headers...</span>
              ) : responseOutput ? (
                <pre>{JSON.stringify(responseOutput, null, 2)}</pre>
              ) : (
                <span className="text-gray-500">// Configure parameter scopes and tap "Send Test API Request" to preview response.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Code Snippets & SDK Guides */}
        <div className="bg-white rounded-[28px] border border-[rgba(255,255,255,0.65)] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Integration Specs</span>
              {/* Language toggler */}
              <div className="flex bg-gray-100 rounded-[14px] p-0.5 border border-gray-200">
                {(['curl', 'node', 'python'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-[10px] text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'bg-white text-heading shadow-sm'
                        : 'text-secondary-text hover:text-heading'
                    }`}
                  >
                    {tab === 'node' ? 'NodeJS' : tab}
                  </button>
                ))}
              </div>
            </div>
            <h3 className="text-lg font-bold text-heading font-display mt-2">Programmatic Code Snippets</h3>
            <p className="text-xs text-secondary-text mt-1 leading-relaxed">Embed our high-speed shortening engine directly into your build systems, webhooks, or automation hooks.</p>
          </div>

          {/* Snippet Block */}
          <div className="relative group flex-1 flex flex-col justify-between">
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              onClick={handleCopy}
              className="absolute right-3 top-3 bg-white/10 hover:bg-white/20 text-white rounded-lg p-2 transition-all cursor-pointer z-10 opacity-70 group-hover:opacity-100 flex items-center justify-center h-8.5 w-8.5"
              title="Copy snippet"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.div
                    key="copied"
                    initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.5, rotate: 15, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Check className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Copy className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <div className="bg-heading text-white p-5 rounded-[22px] font-mono text-xs overflow-x-auto select-all leading-relaxed whitespace-pre h-[280px] border border-gray-800 scrollbar-thin">
              {snippets[activeTab]}
            </div>
          </div>

          {/* Quick API references */}
          <div className="bg-gray-50/50 rounded-[20px] p-4 border border-gray-100 grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-heading block">Rate Limits</span>
              <span className="text-secondary-text text-[11px]">100 requests per minute per key. Custom domains bypass rules.</span>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-heading block">Error Schema</span>
              <span className="text-secondary-text text-[11px]">Returns standard RFC 7807 problem details in JSON payloads.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
