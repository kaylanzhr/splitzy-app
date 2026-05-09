import { useEffect, useState } from "react";

export type Member = { id: string; name: string; emoji: string; email?: string };
export type Expense = {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string; // member id
  splitWith: string[]; // member ids (includes payer)
  date: string;
  emoji?: string;
};
export type Payment = {
  id: string;
  groupId: string;
  fromId: string;
  toId: string;
  amount: number;
  date: string;
  note?: string;
};
export type Group = {
  id: string;
  name: string;
  emoji: string;
  members: Member[];
  currency: string;
};

export type Settings = Record<string, never>;

const KEY = "splitzy:v2";
const LEGACY_KEY = "splitzy:v1";

type Store = {
  groups: Group[];
  expenses: Expense[];
  payments: Payment[];
  activeGroupId: string;
  settings: Settings;
};

export function formatMoney(amount: number, currency = "Rp ") {
  const rounded = Math.round(amount);
  return `${currency}${new Intl.NumberFormat("id-ID").format(rounded)}`;
}

/** Strip to digits and re-format with Indonesian thousand separators (dots). */
export function formatThousands(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(digits, 10));
}
export function parseThousands(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

const seed = (): Store => {
  const m = (n: string, e: string): Member => ({ id: crypto.randomUUID(), name: n, emoji: e });
  const you = m("You", "😎");
  const alex = m("Alex", "🦊");
  const sam = m("Sam", "🐼");
  const jules = m("Jules", "🦄");
  const groupId = crypto.randomUUID();
  return {
    groups: [
      {
        id: groupId,
        name: "Bali Trip",
        emoji: "🌊",
        currency: "Rp ",
        members: [you, alex, sam, jules],
      },
    ],
    expenses: [
      {
        id: crypto.randomUUID(),
        groupId,
        description: "Villa 3 nights",
        amount: 4_800_000,
        paidBy: you.id,
        splitWith: [you.id, alex.id, sam.id, jules.id],
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        emoji: "🏠",
      },
      {
        id: crypto.randomUUID(),
        groupId,
        description: "Seafood dinner",
        amount: 860_000,
        paidBy: alex.id,
        splitWith: [you.id, alex.id, sam.id, jules.id],
        date: new Date(Date.now() - 86400000).toISOString(),
        emoji: "🍤",
      },
      {
        id: crypto.randomUUID(),
        groupId,
        description: "Surf lesson",
        amount: 1_200_000,
        paidBy: sam.id,
        splitWith: [you.id, sam.id, jules.id],
        date: new Date().toISOString(),
        emoji: "🏄",
      },
    ],
    payments: [],
    activeGroupId: groupId,
    settings: {},
  };
};

function load(): Store {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Store;
      if (!parsed.payments) parsed.payments = [];
      // Force IDR currency on all groups
      parsed.groups = parsed.groups.map((g) => ({ ...g, currency: "Rp " }));
      return parsed;
    }
    // Migrate from v1 if present
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const old = JSON.parse(legacy);
      const migrated: Store = {
        ...old,
        payments: [],
        groups: (old.groups || []).map((g: Group) => ({ ...g, currency: "Rp " })),
      };
      localStorage.setItem(KEY, JSON.stringify(migrated));
      return migrated;
    }
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  } catch {
    return seed();
  }
}

let memory: Store | null = null;
const listeners = new Set<() => void>();

function getStore(): Store {
  if (!memory) memory = load();
  return memory;
}
function setStore(updater: (s: Store) => Store) {
  memory = updater(getStore());
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(memory));
  listeners.forEach((l) => l());
}

