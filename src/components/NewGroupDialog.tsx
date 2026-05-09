import { useState } from "react";
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
import { actions } from "@/lib/splitzy-store";
import { X, Plus } from "lucide-react";

const EMOJIS = ["🌊", "🏔️", "🏠", "🍕", "🎉", "✈️", "🎬", "🚗", "🎓", "💼"];

export function NewGroupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎉");
  const [members, setMembers] = useState<string[]>(["Alex", "Sam"]);
  const [newMember, setNewMember] = useState("");

  function reset() {
    setName("");
    setEmoji("🎉");
    setMembers(["Alex", "Sam"]);
    setNewMember("");
  }

  function add() {
    const t = newMember.trim();
    if (!t) return;
    setMembers((m) => [...m, t]);
    setNewMember("");
  }

  function submit() {
    if (!name.trim()) return;
    actions.addGroup(name.trim(), emoji, members.filter((m) => m.trim()));
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">New group</DialogTitle>
          <DialogDescription>A trip, a flatshare, a dinner club…</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Group name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bali Squad" />
          </div>

          <div className="space-y-1.5">
            <Label>Emoji</Label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`h-10 w-10 rounded-xl text-xl transition ${emoji === e ? "bg-primary/15 ring-2 ring-primary" : "bg-secondary hover:bg-accent"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Members <span className="text-muted-foreground font-normal">(You is added automatically)</span></Label>
            <div className="flex gap-2">
              <Input
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
                placeholder="Add a name"
              />
              <Button type="button" onClick={add} variant="secondary" className="rounded-full"><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {members.map((m, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">
                  {m}
                  <button onClick={() => setMembers((arr) => arr.filter((_, idx) => idx !== i))}>
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} className="bg-gradient-warm text-primary-foreground rounded-full px-6">
            Create group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
