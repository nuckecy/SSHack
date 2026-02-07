import { useState } from "react";
import type { ProviderId, ProviderKeys } from "../providers/types";
import { PROVIDERS, PROVIDER_CONFIGS, PROVIDER_IDS } from "../providers/registry";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

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

  const handleTabChange = (value: string) => {
    const id = value as ProviderId;
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
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      <div className="settings-section">
        <label className="settings-label">AI Provider</label>
        <Tabs value={selectedTab} onValueChange={handleTabChange}>
          <TabsList className="w-full">
            {PROVIDER_IDS.map((id) => (
              <TabsTrigger key={id} value={id} className="flex-1 gap-1.5">
                {providerKeys[id] && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--cds-support-success)] shrink-0" />
                )}
                {PROVIDER_CONFIGS[id].name}
              </TabsTrigger>
            ))}
          </TabsList>

          {PROVIDER_IDS.map((id) => (
            <TabsContent key={id} value={id} />
          ))}
        </Tabs>
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

        <Input
          type="password"
          placeholder={config.keyPlaceholder}
          value={inputKeys[selectedTab]}
          onChange={(e) =>
            setInputKeys((prev) => ({ ...prev, [selectedTab]: e.target.value }))
          }
          className="mb-3"
        />

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleSave}
            disabled={!inputKeys[selectedTab].trim()}
          >
            Save Key
          </Button>
          <Button variant="outline" onClick={handleTest}>
            Test Connection
          </Button>
          {hasSavedKey && (
            <Button variant="destructive" onClick={handleRemove}>
              Remove Key
            </Button>
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
