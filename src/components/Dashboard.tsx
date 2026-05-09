import { useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { Link } from "@tanstack/react-router";
import { actions, computeBalances, settleUp, useStore, type Group } from "@/lib/splitzy-store";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, Send, Users, Sparkles } from "lucide-react";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { NewGroupDialog } from "./NewGroupDialog";
import { SendSummaryDialog } from "./SendSummaryDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Dashboard() {
  const store = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const group: Group | undefined =
    store.groups.find((g) => g.id === store.activeGroupId) || store.groups[0];

  const groupExpenses = useMemo(
    () => store.expenses.filter((e) => group && e.groupId === group.id),
    [store.expenses, group],
  );

  const balances = useMemo(() => (group ? computeBalances(group, store.expenses) : {}), [group, store.expenses]);
  const txns = useMemo(() => (group ? settleUp(balances, group.members) : []), [balances, group]);
  const total = groupExpenses.reduce((s, e) => s + e.amount, 0);
  const youId = group?.members.find((m) => m.name === "You")?.id;
  const yourBalance = youId ? balances[youId] || 0 : 0;

  if (!group) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between gap-4 px-6 py-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" className="rounded-full text-sm">Home</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-20">
        {/* Group switcher row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-3 rounded-2xl bg-card border border-border px-4 py-3 hover:shadow-soft transition-shadow">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-warm text-2xl">{group.emoji}</span>
                <div className="text-left">
                  <div className="font-display font-bold text-xl leading-tight">{group.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> {group.members.length} members
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground ml-1 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {store.groups.map((g) => (
                <DropdownMenuItem key={g.id} onSelect={() => actions.setActiveGroup(g.id)} className="gap-2 py-2">
                  <span className="text-lg">{g.emoji}</span> {g.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setTimeout(() => setNewGroupOpen(true), 0);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> New group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setSummaryOpen(true)}>
              <Send className="h-4 w-4 mr-1.5" /> Send summary
            </Button>
            <Button className="rounded-full bg-gradient-warm text-primary-foreground shadow-soft" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add expense
            </Button>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <StatCard label="Total spent" value={`${group.currency}${total.toFixed(2)}`} tone="card" />
          <StatCard
            label={yourBalance >= 0 ? "You're owed" : "You owe"}
            value={`${group.currency}${Math.abs(yourBalance).toFixed(2)}`}
            tone={yourBalance >= 0 ? "mint" : "warm"}
          />
          <StatCard label="Expenses" value={String(groupExpenses.length)} tone="sun" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Expenses list */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4">Recent expenses</h2>
            {groupExpenses.length === 0 ? (
              <EmptyExpenses onAdd={() => setAddOpen(true)} />
            ) : (
              <div className="space-y-2.5">
                {groupExpenses.map((e) => {
                  const payer = group.members.find((m) => m.id === e.paidBy);
                  const share = e.amount / e.splitWith.length;
                  const youInSplit = youId && e.splitWith.includes(youId);
                  const yourPart = e.paidBy === youId ? e.amount - (youInSplit ? share : 0) : youInSplit ? -share : 0;
                  return (
                    <div key={e.id} className="group flex items-center gap-4 rounded-2xl bg-card border border-border p-4 hover:shadow-soft transition-shadow">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-2xl shrink-0">{e.emoji || "💸"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{e.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {payer?.name} paid · split {e.splitWith.length} ways · {new Date(e.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display font-bold text-lg">{group.currency}{e.amount.toFixed(2)}</div>
                        <div className={`text-xs font-semibold ${yourPart > 0 ? "text-mint-foreground" : yourPart < 0 ? "text-primary" : "text-muted-foreground"}`}>
                          {yourPart > 0 ? `+${group.currency}${yourPart.toFixed(2)}` : yourPart < 0 ? `−${group.currency}${Math.abs(yourPart).toFixed(2)}` : "—"}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => actions.deleteExpense(e.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Balances + settle */}
          <aside className="space-y-6">
            <div className="rounded-3xl bg-card border border-border p-5 shadow-soft">
              <h3 className="font-display text-lg font-bold mb-3">Balances</h3>
              <div className="space-y-2">
                {group.members.map((m) => {
                  const b = balances[m.id] || 0;
                  return (
                    <div key={m.id} className="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.emoji}</span>
                        <span className="font-medium text-sm">{m.name}</span>
                      </div>
                      <span className={`font-display font-bold text-sm ${b > 0.01 ? "text-mint-foreground" : b < -0.01 ? "text-primary" : "text-muted-foreground"}`}>
                        {b > 0.01 ? "+" : b < -0.01 ? "−" : ""}{group.currency}{Math.abs(b).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-mint p-5 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-mint-foreground" />
                <h3 className="font-display text-lg font-bold text-mint-foreground">Settle up</h3>
              </div>
              {txns.length === 0 ? (
                <p className="text-sm text-mint-foreground/80">All squared up! 🎉</p>
              ) : (
                <div className="space-y-2">
                  {txns.map((t, i) => (
                    <div key={i} className="rounded-xl bg-card/60 backdrop-blur px-3 py-2.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span>
                          <b>{t.from.name}</b> → <b>{t.to.name}</b>
                        </span>
                        <span className="font-display font-bold">{group.currency}{t.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <AddExpenseDialog open={addOpen} onOpenChange={setAddOpen} group={group} />
      <NewGroupDialog open={newGroupOpen} onOpenChange={setNewGroupOpen} />
      <SendSummaryDialog open={summaryOpen} onOpenChange={setSummaryOpen} group={group} />
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "card" | "warm" | "mint" | "sun" }) {
  const tones = {
    card: "bg-card border border-border",
    warm: "bg-gradient-warm text-primary-foreground",
    mint: "bg-gradient-mint text-mint-foreground",
    sun: "bg-sun text-sun-foreground",
  };
  return (
    <div className={`rounded-3xl p-5 shadow-soft ${tones[tone]}`}>
      <div className="text-xs font-semibold opacity-80">{label}</div>
      <div className="font-display font-extrabold text-3xl mt-1">{value}</div>
    </div>
  );
}

function EmptyExpenses({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-border p-10 text-center">
      <div className="text-5xl mb-3">🧾</div>
      <h3 className="font-display text-xl font-bold">No expenses yet</h3>
      <p className="text-muted-foreground text-sm mb-4">Drop in your first one to start the math magic.</p>
      <Button onClick={onAdd} className="rounded-full bg-gradient-warm text-primary-foreground">
        <Plus className="h-4 w-4 mr-1" /> Add expense
      </Button>
    </div>
  );
}
