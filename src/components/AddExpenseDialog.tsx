import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { actions, type Group } from "@/lib/splitzy-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMOJIS = ["💸", "🍕", "🍷", "🍺", "🚕", "🏠", "🛒", "🎬", "✈️", "⛽", "☕", "🍔", "🎁", "🏄", "🎟️"];

export function AddExpenseDialog({
  open,
  onOpenChange,
  group,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  group: Group;
}) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [emoji, setEmoji] = useState("💸");
  const [paidBy, setPaidBy] = useState(group.members[0]?.id || "");
  const [splitWith, setSplitWith] = useState<string[]>(group.members.map((m) => m.id));

  function reset() {
    setDesc("");
    setAmount("");
    setEmoji("💸");
    setPaidBy(group.members[0]?.id || "");
    setSplitWith(group.members.map((m) => m.id));
  }

  function submit() {
    const amt = parseFloat(amount);
    if (!desc.trim() || !amt || splitWith.length === 0 || !paidBy) return;
    actions.addExpense({
      groupId: group.id,
      description: desc.trim(),
      amount: amt,
      paidBy,
      splitWith,
      emoji,
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add an expense</DialogTitle>
          <DialogDescription>Who paid? Who's splitting?</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label>Description</Label>
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Tapas dinner" />
            </div>
            <div className="w-28 space-y-1.5">
              <Label>Amount</Label>
              <Input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Emoji</Label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`h-9 w-9 rounded-xl text-lg transition ${emoji === e ? "bg-primary/15 ring-2 ring-primary" : "bg-secondary hover:bg-accent"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Paid by</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {group.members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.emoji} {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Split with</Label>
            <div className="grid grid-cols-2 gap-2">
              {group.members.map((m) => {
                const checked = splitWith.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer transition ${
                      checked ? "border-primary bg-primary/5" : "border-border bg-secondary/40"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) =>
                        setSplitWith((s) => (v ? [...s, m.id] : s.filter((x) => x !== m.id)))
                      }
                    />
                    <span className="text-lg">{m.emoji}</span>
                    <span className="text-sm font-medium">{m.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} className="bg-gradient-warm text-primary-foreground rounded-full px-6">
            Add expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
