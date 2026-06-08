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
import { actions, type Group } from "@/lib/splitzy-store";

const MEMBER_EMOJIS = [
  "😎", "🦊", "🐼", "🦄", "🐯", "🐸", "🦁", "🐨", "🦖", "🐵",
  "🐰", "🐻", "🦉", "🐺", "🐙", "🦋", "🐢", "🦩", "🐳", "🐧",
  "👩", "👨", "🧑", "👧", "👦", "🧙", "🦸", "🧞", "🥷", "🤖",
];

type Draft = { name: string; emoji: string };

export function EditMembersDialog({
  open,
  onOpenChange,
  group,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  group: Group;
}) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  useEffect(() => {
    if (open) {
      const d: Record<string, Draft> = {};
      group.members.forEach((m) => {
        d[m.id] = { name: m.name, emoji: m.emoji };
      });
      setDrafts(d);
    }
  }, [open, group]);

  function update(id: string, patch: Partial<Draft>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  function save() {
    actions.updateMembers(group.id, drafts);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit members</DialogTitle>
          <DialogDescription>Customize each member's emoji and name.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {group.members.map((m) => {
            const d = drafts[m.id] || { name: m.name, emoji: m.emoji };
            return (
              <div key={m.id} className="space-y-2 rounded-2xl border border-border p-3">
                <div className="flex gap-2 items-start">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="h-10 w-10 shrink-0 rounded-xl bg-secondary hover:bg-accent text-xl flex items-center justify-center"
                      >
                        {d.emoji}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="start">
                      <div className="grid grid-cols-6 gap-1">
                        {MEMBER_EMOJIS.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => update(m.id, { emoji: e })}
                            className={`h-9 w-9 rounded-lg text-lg transition ${
                              e === d.emoji ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-accent"
                            }`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    value={d.name}
                    onChange={(e) => update(m.id, { name: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} className="bg-gradient-warm text-primary-foreground rounded-full px-6">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
