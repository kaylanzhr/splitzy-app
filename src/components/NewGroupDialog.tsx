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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { actions } from "@/lib/splitzy-store";
import { X, Plus } from "lucide-react";

const GROUP_EMOJIS = ["🌊", "🏔️", "🏠", "🍕", "🎉", "✈️", "🎬", "🚗", "🎓", "💼"];
const MEMBER_EMOJIS = [
  "😎", "🦊", "🐼", "🦄", "🐯", "🐸", "🦁", "🐨", "🦖", "🐵",
  "🐰", "🐻", "🦉", "🐺", "🐙", "🦋", "🐢", "🦩", "🐳", "🐧",
  "👩", "👨", "🧑", "👧", "👦", "🧙", "🦸", "🧞", "🥷", "🤖",
];

type MemberInput = { name: string; email: string; emoji: string };

const initialMembers = (): MemberInput[] => [
  { name: "Alex", email: "", emoji: "🦊" },
  { name: "Sam", email: "", emoji: "🐼" },
];

function EmojiPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-10 w-10 shrink-0 rounded-xl bg-secondary hover:bg-accent text-xl flex items-center justify-center"
          aria-label="Pick emoji"
        >
          {value}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-6 gap-1">
          {MEMBER_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                onChange(e);
                setOpen(false);
              }}
              className={`h-9 w-9 rounded-lg text-lg transition ${
                e === value ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-accent"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

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
  const [yourEmoji, setYourEmoji] = useState("😎");
  const [members, setMembers] = useState<MemberInput[]>(initialMembers());

  useEffect(() => {
    if (open) {
      setName("");
      setEmoji("🎉");
      setYourEmail("");
      setYourEmoji("😎");
      setMembers(initialMembers());
    }
  }, [open]);

  function addMember() {
    const fallbacks = ["🦊", "🐼", "🦄", "🐯", "🐸", "🦁", "🐨", "🦖"];
    setMembers((m) => [...m, { name: "", email: "", emoji: fallbacks[m.length % fallbacks.length] }]);
  }

  function updateMember(i: number, patch: Partial<MemberInput>) {
    setMembers((arr) => arr.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }

  function removeMember(i: number) {
    setMembers((arr) => arr.filter((_, idx) => idx !== i));
  }

  function submit() {
    if (!name.trim()) return;
    actions.addGroup(name.trim(), emoji, members, yourEmail, yourEmoji);
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
            <Label>Group emoji</Label>
            <div className="flex flex-wrap gap-1.5">
              {GROUP_EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`h-10 w-10 rounded-xl text-xl transition ${
                    emoji === e ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary hover:bg-accent"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>You</Label>
            <div className="flex gap-2 items-start">
              <EmojiPicker value={yourEmoji} onChange={setYourEmoji} />
              <Input
                type="email"
                value={yourEmail}
                onChange={(e) => setYourEmail(e.target.value)}
                placeholder="your email (optional)"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Members</Label>
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <EmojiPicker value={m.emoji} onChange={(e) => updateMember(i, { emoji: e })} />
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
                    placeholder="email"
                    className="flex-[1.2]"
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
