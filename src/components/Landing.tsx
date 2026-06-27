import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ArrowRight,
  Users,
  Receipt,
  Sparkles,
  HeartHandshake,
  Wallet,
  Smile,
  ShieldCheck,
  Zap,
  PiggyBank,
  Globe2,
} from "lucide-react";

export function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="container mx-auto flex items-center justify-between px-6 py-6">
        <Logo />
        <nav className="hidden gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#benefits" className="hover:text-foreground transition-colors">Benefits</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/app">
            <Button variant="default" className="rounded-full px-5">
              Open app <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto grid gap-12 px-6 py-12 md:grid-cols-2 md:py-24 md:gap-8 items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Split bills with zero stress
          </div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Split smarter,
            <br />
            stay <span className="text-primary">closer.</span>
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            The friendliest way to track shared expenses with your crew. No more awkward
            "you owe me" texts — just easy math and instant settle-ups.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/app">
              <Button size="lg" className="rounded-full px-7 h-12 text-base">
                Start splitting <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="rounded-full px-7 h-12 text-base">
                See how it works
              </Button>
            </a>
          </div>
          <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {["🦊", "🐼", "🦄", "🐯"].map((e) => (
                <span key={e} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-card border-2 border-background text-lg">
                  {e}
                </span>
              ))}
            </div>
            <span>Loved by trip squads & flatmates</span>
          </div>
        </div>

        {/* Hero card mockup */}
        <div className="relative">
          <div className="relative">
            <MockCard />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-4xl font-bold md:text-5xl">Everything your group needs.</h2>
          <p className="mt-3 text-muted-foreground text-lg">Built for the way friends actually spend money together.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <Feature
            icon={<Users className="h-5 w-5" />}
            title="Group it up"
            text="Trips, flatshares, dinner clubs — make a group in seconds and add your crew."
          />
          <Feature
            icon={<Receipt className="h-5 w-5" />}
            title="Add an expense"
            text="Who paid, who's in. We do the math. Equal splits and per-person picks."
          />
          <Feature
            icon={<HeartHandshake className="h-5 w-5" />}
            title="Settle up"
            text="One-tap suggested transfers — minimum payments, no awkward chains."
          />
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="container mx-auto px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-4xl font-bold md:text-5xl">Why split with Splitzy?</h2>
          <p className="mt-3 text-muted-foreground text-lg">Money stuff shouldn't ruin good vibes. Here's what you get.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Benefit icon={<Smile className="h-5 w-5" />} title="No more awkward asks" text="Clear balance summaries do the explaining for you. Friendships stay friendships." />
          <Benefit icon={<Zap className="h-5 w-5" />} title="Lightning fast" text="Add an expense in under 10 seconds. Edit anytime if you fat-finger a digit." />
          <Benefit icon={<PiggyBank className="h-5 w-5" />} title="See where it goes" text="Trip totals, per-person spend, and clear settle-up paths at a glance." />
          <Benefit icon={<ShieldCheck className="h-5 w-5" />} title="Track real payments" text="Mark debts paid as soon as they're settled — mid-trip or after." />
          <Benefit icon={<Wallet className="h-5 w-5" />} title="Built for Rupiah" text="Native IDR formatting with thousand separators. No mental math." />
          <Benefit icon={<Globe2 className="h-5 w-5" />} title="Works anywhere" text="Phone, tablet, laptop. Light mode, dark mode. Whatever your vibe." />
        </div>
      </section>

      {/* How */}
      <section id="how" className="container mx-auto px-6 py-20">
        <div className="rounded-3xl bg-card border border-border p-8 md:p-14">
          <div className="grid gap-10 md:grid-cols-3">
            {[
              { n: "01", t: "Create a group", d: "Name it, pick an emoji, add your people." },
              { n: "02", t: "Drop in expenses", d: "Each time someone pays, log it. Splitzy does the rest." },
              { n: "03", t: "Settle up", d: "See balances, record payments, and close the loop in one tap." },
            ].map((s) => (
              <div key={s.n} className="space-y-3">
                <div className="font-display text-5xl font-extrabold text-primary">{s.n}</div>
                <h3 className="font-display text-xl font-bold">{s.t}</h3>
                <p className="text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="container mx-auto px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-4xl font-bold md:text-5xl">Made for your crew.</h2>
          <p className="mt-3 text-muted-foreground text-lg">Wherever money meets friends, Splitzy fits right in.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { e: "✈️", t: "Trip groups", d: "Bali, Lisbon, Tokyo — keep the trip about the memories." },
            { e: "🏠", t: "Flatmates", d: "Rent, groceries, utilities. Split it once, settle monthly." },
            { e: "🍝", t: "Dinner clubs", d: "Birthday meals, weekend brunches, never split the check at the table again." },
            { e: "🎓", t: "Students", d: "Project supplies, late-night snacks, road trips." },
          ].map((u) => (
            <div key={u.t} className="rounded-3xl bg-card border border-border p-6">
              <div className="text-3xl">{u.e}</div>
              <h3 className="mt-3 font-display text-lg font-bold">{u.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{u.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-4xl font-bold md:text-5xl">Crews love it.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { q: "Saved our group chat from spreadsheet chaos. We actually settle up now.", n: "Maya", r: "Bali trip, 6 friends" },
            { q: "I edited a typo three months later. No drama. Chef's kiss.", n: "Reza", r: "Flatshare, 4 people" },
            { q: "The settle-up tracker is a game-changer. Everyone just pays.", n: "Anya", r: "Dinner club, 8 friends" },
          ].map((t) => (
            <div key={t.n} className="rounded-3xl bg-card border border-border p-6">
              <p className="text-base leading-relaxed">"{t.q}"</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">
                  {t.n[0]}
                </span>
                <div>
                  <div className="font-semibold text-sm">{t.n}</div>
                  <div className="text-xs text-muted-foreground">{t.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-4xl font-bold md:text-5xl">Quick questions.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { q: "Is Splitzy free?", a: "Yep. Every core feature — groups, expenses, settle-up, summaries — is free." },
            { q: "Do my friends need an account?", a: "Nope. Just add their name and emoji. Everyone sees the same balances instantly." },
            { q: "What currency does it use?", a: "Indonesian Rupiah (IDR), formatted with proper thousand separators." },
            { q: "Can I edit a past expense?", a: "Of course. Tap the pencil icon on any entry to fix typos or amounts." },
          ].map((f) => (
            <div key={f.q} className="rounded-2xl bg-card border border-border p-6">
              <h3 className="font-display font-bold text-lg">{f.q}</h3>
              <p className="mt-2 text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>



      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="rounded-3xl bg-gradient-warm p-10 md:p-16 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-primary-foreground">
            Ready to split smarter?
          </h2>
          <p className="mt-3 text-primary-foreground/85 max-w-xl mx-auto text-lg">
            Start your first group in under a minute. Your crew (and your group chat) will thank you.
          </p>
          <div className="mt-7">
            <Link to="/app">
              <Button size="lg" variant="secondary" className="rounded-full px-8 h-12 text-base">
                Open Splitzy <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-10 mt-10 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Splitzy. Made with warmth.</p>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-card border border-border p-7 hover:border-primary/40 transition-colors">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
      <p className="mt-1.5 text-muted-foreground">{text}</p>
    </div>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 hover:border-primary/40 transition-colors">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
        {icon}
      </div>
      <h3 className="mt-3 font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function MockCard() {
  return (
    <div className="rounded-3xl bg-card border border-border p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-2xl">🌊</span>
          <div>
            <div className="font-display font-bold text-lg">Lisbon Trip</div>
            <div className="text-xs text-muted-foreground">4 people · Rp 10.290.000</div>
          </div>
        </div>
        <span className="rounded-full bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1">on track</span>
      </div>

      <div className="mt-6 space-y-3">
        {[
          { e: "🏠", t: "Airbnb", who: "You paid", a: "7.200.000" },
          { e: "🍷", t: "Tapas", who: "Alex paid", a: "1.290.000" },
          { e: "🏄", t: "Surf lesson", who: "Sam paid", a: "1.800.000" },
        ].map((x) => (
          <div key={x.t} className="flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">{x.e}</span>
              <div>
                <div className="font-semibold text-sm">{x.t}</div>
                <div className="text-xs text-muted-foreground">{x.who}</div>
              </div>
            </div>
            <div className="font-display font-bold">Rp {x.a}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-border p-4">
        <div className="text-xs font-semibold text-muted-foreground">You're owed</div>
        <div className="font-display text-3xl font-extrabold text-primary">Rp 615.000</div>
      </div>
    </div>
  );
}
