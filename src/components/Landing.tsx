import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Receipt, Sparkles, HeartHandshake } from "lucide-react";

export function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="container mx-auto flex items-center justify-between px-6 py-6">
        <Logo />
        <nav className="hidden gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
        </nav>
        <Link to="/app">
          <Button variant="default" className="rounded-full px-5">
            Open app <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="container mx-auto grid gap-12 px-6 py-12 md:grid-cols-2 md:py-24 md:gap-8 items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Now with email notifications
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

      {/* How */}
      <section id="how" className="container mx-auto px-6 py-20">
        <div className="rounded-3xl bg-card border border-border p-8 md:p-14">
          <div className="grid gap-10 md:grid-cols-3">
            {[
              { n: "01", t: "Create a group", d: "Name it, pick an emoji, add your people." },
              { n: "02", t: "Drop in expenses", d: "Each time someone pays, log it. Splitzy does the rest." },
              { n: "03", t: "Get the summary", d: "See balances, settle up, email the group in one tap." },
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

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
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
