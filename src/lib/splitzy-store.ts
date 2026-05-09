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
export type Group = {
  id: string;
  name: string;
  emoji: string;
  members: Member[];
  currency: string;
};

export type Settings = Record<string, never>;

const KEY = "splitzy:v1";

type Store = {
  groups: Group[];
  expenses: Expense[];
  activeGroupId: string;
  settings: Settings;
};

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
        name: "Lisbon Trip",
        emoji: "🌊",
        currency: "€",
        members: [you, alex, sam, jules],
      },
    ],
    expenses: [
      {
        id: crypto.randomUUID(),
        groupId,
        description: "Airbnb 3 nights",
        amount: 480,
        paidBy: you.id,
        splitWith: [you.id, alex.id, sam.id, jules.id],
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        emoji: "🏠",
      },
      {
        id: crypto.randomUUID(),
        groupId,
        description: "Tapas dinner",
        amount: 86,
        paidBy: alex.id,
        splitWith: [you.id, alex.id, sam.id, jules.id],
        date: new Date(Date.now() - 86400000).toISOString(),
        emoji: "🍷",
      },
      {
        id: crypto.randomUUID(),
        groupId,
        description: "Surf lesson",
        amount: 120,
        paidBy: sam.id,
        splitWith: [you.id, sam.id, jules.id],
        date: new Date().toISOString(),
        emoji: "🏄",
      },
    ],
    activeGroupId: groupId,
    settings: { n8nWebhookUrl: "" },
  };
};

function load(): Store {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw);
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
    // Always include "You"
    members.unshift({ id: crypto.randomUUID(), name: "You", emoji: "😎", email: yourEmail?.trim() || undefined });
    const g: Group = { id: crypto.randomUUID(), name, emoji, currency: "€", members };
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
  deleteExpense(id: string) {
    setStore((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
  },
  saveSettings(settings: Settings) {
    setStore((s) => ({ ...s, settings }));
  },
};

export function computeBalances(group: Group, expenses: Expense[]) {
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
