import { Link } from "react-router-dom";
import { Zap, BarChart3, Link2, ShieldCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <Zap size={18} />
          </div>
          <span className="font-display text-lg font-700">Snipt</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-ink/70 hover:text-ink"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-dark"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-24 text-center">
        <span className="inline-block rounded-full bg-brand-light px-4 py-1.5 text-sm font-medium text-brand-dark">
          Shorten. Share. Track.
        </span>
        <h1 className="mt-6 font-display text-5xl font-700 leading-tight sm:text-6xl">
          Long links, <span className="text-brand">shortened</span> in a snip.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink/60">
          Create short, memorable links and see exactly who's clicking them —
          browsers, devices, and visit history, all in one dashboard.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/register"
            className="rounded-full bg-brand px-7 py-3 text-base font-medium text-white shadow-md hover:bg-brand-dark"
          >
            Create your first link
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-ink/15 px-7 py-3 text-base font-medium hover:bg-white"
          >
            I have an account
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={Link2}
            title="Custom short links"
            text="Pick your own alias or let us generate one instantly."
          />
          <FeatureCard
            icon={BarChart3}
            title="Real-time analytics"
            text="Track clicks, browsers, devices, and operating systems."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Set expiry dates"
            text="Links can automatically expire whenever you choose."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
        <Icon size={20} />
      </div>
      <h3 className="font-display text-lg font-600">{title}</h3>
      <p className="mt-1 text-sm text-ink/60">{text}</p>
    </div>
  );
}
