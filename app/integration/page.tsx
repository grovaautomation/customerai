'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Copy, Check, ChevronDown, ChevronUp, Key, Zap, Globe, MapPin } from 'lucide-react';

interface ApiConfig {
  id: string;
  provider: string;
  apiKey: string | null;
  isActive: boolean;
  testPassed: boolean | null;
  testError: string | null;
}

const PROVIDERS = [
  {
    id: 'serpapi',
    name: 'SERP API',
    description: 'Google Search results',
    icon: Key,
    docs: 'https://serpapi.com',
    color: 'blue',
    accent: 'from-blue-500 to-blue-600',
  },
  {
    id: 'apify',
    name: 'Apify',
    description: 'Web scraping platform',
    icon: Zap,
    docs: 'https://apify.com',
    color: 'green',
    accent: 'from-green-500 to-green-600',
  },
  {
    id: 'foursquare',
    name: 'Foursquare',
    description: 'Places & locations',
    icon: MapPin,
    docs: 'https://foursquare.com',
    color: 'purple',
    accent: 'from-purple-500 to-purple-600',
  },
];

export default function IntegrationPage() {
  const [configs, setConfigs] = useState<Record<string, ApiConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/integration');
      const data = await res.json();
      if (data.success) {
        const configMap: Record<string, ApiConfig> = {};
        data.data.forEach((c: ApiConfig) => {
          configMap[c.provider] = c;
        });
        setConfigs(configMap);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (provider: string, currentState: boolean) => {
    setSaving(provider);
    try {
      await fetch('/api/integration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, is_active: !currentState }),
      });
      await fetchConfigs();
    } catch (error) {
      console.error('Failed to toggle:', error);
    } finally {
      setSaving(null);
    }
  };

  const handleSaveKey = async (provider: string, apiKey: string) => {
    setSaving(provider);
    try {
      await fetch('/api/integration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, api_key: apiKey }),
      });
      await fetchConfigs();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(null);
    }
  };

  const handleCopy = async (provider: string, apiKey: string | null) => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(provider);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTest = async (provider: string) => {
    setTesting(provider);
    try {
      const input = document.getElementById(`key-${provider}`) as HTMLInputElement;
      const apiKey = input?.value || configs[provider]?.apiKey;

      const res = await fetch('/api/integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, api_key: apiKey }),
      });
      const data = await res.json();

      if (data.test_passed) {
        alert(`✓ ${provider.toUpperCase()} API key is valid!`);
      } else {
        alert(`✗ ${provider.toUpperCase()} API test failed: ${data.test_error}`);
      }

      await fetchConfigs();
    } catch (error) {
      console.error('Failed to test:', error);
    } finally {
      setTesting(null);
    }
  };

  const maskKey = (key: string | null) => {
    if (!key) return '••••••••••••';
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Header
        title="API Integration"
        description="Configure external APIs for lead discovery"
      />

      {/* Mobile-friendly info banner */}
      <div className="mb-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-xs sm:text-sm text-amber-800 flex items-start gap-2">
          <span className="text-lg">💡</span>
          <span>Enable APIs below to use for lead discovery in campaigns.</span>
        </p>
      </div>

      {/* Provider Cards - Mobile First */}
      <div className="space-y-3 sm:space-y-4">
        {PROVIDERS.map((provider) => {
          const config = configs[provider.id];
          const isActive = config?.isActive ?? false;
          const hasKey = !!config?.apiKey;
          const testPassed = config?.testPassed;
          const Icon = provider.icon;
          const isExpanded = expanded[provider.id] ?? false;
          const isSavingThis = saving === provider.id;
          const isCopied = copied === provider.id;

          return (
            <div 
              key={provider.id}
              className={`bg-white rounded-2xl border-2 transition-all duration-200 ${
                isActive ? 'border-green-200 shadow-lg shadow-green-100' : 'border-slate-200'
              }`}
            >
              {/* Card Header - Always visible */}
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [provider.id]: !isExpanded }))}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${provider.accent} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  
                  {/* Info */}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 text-base sm:text-lg">{provider.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 truncate">{provider.description}</p>
                    
                    {/* Status badges - mobile friendly */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                          Inactive
                        </span>
                      )}
                      {hasKey && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                          testPassed ? 'bg-blue-100 text-blue-700' : testPassed === false ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {testPassed === true && '✓ '}
                          {testPassed === false && '✗ '}
                          {testPassed === null ? 'Not tested' : testPassed ? 'Connected' : 'Error'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chevron */}
                <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </div>
              </button>

              {/* Expandable Content */}
              {isExpanded && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 border-t border-slate-100 pt-4">
                  {/* API Key Section */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="password"
                          id={`key-${provider.id}`}
                          defaultValue={config?.apiKey ?? ''}
                          placeholder="Enter API key..."
                          className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                      </div>
                      {hasKey && (
                        <button
                          onClick={() => handleCopy(provider.id, config?.apiKey)}
                          className="px-3 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                          title="Copy API Key"
                        >
                          {isCopied ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <Copy className="w-5 h-5 text-slate-600" />
                          )}
                        </button>
                      )}
                    </div>
                    {hasKey && (
                      <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                        <span className="font-mono">{maskKey(config?.apiKey ?? null)}</span>
                        <button
                          onClick={() => handleCopy(provider.id, config?.apiKey)}
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {isCopied ? 'Copied!' : 'Copy'}
                        </button>
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById(`key-${provider.id}`) as HTMLInputElement;
                        handleSaveKey(provider.id, input.value);
                      }}
                      disabled={isSavingThis}
                      className="flex-1"
                    >
                      {isSavingThis ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⟳</span>
                          Saving...
                        </span>
                      ) : (
                        'Save Key'
                      )}
                    </Button>

                    {/* Enable/Disable Toggle */}
                    <button
                      onClick={() => handleToggle(provider.id, isActive)}
                      disabled={isSavingThis || !hasKey}
                      className={`relative px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-200' 
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isActive ? (
                          <>
                            <span>Disable</span>
                            <span className="w-2 h-2 rounded-full bg-white/50"></span>
                          </>
                        ) : (
                          <>
                            <span>Enable</span>
                            <span className="w-2 h-2 rounded-full bg-white/50"></span>
                          </>
                        )}
                      </span>
                    </button>
                  </div>

                  {/* Docs Link */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <a
                      href={provider.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      View Documentation
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* How It Works - Mobile friendly */}
      <Card className="mt-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold">?</span>
          </span>
          How It Works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center">1</span>
            <div>
              <p className="font-medium text-slate-900 text-sm">Enable APIs</p>
              <p className="text-xs text-slate-500 mt-0.5">Activate at least one API provider above</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center">2</span>
            <div>
              <p className="font-medium text-slate-900 text-sm">Create Campaign</p>
              <p className="text-xs text-slate-500 mt-0.5">Start a search with keyword and region</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center">3</span>
            <div>
              <p className="font-medium text-slate-900 text-sm">Discover Leads</p>
              <p className="text-xs text-slate-500 mt-0.5">Worker uses enabled APIs to find leads</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center">4</span>
            <div>
              <p className="font-medium text-slate-900 text-sm">Validate</p>
              <p className="text-xs text-slate-500 mt-0.5">WhatsApp numbers are validated</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
