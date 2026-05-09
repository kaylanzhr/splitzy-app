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
import { actions } from "@/lib/splitzy-store";
import { X, Plus } from "lucide-react";

const EMOJIS = ["🌊", "🏔️", "🏠", "🍕", "🎉", "✈️", "🎬", "🚗", "🎓", "💼"];

type MemberInput = { name: string; email: string };

const initialMembers = (): MemberInput[] => [
  { name: "Alex", email: "" },
  { name: "Sam", email: "" },
];

export function NewGroupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎉");
  const [yourEmail, setYourEmail] = useState("");
  const [members, setMembers] = useState<MemberInput[]>(initialMembers());

  useEffect(() => {
    if (open) {
      setName("");
      setEmoji("🎉");
      setYourEmail("");
      setMembers(initialMembers());
    }
  }, [open]);

  function addMember() {
    setMembers((m) => [...m, { name: "", email: "" }]);
  }

  function updateMember(i: number, patch: Partial<MemberInput>) {
    setMembers((arr) => arr.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }

  function removeMember(i: number) {
    setMembers((arr) => arr.filter((_, idx) => idx !== i));
  }

  function submit() {
    if (!name.trim()) return;
    actions.addGroup(name.trim(), emoji, members, yourEmail);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
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
                  className={`h-10 w-10 rounded-xl text-xl transition ${
                    emoji === e ? "bg-primary/15 ring-2 ring-primary" : "bg-secondary hover:bg-accent"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Your email <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              type="email"
              value={yourEmail}
              onChange={(e) => setYourEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Members</Label>
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Input
                    value={m.name}
                    onChange={(e) => updateMember(i, { name: e.target.value })}
                    placeholder="Name"
                    className="flex-1"
                  />
                  <Input
                    type="email"
                    value={m.email}
                    onChange={(e) => updateMember(i, { email: e.target.value })}
                    placeholder="email (optional)"
                    className="flex-[1.3]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMember(i)}
                    className="rounded-full shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" onClick={addMember} variant="secondary" className="rounded-full mt-1">
              <Plus className="h-4 w-4 mr-1" /> Add member
            </Button>
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
