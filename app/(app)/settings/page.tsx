import { getMaskedAiSettings, AI_PROVIDERS, PROVIDER_LABELS, DEFAULT_MODELS } from "@/lib/ai-providers";
import { requireUserId } from "@/lib/auth";
import { PageSection, SectionHeader } from "@/app/components/ui";
import { Icon } from "@/app/components/Icons";
import SettingsClient, { RemoveKeyButton } from "./SettingsClient";
import DangerZone from "./DangerZone";
import { getDangerCounts } from "@/lib/v2";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const [settings, counts] = await Promise.all([getMaskedAiSettings(userId), getDangerCounts(userId)]);

  return (
    <div>
      <SectionHeader
        num="14"
        title="Settings"
        description="Your AI provider, and the danger zone for clearing content."
      />

      <PageSection title="AI provider connection">
        <div className="grid lg:grid-cols-[260px_1fr] gap-6 rounded-[28px] bg-card p-6 md:p-8">
          <div>
            <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center mb-3">
              <Icon name="key" className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-heading text-lg">How this works</h3>
            <p className="text-sm text-muted mt-1">
              Pick a provider, paste its API key, and optionally override the model. The key is stored server-side
              only and never sent back to your browser -- the field below shows just the last 4 characters once
              saved. Leaving the key field blank on a later save keeps whatever key is already stored (so you can
              change the model without re-pasting the key).
            </p>
          </div>
          <div>
            <SettingsClient settings={settings} providers={AI_PROVIDERS} labels={PROVIDER_LABELS} defaultModels={DEFAULT_MODELS} />
            <RemoveKeyButton hasKey={settings.hasKey} />
          </div>
        </div>
      </PageSection>

      <PageSection title="Danger zone">
        <DangerZone counts={counts} />
      </PageSection>
    </div>
  );
}
