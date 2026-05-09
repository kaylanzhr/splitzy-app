import { useEffect, useMemo, useState } from "react";
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
import { actions, computeBalances, settleUp, useStore, type Group } from "@/lib/splitzy-store";
import { Send, Mail } from "lucide-react";
import { toast } from "sonner";

export function SendSummaryDialog({
  open,
  onOpenChange,
  group,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  group: Group;
}) {
  const store = useStore();
  const [emails, setEmails] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const init: Record<string, string> = {};
      group.members.forEach((m) => (init[m.id] = m.email || ""));
      setEmails(init);
    }
  }, [open, group.id, group.members]);

  const balances = useMemo(() => computeBalances(group, store.expenses), [group, store.expenses]);
  const txns = useMemo(() => settleUp(balances, group.members), [balances, group]);
  const total = store.expenses
    .filter((e) => e.groupId === group.id)
    .reduce((s, e) => s + e.amount, 0);

  function buildBody() {
    const lines: string[] = [];
    lines.push(`Hi! Here's the latest ${group.name} ${group.emoji} summary.`);
    lines.push("");
    lines.push(`Total spent: ${group.currency}${total.toFixed(2)}`);
    lines.push("");
    lines.push("Balances:");
    group.members.forEach((m) => {
      const b = balances[m.id] || 0;
      const sign = b > 0.01 ? "is owed" : b < -0.01 ? "owes" : "is settled";
      lines.push(`  ${m.emoji} ${m.name} — ${sign} ${group.currency}${Math.abs(b).toFixed(2)}`);
    });
    lines.push("");
    if (txns.length === 0) {
      lines.push("Everyone is squared up! 🎉");
    } else {
      lines.push("Suggested settle-up:");
      txns.forEach((t) => {
        lines.push(`  ${t.from.name} → ${t.to.name}: ${group.currency}${t.amount.toFixed(2)}`);
      });
    }
    lines.push("");
    lines.push("— Sent from Splitzy");
    return lines.join("\n");
  }

  function send() {
    actions.updateMemberEmails(group.id, emails);

    const recipients = Object.values(emails)
      .map((e) => e.trim())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (recipients.length === 0) {
      toast.error("Add at least one valid email.");
      return;
    }

    const subject = `${group.name} ${group.emoji} — expense summary`;
    const body = buildBody();
    const mailto = `mailto:${recipients.join(",")}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    toast.success(`Opening your email app for ${recipients.length} recipient${recipients.length > 1 ? "s" : ""} ✉️`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-mint text-mint-foreground">
              <Mail className="h-4 w-4" />
            </span>
            Send summary
          </DialogTitle>
          <DialogDescription>
            Add an email for each member — we'll draft a notification to everyone at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {group.members.map((m) => (
            <div key={m.id} className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <span className="text-lg">{m.emoji}</span> {m.name}
              </Label>
              <Input
                type="email"
                value={emails[m.id] || ""}
                onChange={(e) => setEmails((s) => ({ ...s, [m.id]: e.target.value }))}
                placeholder={`${m.name.toLowerCase()}@example.com`}
              />
            </div>
          ))}

          <div className="rounded-2xl bg-secondary/60 p-3 text-xs text-muted-foreground">
            Your default email app will open with the summary pre-filled, ready to send.
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={send} className="bg-gradient-warm text-primary-foreground rounded-full px-6">
            <Send className="h-4 w-4 mr-1.5" /> Send notifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
