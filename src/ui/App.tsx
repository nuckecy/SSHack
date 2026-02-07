import React, { useState, useCallback, useEffect } from "react";
import ChatView from "./components/ChatView";
import SettingsPanel from "./components/SettingsPanel";
import SuggestionChips from "./components/SuggestionChips";
import Icon from "./components/Icon";
import type { Message, ProviderId, ProviderKeys } from "./providers/types";
import { PROVIDER_CONFIGS, PROVIDER_IDS } from "./providers/registry";

const STORAGE_PREFIX = "ss_key_";
const STORAGE_ACTIVE = "ss_active_provider";
const OLD_STORAGE_KEY = "ss_gemini_key";

const WIDTH_PANEL_OPEN = 670;
const WIDTH_PANEL_CLOSED = 420;

const EMPTY_KEYS: ProviderKeys = { gemini: "", anthropic: "", openai: "" };

// Safe localStorage wrapper — Figma's iframe uses data: URLs where storage is disabled
function safeGetItem(key: string): string {
  try { return localStorage.getItem(key) || ""; } catch { return ""; }
}
function safeSetItem(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* ignored */ }
}
function safeRemoveItem(key: string): void {
  try { localStorage.removeItem(key); } catch { /* ignored */ }
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [providerKeys, setProviderKeys] = useState<ProviderKeys>(EMPTY_KEYS);
  const [activeProvider, setActiveProvider] = useState<ProviderId>("gemini");
  const [showPanel, setShowPanel] = useState(true);

  // Ref to allow ChatView's chip handler to access current state
  const chipQueryRef = React.useRef<string | null>(null);
  const [chipTrigger, setChipTrigger] = useState(0);

  // Load all provider keys and active provider on mount
  useEffect(() => {
    // Try localStorage first for each key
    const localKeys: ProviderKeys = { ...EMPTY_KEYS };
    let foundAny = false;

    // Migration: check for old ss_gemini_key
    const oldKey = safeGetItem(OLD_STORAGE_KEY);
    if (oldKey) {
      localKeys.gemini = oldKey;
      foundAny = true;
      // Migrate to new storage key
      safeSetItem(STORAGE_PREFIX + "gemini", oldKey);
      safeRemoveItem(OLD_STORAGE_KEY);
      parent.postMessage({ pluginMessage: { type: "storage-set", key: STORAGE_PREFIX + "gemini", value: oldKey } }, "*");
      parent.postMessage({ pluginMessage: { type: "storage-delete", key: OLD_STORAGE_KEY } }, "*");
    }

    for (const id of PROVIDER_IDS) {
      const val = safeGetItem(STORAGE_PREFIX + id);
      if (val) {
        localKeys[id] = val;
        foundAny = true;
      }
    }

    const localActive = safeGetItem(STORAGE_ACTIVE) as ProviderId;
    if (localActive && PROVIDER_IDS.includes(localActive)) {
      setActiveProvider(localActive);
    }

    if (foundAny) {
      setProviderKeys(localKeys);
    }

    // Also request from Figma clientStorage as fallback
    const handler = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (msg?.type === "storage-get-result") {
        if (msg.key === STORAGE_ACTIVE) {
          const val = msg.value as ProviderId;
          if (val && PROVIDER_IDS.includes(val)) {
            setActiveProvider(val);
          }
        }
        for (const id of PROVIDER_IDS) {
          if (msg.key === STORAGE_PREFIX + id && msg.value) {
            setProviderKeys((prev) => ({ ...prev, [id]: msg.value }));
          }
        }
        // Migration from Figma clientStorage
        if (msg.key === OLD_STORAGE_KEY && msg.value) {
          setProviderKeys((prev) => ({ ...prev, gemini: msg.value }));
          parent.postMessage({ pluginMessage: { type: "storage-set", key: STORAGE_PREFIX + "gemini", value: msg.value } }, "*");
          parent.postMessage({ pluginMessage: { type: "storage-delete", key: OLD_STORAGE_KEY } }, "*");
        }
      }
    };
    window.addEventListener("message", handler);

    // Request all keys from Figma clientStorage
    for (const id of PROVIDER_IDS) {
      parent.postMessage({ pluginMessage: { type: "storage-get", key: STORAGE_PREFIX + id } }, "*");
    }
    parent.postMessage({ pluginMessage: { type: "storage-get", key: STORAGE_ACTIVE } }, "*");
    // Also check for old key to migrate
    parent.postMessage({ pluginMessage: { type: "storage-get", key: OLD_STORAGE_KEY } }, "*");

    return () => window.removeEventListener("message", handler);
  }, []);

  const activeKey = providerKeys[activeProvider];
  const hasApiKey = activeKey.length > 0;

  const handleSaveKey = useCallback((providerId: ProviderId, key: string) => {
    const storageKey = STORAGE_PREFIX + providerId;
    safeSetItem(storageKey, key);
    parent.postMessage({ pluginMessage: { type: "storage-set", key: storageKey, value: key } }, "*");
    setProviderKeys((prev) => ({ ...prev, [providerId]: key }));
  }, []);

  const handleRemoveKey = useCallback((providerId: ProviderId) => {
    const storageKey = STORAGE_PREFIX + providerId;
    safeRemoveItem(storageKey);
    parent.postMessage({ pluginMessage: { type: "storage-delete", key: storageKey } }, "*");
    setProviderKeys((prev) => ({ ...prev, [providerId]: "" }));
  }, []);

  const handleSetActiveProvider = useCallback((providerId: ProviderId) => {
    setActiveProvider(providerId);
    safeSetItem(STORAGE_ACTIVE, providerId);
    parent.postMessage({ pluginMessage: { type: "storage-set", key: STORAGE_ACTIVE, value: providerId } }, "*");
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const handleTogglePanel = useCallback(() => {
    setShowPanel((prev) => {
      const next = !prev;
      const width = next ? WIDTH_PANEL_OPEN : WIDTH_PANEL_CLOSED;
      parent.postMessage({ pluginMessage: { type: "resize", width, height: 640 } }, "*");
      return next;
    });
  }, []);

  const handleChipClick = useCallback((query: string) => {
    chipQueryRef.current = query;
    setChipTrigger((n) => n + 1);
  }, []);

  const providerDisplayName = PROVIDER_CONFIGS[activeProvider].name;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <button
            className="icon-btn"
            onClick={handleTogglePanel}
            title={showPanel ? "Hide guide panel" : "Show guide panel"}
          >
            <Icon name="menu" size={16} />
          </button>
          <Icon name="shield" size={20} className="header-logo-icon" />
          <span className="header-title">System Sidekick</span>
        </div>
        <div className="header-right">
          <span className="header-badge">WCAG 2.2</span>
          <span className={`ai-badge ${hasApiKey ? "active" : "inactive"}`}>
            {hasApiKey ? "\u2713" : "\u2715"} {providerDisplayName}
          </span>
        </div>
      </header>

      {showSettings ? (
        <SettingsPanel
          providerKeys={providerKeys}
          activeProvider={activeProvider}
          onSaveKey={handleSaveKey}
          onRemoveKey={handleRemoveKey}
          onSetActiveProvider={handleSetActiveProvider}
          onClose={() => setShowSettings(false)}
        />
      ) : (
        <div className="app-body">
          {showPanel && (
            <aside className="side-panel">
              <div className="side-panel-content">
                <div className="side-panel-welcome">
                  <strong>Welcome to System Sidekick!</strong>
                  <p>
                    Your WCAG 2.2 accessibility assistant.{" "}
                    {hasApiKey
                      ? `AI-powered responses via ${providerDisplayName} are enabled.`
                      : "Running in keyword search mode. Add an API key in Settings to enable AI responses."}
                  </p>
                </div>
                <div className="side-panel-section">
                  <span className="side-panel-label">Try asking about:</span>
                  <SuggestionChips onChipClick={handleChipClick} />
                </div>
              </div>
              <div className="side-panel-footer">
                <button
                  className="icon-btn"
                  onClick={() => setShowSettings(!showSettings)}
                  title="Settings"
                >
                  <Icon name="settings" size={16} />
                </button>
                <button
                  className="icon-btn"
                  onClick={handleClearChat}
                  title="Clear chat"
                >
                  <Icon name="delete" size={16} />
                </button>
              </div>
            </aside>
          )}
          <ChatView
            messages={messages}
            setMessages={setMessages}
            apiKey={activeKey}
            activeProvider={activeProvider}
            chipQueryRef={chipQueryRef}
            chipTrigger={chipTrigger}
          />
        </div>
      )}
    </div>
  );
}
