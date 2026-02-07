import React, { useState } from "react";
import type { ProviderId, ProviderKeys } from "../providers/types";
import { PROVIDERS, PROVIDER_CONFIGS, PROVIDER_IDS } from "../providers/registry";

interface SettingsPanelProps {
  providerKeys: ProviderKeys;
  activeProvider: ProviderId;
  onSaveKey: (providerId: ProviderId, key: string) => void;
  onRemoveKey: (providerId: ProviderId) => void;
  onSetActiveProvider: (providerId: ProviderId) => void;
  onClose: () => void;
}

type TestStatus = "idle" | "testing" | "success" | "error";

export default function SettingsPanel({
  providerKeys,
  activeProvider,
  onSaveKey,
  onRemoveKey,
  onSetActiveProvider,
  onClose,
}: SettingsPanelProps) {
  const [selectedTab, setSelectedTab] = useState<ProviderId>(activeProvider);
  const [inputKeys, setInputKeys] = useState<ProviderKeys>({ ...providerKeys });
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testMessage, setTestMessage] = useState("");

  const config = PROVIDER_CONFIGS[selectedTab];
  const savedKey = providerKeys[selectedTab];
  const hasSavedKey = savedKey.length > 0;
  const maskedKey = hasSavedKey ? savedKey.slice(0, 8) + "..." : "";

  const handleTabClick = (id: ProviderId) => {
    setSelectedTab(id);
    onSetActiveProvider(id);
    setTestStatus("idle");
    setTestMessage("");
  };

  const handleSave = () => {
    const key = inputKeys[selectedTab].trim();
    if (key) {
      onSaveKey(selectedTab, key);
      setTestStatus("idle");
      setTestMessage("Key saved successfully.");
    }
  };

  const handleTest = async () => {
    const key = inputKeys[selectedTab].trim() || savedKey;
    if (!key) {
      setTestStatus("error");
      setTestMessage("Enter an API key first.");
      return;
    }

    setTestStatus("testing");
    setTestMessage("Testing connection...");

    try {
      await PROVIDERS[selectedTab].testConnection(key);
      setTestStatus("success");
      setTestMessage("Connection successful!");
    } catch (err) {
      setTestStatus("error");
      setTestMessage(
        err instanceof Error ? err.message : "Connection failed."
      );
    }
  };

  const handleRemove = () => {
    onRemoveKey(selectedTab);
    setInputKeys((prev) => ({ ...prev, [selectedTab]: "" }));
    setTestStatus("idle");
    setTestMessage("Key removed.");
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>Settings</h3>
        <button className="icon-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="settings-section">
        <label className="settings-label">AI Provider</label>
        <div className="provider-tabs">
          {PROVIDER_IDS.map((id) => (
            <button
              key={id}
              className={`provider-tab ${selectedTab === id ? "active" : ""}`}
              onClick={() => handleTabClick(id)}
            >
              {providerKeys[id] && <span className="key-dot" />}
              {PROVIDER_CONFIGS[id].name}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <label className="settings-label">{config.name} API Key</label>
        <p className="settings-help">
          Get a key at{" "}
          <a
            href={config.helpUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {config.helpLabel}
          </a>
        </p>

        {hasSavedKey && (
          <div className="saved-key-display">
            Current key: <code>{maskedKey}</code>
          </div>
        )}

        <input
          type="password"
          className="key-input"
          placeholder={config.keyPlaceholder}
          value={inputKeys[selectedTab]}
          onChange={(e) =>
            setInputKeys((prev) => ({ ...prev, [selectedTab]: e.target.value }))
          }
        />

        <div className="settings-actions">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!inputKeys[selectedTab].trim()}
          >
            Save Key
          </button>
          <button className="btn btn-secondary" onClick={handleTest}>
            Test Connection
          </button>
          {hasSavedKey && (
            <button className="btn btn-danger" onClick={handleRemove}>
              Remove Key
            </button>
          )}
        </div>

        {testMessage && (
          <div className={`test-status test-${testStatus}`}>
            <span className="status-dot" />
            {testMessage}
          </div>
        )}
      </div>

      <div className="settings-section">
        <p className="settings-note">{config.privacyNote}</p>
      </div>
    </div>
  );
}
