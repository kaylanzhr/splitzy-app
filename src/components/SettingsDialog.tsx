import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { actions, type Settings } from "@/lib/splitzy-store";
import { Zap } from "lucide-react";
import { toast } from "sonner";

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  settings: Settings;
}) {
  const [url, setUrl] = useState(settings.n8nWebhookUrl);

  useEffect(() => {
    if (open) setUrl(settings.n8nWebhookUrl);
  }, [open, settings.n8nWebhookUrl]);

  function save() {
    actions.saveSettings({ n8nWebhookUrl: url.trim() });
    toast.success("Saved!");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-mint text-mint-foreground">
              <Zap className="h-4 w-4" />
            </span>
            Automation
          </DialogTitle>
          <DialogDescription>
            Connect an n8n webhook to ship balance summaries to Slack, Telegram, email — anywhere.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>n8n Webhook URL</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-n8n.app/webhook/abc123"
            />
            <p className="text-xs text-muted-foreground">
              In n8n: create a Workflow → Webhook node (POST) → copy the production URL.
            </p>
          </div>

          <div className="rounded-2xl bg-secondary/60 p-3 text-xs text-muted-foreground">
            We'll send a JSON payload with group, total, balances, and suggested transfers.
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} className="bg-gradient-warm text-primary-foreground rounded-full px-6">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
