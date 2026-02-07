import React, { useState, useCallback, useEffect, useRef } from "react";
import ChatView from "./components/ChatView";
import SettingsPanel from "./components/SettingsPanel";
import DesignToJsonPanel from "./components/DesignToJsonPanel";
import Icon from "./components/Icon";
import type { Message, ProviderId, ProviderKeys, SelectionData } from "./providers/types";
import { PROVIDER_IDS } from "./providers/registry";

type ActiveView = "chat" | "json" | "settings";

const STORAGE_PREFIX = "ss_key_";
const STORAGE_ACTIVE = "ss_active_provider";
const OLD_STORAGE_KEY = "ss_gemini_key";

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
  const [activeView, setActiveView] = useState<ActiveView>("chat");
  const [providerKeys, setProviderKeys] = useState<ProviderKeys>(EMPTY_KEYS);
  const [activeProvider, setActiveProvider] = useState<ProviderId>("gemini");
  const [selectionData, setSelectionData] = useState<SelectionData | null>(null);
  const [additionalSelectionCount, setAdditionalSelectionCount] = useState(0);

  // Ref to allow ChatView's chip handler to access current state
  const chipQueryRef = useRef<string | null>(null);
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
      if (msg?.type === "selection-changed") {
        if (msg.data) {
          setSelectionData(msg.data);
          setAdditionalSelectionCount(msg.data.additionalCount || 0);
        } else {
          setSelectionData(null);
          setAdditionalSelectionCount(0);
        }
      }
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
    setSelectionData(null);
    setAdditionalSelectionCount(0);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <Icon name="shield" size={20} className="header-logo-icon" />
          <span className="header-title">System Sidekick</span>
          <span className={`status-badge ${hasApiKey ? "active" : "inactive"}`}>
            <span className="status-badge-dot" />
            {hasApiKey ? "AI" : "Offline"}
          </span>
        </div>
        <div className="header-right">
          <div className="header-tabs">
            <button
              className={`header-tab${activeView === "chat" ? " active" : ""}`}
              onClick={() => setActiveView("chat")}
              title="Chat"
            >
              <Icon name="chat" size={14} />
            </button>
            <button
              className={`header-tab${activeView === "json" ? " active" : ""}`}
              onClick={() => setActiveView("json")}
              title="Design to JSON"
            >
              <Icon name="code" size={14} />
            </button>
            <button
              className={`header-tab${activeView === "settings" ? " active" : ""}`}
              onClick={() => setActiveView("settings")}
              title="Settings"
            >
              <Icon name="settings" size={14} />
            </button>
          </div>
          {activeView === "chat" && (
            <button className="icon-btn" onClick={handleClearChat} title="Clear chat">
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      </header>

      {activeView === "settings" ? (
        <SettingsPanel
          providerKeys={providerKeys}
          activeProvider={activeProvider}
          onSaveKey={handleSaveKey}
          onRemoveKey={handleRemoveKey}
          onSetActiveProvider={handleSetActiveProvider}
          onClose={() => setActiveView("chat")}
        />
      ) : activeView === "json" ? (
        <DesignToJsonPanel selectionData={selectionData} />
      ) : (
        <div className="app-body">
          <ChatView
            messages={messages}
            setMessages={setMessages}
            apiKey={activeKey}
            activeProvider={activeProvider}
            chipQueryRef={chipQueryRef}
            chipTrigger={chipTrigger}
            selectionData={selectionData}
            additionalSelectionCount={additionalSelectionCount}
            onViewJson={() => setActiveView("json")}
          />
        </div>
      )}
    </div>
  );
}