export function useStore() {
  const [, force] = useState(0);
  useEffect(() => {
    const cb = () => force((n) => n + 1);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);
  return getStore();
}

export const actions = {
  addGroup(name: string, emoji: string, memberInputs: { name: string; email?: string }[], yourEmail?: string) {
    const emojis = ["🦊", "🐼", "🦄", "🐯", "🐸", "🦁", "🐨", "🦖"];
    const members: Member[] = memberInputs
      .filter((m) => m.name.trim())
      .map((m, i) => ({
        id: crypto.randomUUID(),
        name: m.name.trim(),
        emoji: emojis[i % emojis.length],
        email: m.email?.trim() || undefined,
      }));
    members.unshift({ id: crypto.randomUUID(), name: "You", emoji: "😎", email: yourEmail?.trim() || undefined });
    const g: Group = { id: crypto.randomUUID(), name, emoji, currency: "Rp ", members };
    setStore((s) => ({ ...s, groups: [...s.groups, g], activeGroupId: g.id }));
    return g;
  },
  updateMemberEmails(groupId: string, emails: Record<string, string>) {
    setStore((s) => ({
      ...s,
      groups: s.groups.map((g) =>
        g.id === groupId
          ? { ...g, members: g.members.map((m) => ({ ...m, email: emails[m.id]?.trim() || m.email })) }
          : g,
      ),
    }));
  },
  setActiveGroup(id: string) {
    setStore((s) => ({ ...s, activeGroupId: id }));
  },
  addExpense(e: Omit<Expense, "id" | "date">) {
    const exp: Expense = { ...e, id: crypto.randomUUID(), date: new Date().toISOString() };
    setStore((s) => ({ ...s, expenses: [exp, ...s.expenses] }));
  },
  updateExpense(id: string, patch: Partial<Omit<Expense, "id" | "groupId">>) {
    setStore((s) => ({
      ...s,
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  },
  deleteExpense(id: string) {
    setStore((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
  },
  addPayment(p: Omit<Payment, "id" | "date">) {
    const pay: Payment = { ...p, id: crypto.randomUUID(), date: new Date().toISOString() };
    setStore((s) => ({ ...s, payments: [pay, ...s.payments] }));
  },
  deletePayment(id: string) {
    setStore((s) => ({ ...s, payments: s.payments.filter((p) => p.id !== id) }));
  },
  saveSettings(settings: Settings) {
    setStore((s) => ({ ...s, settings }));
  },
};

export function computeBalances(group: Group, expenses: Expense[], payments: Payment[] = []) {
  const balances: Record<string, number> = {};
  group.members.forEach((m) => (balances[m.id] = 0));
  expenses
    .filter((e) => e.groupId === group.id)
    .forEach((e) => {
      const share = e.amount / e.splitWith.length;
      balances[e.paidBy] = (balances[e.paidBy] || 0) + e.amount;
      e.splitWith.forEach((mid) => {
        balances[mid] = (balances[mid] || 0) - share;
      });
    });
  // Payments: when "from" pays "to", from's debt decreases (+), to's credit decreases (-)
  payments
    .filter((p) => p.groupId === group.id)
    .forEach((p) => {
      balances[p.fromId] = (balances[p.fromId] || 0) + p.amount;
      balances[p.toId] = (balances[p.toId] || 0) - p.amount;
    });
  return balances;
}

export function settleUp(balances: Record<string, number>, members: Member[]) {
  const arr = members.map((m) => ({ id: m.id, name: m.name, emoji: m.emoji, bal: balances[m.id] || 0 }));
  const debtors = arr.filter((x) => x.bal < -0.01).sort((a, b) => a.bal - b.bal);
  const creditors = arr.filter((x) => x.bal > 0.01).sort((a, b) => b.bal - a.bal);
  const txns: { from: typeof arr[0]; to: typeof arr[0]; amount: number }[] = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];
    const amt = Math.min(-d.bal, c.bal);
    txns.push({ from: d, to: c, amount: amt });
    d.bal += amt;
    c.bal -= amt;
    if (Math.abs(d.bal) < 0.01) i++;
    if (Math.abs(c.bal) < 0.01) j++;
  }
  return txns;
}
