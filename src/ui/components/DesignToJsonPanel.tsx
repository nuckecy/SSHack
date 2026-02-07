import React, { useState, useEffect, useRef, useCallback } from "react";
import Icon from "./Icon";
import type { SelectionData } from "../providers/types";

interface DesignToJsonPanelProps {
  selectionData: SelectionData | null;
}

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "json-number";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "json-key" : "json-string";
      } else if (/true|false/.test(match)) {
        cls = "json-boolean";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return '<span class="' + cls + '">' + match + "</span>";
    }
  );
}

export default function DesignToJsonPanel({ selectionData }: DesignToJsonPanelProps) {
  const [json, setJson] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [nodeCount, setNodeCount] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [copied, setCopied] = useState(false);
  const listenerRef = useRef<((event: MessageEvent) => void) | null>(null);

  // Clean up listener on unmount
  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener("message", listenerRef.current);
      }
    };
  }, []);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setJson(null);
    setCopied(false);

    // Remove previous listener if any
    if (listenerRef.current) {
      window.removeEventListener("message", listenerRef.current);
    }

    const handler = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (msg?.type === "serialize-to-json-result") {
        window.removeEventListener("message", handler);
        listenerRef.current = null;
        setIsGenerating(false);
        if (msg.error) {
          setJson(null);
        } else {
          setJson(JSON.stringify(msg.data, null, 2));
          setNodeCount(msg.nodeCount || 0);
          setTruncated(msg.truncated || false);
        }
      }
    };

    listenerRef.current = handler;
    window.addEventListener("message", handler);
    parent.postMessage({ pluginMessage: { type: "serialize-to-json" } }, "*");
  }, []);

  const handleCopy = useCallback(() => {
    if (!json) return;
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [json]);

  const hasSelection = selectionData !== null;

  return (
    <div className="json-panel">
      <div className="json-panel-header">
        <div className="json-panel-title-row">
          <Icon name="code" size={16} className="json-panel-icon" />
          <h3 className="json-panel-title">Design to JSON</h3>
        </div>

        <div className="json-panel-actions">
          <button
            className="btn btn-primary btn-sm"
            disabled={!hasSelection || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? "Generating..." : "Generate JSON"}
          </button>
          <button
            className="btn btn-secondary btn-sm"
            disabled={!json}
            onClick={handleCopy}
          >
            <Icon name={copied ? "check" : "copy"} size={12} />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {json && (
          <div className="json-panel-meta">
            {nodeCount} node{nodeCount !== 1 ? "s" : ""} serialized
            {truncated && <span className="json-panel-warning"> — tree truncated at 5000 nodes</span>}
          </div>
        )}
      </div>

      <div className="json-panel-viewer">
        {!hasSelection && !json && (
          <div className="json-panel-empty">
            <Icon name="code" size={32} className="json-panel-empty-icon" />
            <p>Select a layer on canvas, then generate JSON</p>
          </div>
        )}

        {hasSelection && !json && !isGenerating && (
          <div className="json-panel-empty">
            <p>Click <strong>Generate JSON</strong> to serialize the selected layer</p>
          </div>
        )}

        {isGenerating && (
          <div className="json-panel-empty">
            <div className="typing-indicator">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
            <p>Serializing node tree...</p>
          </div>
        )}

        {json && (
          <pre
            className="json-pre"
            dangerouslySetInnerHTML={{ __html: syntaxHighlight(json) }}
          />
        )}
      </div>
    </div>
  );
}
