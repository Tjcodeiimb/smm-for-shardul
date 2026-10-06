"use client";

import { useState } from "react";
import { saveAiSettingsAction, clearAiKeyAction } from "@/lib/ai-settings-actions";

type Provider = string;

export default function SettingsClient({
  settings,
  providers,
  labels,
  defaultModels,
}: {
  settings: { provider: Provider; model: string; customEndpoint: string; hasKey: boolean; keyPreview: string };
  providers: readonly string[];
  labels: Record<string, string>;
  defaultModels: Record<string, string>;
}) {
  const [provider, setProvider] = useState(settings.provider);
  const [saved, setSaved] = useState(false);

  const inputClass = "w-full rounded-lg border bg-surface text-foreground text-sm px-3 py-2.5";
  const labelClass = "text-xs font-medium text-muted mb-1.5 block";

  return (
    <form
      action={async (fd) => {
        await saveAiSettingsAction(fd);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }}
      className="space-y-5"
    >
      <div>
        <label className={labelClass}>Provider</label>
        <select
          name="provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className={inputClass}
        >
          {providers.map((p) => (
            <option key={p} value={p}>
              {labels[p]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>
          API key {settings.hasKey && provider === settings.provider ? `(currently set: ${settings.keyPreview})` : ""}
        </label>
        <input
          type="password"
          name="apiKey"
          placeholder={settings.hasKey && provider === settings.provider ? "Leave blank to keep current key" : "Paste API key"}
          className={inputClass}
          autoComplete="off"
        />
      </div>

      <div>
        <label className={labelClass}>
          Model <span className="text-muted">(optional -- default: {defaultModels[provider] || "set your own"})</span>
        </label>
        <input
          name="model"
          defaultValue={provider === settings.provider ? settings.model : ""}
          placeholder={defaultModels[provider] || "model name"}
          className={inputClass}
        />
      </div>

      {provider === "custom" && (
        <div>
          <label className={labelClass}>Custom endpoint URL (OpenAI-compatible chat completions)</label>
          <input
            name="customEndpoint"
            defaultValue={settings.customEndpoint}
            placeholder="https://your-endpoint.example.com/v1/chat/completions"
            className={inputClass}
          />
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-5 py-2.5">
          Save connection
        </button>
        {saved && <span className="text-xs text-accent">Saved ✓</span>}
      </div>
    </form>
  );
}

export function RemoveKeyButton({ hasKey }: { hasKey: boolean }) {
  if (!hasKey) return null;
  return (
    <form action={clearAiKeyAction} className="mt-4">
      <button className="text-xs text-red-700/70 hover:text-red-700">Remove stored key</button>
    </form>
  );
}
