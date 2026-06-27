import { useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { Link } from "@tanstack/react-router";
import {
  actions,
  computeBalances,
  formatMoney,
  settleUp,
  useStore,
  type Expense,
  type Group,
} from "@/lib/splitzy-store";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, Users, Sparkles, Pencil, CheckCircle2, ArrowRight, UserCog, Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { NewGroupDialog } from "./NewGroupDialog";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { EditMembersDialog } from "./EditMembersDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  const [editing, setEditing] = useState<Expense | null>(null);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [editMembersOpen, setEditMembersOpen] = useState(false);
  const [payPreset, setPayPreset] = useState<{ fromId: string; toId: string; amount: number } | null>(null);

  const group: Group | undefined =
    store.groups.find((g) => g.id === store.activeGroupId) || store.groups[0];

  const groupExpenses = useMemo(
    () => store.expenses.filter((e) => group && e.groupId === group.id),
    [store.expenses, group],
  );
  const groupPayments = useMemo(
    () => store.payments.filter((p) => group && p.groupId === group.id),
    [store.payments, group],
  );

  const balances = useMemo(
    () => (group ? computeBalances(group, store.expenses, store.payments) : {}),
    [group, store.expenses, store.payments],
  );
  const txns = useMemo(() => (group ? settleUp(balances, group.members) : []), [balances, group]);
  const total = groupExpenses.reduce((s, e) => s + e.amount, 0);
  const youId = group?.members.find((m) => m.name === "You")?.id;
  const yourBalance = youId ? balances[youId] || 0 : 0;
  const isSettled = txns.length === 0 && groupExpenses.length > 0;

  if (!group) return null;

  return (
    <div className="min-h-screen">
      <header className="container mx-auto flex items-center justify-between gap-4 px-6 py-6">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/">
            <Button variant="ghost" className="rounded-full text-sm">Home</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-3 rounded-2xl bg-card border border-border px-4 py-3 hover:shadow-soft transition-shadow">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-warm text-2xl">{group.emoji}</span>
                <div className="text-left">
                  <div className="font-display font-bold text-xl leading-tight flex items-center gap-2">
                    {group.name}
                    {isSettled && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-mint-foreground">
                        <CheckCircle2 className="h-3 w-3" /> SETTLED
                      </span>
                    )}
                  </div>
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
                  setTimeout(() => setEditMembersOpen(true), 0);
                }}
                className="gap-2"
              >
                <UserCog className="h-4 w-4" /> Edit members
              </DropdownMenuItem>
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

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setPayPreset(null);
                setPayOpen(true);
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Record payment
            </Button>
            <Button
              className="rounded-full"
              onClick={() => {
                setEditing(null);
                setAddOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add expense
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <StatCard label="Total spent" value={formatMoney(total, group.currency)} tone="card" />
          <StatCard
            label={yourBalance >= 0 ? "You're owed" : "You owe"}
            value={formatMoney(Math.abs(yourBalance), group.currency)}
            tone={yourBalance >= 0 ? "mint" : "warm"}
          />
          <StatCard label="Expenses" value={String(groupExpenses.length)} tone="sun" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            <h2 className="font-display text-2xl font-bold mb-4">Recent activity</h2>
            {groupExpenses.length === 0 && groupPayments.length === 0 ? (
              <EmptyExpenses onAdd={() => { setEditing(null); setAddOpen(true); }} />
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
                          {payer?.name} paid · split {e.splitWith.length} ways · {new Date(e.date).toLocaleDateString("id-ID")}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display font-bold text-lg">{formatMoney(e.amount, group.currency)}</div>
                        <div className={`text-xs font-semibold ${yourPart > 0.01 ? "text-mint-foreground" : yourPart < -0.01 ? "text-primary" : "text-muted-foreground"}`}>
                          {yourPart > 0.01 ? `+${formatMoney(yourPart, group.currency)}` : yourPart < -0.01 ? `−${formatMoney(Math.abs(yourPart), group.currency)}` : "—"}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => { setEditing(e); setAddOpen(true); }}
                          aria-label="Edit expense"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => actions.deleteExpense(e.id)}
                          aria-label="Delete expense"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {groupPayments.length > 0 && (
                  <>
                    <h3 className="font-display text-lg font-bold mt-6 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-mint-foreground" /> Payments
                    </h3>
                    {groupPayments.map((p) => {
                      const from = group.members.find((m) => m.id === p.fromId);
                      const to = group.members.find((m) => m.id === p.toId);
                      return (
                        <div key={p.id} className="group flex items-center gap-4 rounded-2xl bg-mint/30 border border-mint/40 p-4">
                          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-mint-foreground shrink-0">
                            <CheckCircle2 className="h-5 w-5" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate flex items-center gap-1.5">
                              {from?.name} <ArrowRight className="h-3.5 w-3.5" /> {to?.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Settled · {new Date(p.date).toLocaleDateString("id-ID")}{p.note ? ` · ${p.note}` : ""}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-display font-bold text-lg text-mint-foreground">
                              {formatMoney(p.amount, group.currency)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => actions.deletePayment(p.id)}
                            aria-label="Delete payment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </section>

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
                        {b > 0.01 ? "+" : b < -0.01 ? "−" : ""}{formatMoney(Math.abs(b), group.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-card border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-bold">Settle up</h3>
              </div>
              {txns.length === 0 ? (
                <p className="text-sm text-muted-foreground">All squared up! 🎉</p>
              ) : (
                <div className="space-y-2">
                  {txns.map((t, i) => (
                    <div key={i} className="rounded-xl bg-secondary/40 px-3 py-2.5 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span>
                          <b>{t.from.name}</b> → <b>{t.to.name}</b>
                        </span>
                        <span className="font-display font-bold">{formatMoney(t.amount, group.currency)}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full rounded-full h-7 text-xs"
                        onClick={() => {
                          setPayPreset({ fromId: t.from.id, toId: t.to.id, amount: t.amount });
                          setPayOpen(true);
                        }}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Mark as paid
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <AddExpenseDialog
        open={addOpen}
        onOpenChange={(v) => { setAddOpen(v); if (!v) setEditing(null); }}
        group={group}
        expense={editing}
      />
      <NewGroupDialog open={newGroupOpen} onOpenChange={setNewGroupOpen} />
      <RecordPaymentDialog open={payOpen} onOpenChange={setPayOpen} group={group} preset={payPreset} />
      <EditMembersDialog open={editMembersOpen} onOpenChange={setEditMembersOpen} group={group} />
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "card" | "warm" | "mint" | "sun" }) {
  const tones = {
    card: "bg-card border border-border",
    warm: "bg-card border border-border",
    mint: "bg-card border border-border",
    sun: "bg-card border border-border",
  };
  const valueTone = {
    card: "text-foreground",
    warm: "text-primary",
    mint: "text-mint-foreground",
    sun: "text-foreground",
  };
  return (
    <div className={`rounded-3xl p-5 ${tones[tone]}`}>
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className={`font-display font-extrabold text-3xl mt-1 break-words ${valueTone[tone]}`}>{value}</div>
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
