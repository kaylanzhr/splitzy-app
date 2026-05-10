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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  actions,
  formatMoney,
  formatThousands,
  parseThousands,
  type Group,
} from "@/lib/splitzy-store";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function RecordPaymentDialog({
  open,
  onOpenChange,
  group,
  preset,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  group: Group;
  preset?: { fromId: string; toId: string; amount: number } | null;
}) {
  const [fromId, setFromId] = useState(group.members[0]?.id || "");
  const [toId, setToId] = useState(group.members[1]?.id || "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [payAll, setPayAll] = useState(false);

  useEffect(() => {
    if (open) {
      if (preset) {
        setFromId(preset.fromId);
        setToId(preset.toId);
        setAmount(formatThousands(String(Math.round(preset.amount))));
        setPayAll(true);
      } else {
        setFromId(group.members[0]?.id || "");
        setToId(group.members[1]?.id || "");
        setAmount("");
        setPayAll(false);
      }
      setNote("");
    }
  }, [open, preset, group.id]);

  function submit() {
    const amt = preset && payAll ? preset.amount : parseThousands(amount);
    if (!fromId || !toId || fromId === toId || !amt) {
      toast.error("Pick two different members and an amount.");
      return;
    }
    actions.addPayment({
      groupId: group.id,
      fromId,
      toId,
      amount: amt,
      note: note.trim() || undefined,
    });
    const from = group.members.find((m) => m.id === fromId)?.name;
    const to = group.members.find((m) => m.id === toId)?.name;
    toast.success(`${from} → ${to} payment recorded ✅`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Record a payment
          </DialogTitle>
          <DialogDescription>
            Mark a debt as settled — partial or full payments both count.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>From</Label>
              <Select value={fromId} onValueChange={setFromId} disabled={!!preset}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {group.members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.emoji} {m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>To</Label>
              <Select value={toId} onValueChange={setToId} disabled={!!preset}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {group.members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.emoji} {m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {preset && (
            <label className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/40 p-3 cursor-pointer">
              <Checkbox
                checked={payAll}
                onCheckedChange={(v) => {
                  const checked = v === true;
                  setPayAll(checked);
                  if (checked) setAmount(formatThousands(String(Math.round(preset.amount))));
                }}
                className="mt-0.5"
              />
              <div className="text-sm">
                <div className="font-semibold">Pay the full debt</div>
                <div className="text-muted-foreground text-xs">
                  Settles the entire {formatMoney(preset.amount, group.currency)} owed in one go.
                </div>
              </div>
            </label>
          )}

          {!(preset && payAll) && (
            <div className="space-y-1.5">
              <Label>Amount (Rp)</Label>
              <Input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(formatThousands(e.target.value))}
                placeholder="0"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Bank transfer, cash, etc." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} className="rounded-full px-6">
            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark as paid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
