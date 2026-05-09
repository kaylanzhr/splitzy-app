import { useEffect, useState } from "react";
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
import { actions, formatThousands, parseThousands, type Expense, type Group } from "@/lib/splitzy-store";
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
  expense,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  group: Group;
  expense?: Expense | null;
}) {
  const isEdit = !!expense;
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(""); // formatted display string
  const [emoji, setEmoji] = useState("💸");
  const [paidBy, setPaidBy] = useState(group.members[0]?.id || "");
  const [splitWith, setSplitWith] = useState<string[]>(group.members.map((m) => m.id));

  useEffect(() => {
    if (open) {
      if (expense) {
        setDesc(expense.description);
        setAmount(formatThousands(String(Math.round(expense.amount))));
        setEmoji(expense.emoji || "💸");
        setPaidBy(expense.paidBy);
        setSplitWith(expense.splitWith);
      } else {
        setDesc("");
        setAmount("");
        setEmoji("💸");
        setPaidBy(group.members[0]?.id || "");
        setSplitWith(group.members.map((m) => m.id));
      }
    }
  }, [open, group.id, expense]);

  function submit() {
    const amt = parseThousands(amount);
    if (!desc.trim() || !amt || splitWith.length === 0 || !paidBy) return;
    if (isEdit && expense) {
      actions.updateExpense(expense.id, {
        description: desc.trim(),
        amount: amt,
        paidBy,
        splitWith,
        emoji,
      });
    } else {
      actions.addExpense({
        groupId: group.id,
        description: desc.trim(),
        amount: amt,
        paidBy,
        splitWith,
        emoji,
      });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEdit ? "Edit expense" : "Add an expense"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Fix any typos or update the split." : "Who paid? Who's splitting?"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label>Description</Label>
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Seafood dinner" />
            </div>
            <div className="w-36 space-y-1.5">
              <Label>Amount (Rp)</Label>
              <Input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(formatThousands(e.target.value))}
                placeholder="0"
              />
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
            {isEdit ? "Save changes" : "Add expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
