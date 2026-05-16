import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Donate book interior. Long-form letter from the maker, funding goals
 * (website, ongoing dev, Google Play, Apple, hosting & sync) and an
 * optional community poll. Donate buttons are placeholders — they emit a
 * `shelf:donate` custom event so a payment integration can be wired later
 * without changing this component's copy or layout.
 *
 * The Website goal is special: the bar reflects "money vs dates" — it shows
 * how far in the future the site is currently paid through. The bar is full
 * when the site is funded at least one year ahead of today; it slowly drains
 * as the paid-through date approaches. Donations extend the paid-through
 * date by (amount / $34) * 365 days and are persisted in localStorage so the
 * bar stays accurate across visits.
 */

const SITE_YEARLY_COST = 34;
const SITE_BASE_PAID_UNTIL = "2028-05-14"; // already paid forward two years
const SITE_STORAGE_KEY = "donate.site.paidUntilMs";
const HORIZON_DAYS = 365; // bar is "full" when ≥ 1 year paid ahead
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function readPaidUntil(): number {
  const base = new Date(SITE_BASE_PAID_UNTIL + "T00:00:00").getTime();
  try {
    const raw = localStorage.getItem(SITE_STORAGE_KEY);
    if (raw) {
      const n = Number(raw);
      if (Number.isFinite(n) && n > base) return n;
    }
  } catch {
    /* ignore */
  }
  return base;
}

function writePaidUntil(ms: number) {
  try {
    localStorage.setItem(SITE_STORAGE_KEY, String(ms));
  } catch {
    /* ignore */
  }
}

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type Goal = {
  id: string;
  title: string;
  cadence: string;
  blurb: string;
  raised: number;
  target: number;
};

const GOALS: Goal[] = [
  {
    id: "dev",
    title: "Ongoing Development",
    cadence: "Ongoing cost",
    blurb:
      "I'm covering the first iteration of development myself. Ideally, I won't be covering ongoing development out of pocket forever — once I have a realistic number for what continued work costs, I'll update this goal honestly.",
    raised: 0,
    target: 0,
  },
  {
    id: "play",
    title: "Google Play Release",
    cadence: "One-time cost",
    blurb:
      "Google Play has a one-time developer fee for Android publishing. I haven't paid this one forward yet — the web app came first because it works on any device.",
    raised: 0,
    target: 25,
  },
  {
    id: "apple",
    title: "Apple Developer License",
    cadence: "Yearly cost",
    blurb:
      "Apple requires a yearly developer fee to publish on iPhone and iPad. We'd genuinely love to support Apple users too — we're just starting where we can realistically afford to begin.",
    raised: 0,
    target: 99,
  },
  {
    id: "hosting",
    title: "Hosting & Sync Infrastructure",
    cadence: "Monthly cost",
    blurb: "Helping keep shared spaces, syncing, and backups sustainable.",
    raised: 0,
    target: 250,
  },
];

function WebsiteGoalCard() {
  // Re-render once a day (and on focus) so the bar stays accurate as time passes.
  const [tick, setTick] = useState(0);
  const [paidUntil, setPaidUntil] = useState<number>(() => readPaidUntil());
  const [custom, setCustom] = useState("");

  useEffect(() => {
    const onFocus = () => setTick((t) => t + 1);
    window.addEventListener("focus", onFocus);
    const id = window.setInterval(onFocus, 60 * 60 * 1000); // hourly refresh
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(id);
    };
  }, []);

  const { daysAhead, pct } = useMemo(() => {
    const now = Date.now();
    const days = Math.max(0, Math.floor((paidUntil - now) / MS_PER_DAY));
    const percent = Math.min(100, Math.round((days / HORIZON_DAYS) * 100));
    return { daysAhead: days, pct: percent };
    // tick forces recomputation on hourly refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidUntil, tick]);

  const yearsAhead = (daysAhead / 365).toFixed(daysAhead >= 365 ? 1 : 2);

  const give = (amount: number | "custom") => {
    const value = amount === "custom" ? Number(custom) || 0 : amount;
    if (value <= 0) return;
    const addedDays = (value / SITE_YEARLY_COST) * 365;
    const next = Math.max(paidUntil, Date.now()) + addedDays * MS_PER_DAY;
    writePaidUntil(next);
    setPaidUntil(next);
    setCustom("");
    try {
      window.dispatchEvent(
        new CustomEvent("shelf:donate", {
          detail: { goal: "site", amount: value, paidUntil: next },
        }),
      );
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="border-t border-dotted border-ink/25 pt-5">
      <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-ink/55">
        Yearly cost · ${SITE_YEARLY_COST}/year
      </p>
      <h3 className="mt-1 font-serif text-xl text-ink">Personal Web App Site</h3>
      <p className="mt-2 font-serif text-sm leading-relaxed text-ink/80">
        The web app lives at its own address so it can be added to any device — phone,
        tablet, or laptop. I paid this forward myself through{" "}
        <strong>{formatDate(new Date(SITE_BASE_PAID_UNTIL + "T00:00:00").getTime())}</strong>.
        The bar below reflects how far ahead the site is currently funded — it drains
        gently as that date approaches, and refills when someone helps pay it forward.
      </p>
      <div className="mt-3">
        <div className="flex items-baseline justify-between font-sans text-[11px] text-ink/60">
          <span className="tabular-nums">
            Paid through {formatDate(paidUntil)} · {daysAhead} days ({yearsAhead} yr) ahead
          </span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-ink/70 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 font-sans text-[10px] italic text-ink/50">
          Full when at least one year is funded ahead of today.
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {[1, 5, SITE_YEARLY_COST].map((a) => (
          <button
            key={a}
            onClick={() => give(a)}
            className="rounded-full border border-ink/30 px-3 py-1 font-sans text-xs text-ink transition hover:border-ink hover:bg-ink hover:text-paper"
          >
            {a === SITE_YEARLY_COST ? `Fund a year ($${a})` : `Donate $${a}`}
          </button>
        ))}
        <div className="flex items-center gap-1 rounded-full border border-ink/20 px-2 py-0.5">
          <span className="font-sans text-xs text-ink/60">$</span>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="custom"
            inputMode="decimal"
            className="w-16 bg-transparent py-0.5 font-sans text-xs text-ink placeholder:text-ink/40 focus:outline-none"
          />
          <button
            onClick={() => give("custom")}
            disabled={!custom}
            className="font-sans text-[10px] uppercase tracking-wider text-ink/60 hover:text-ink disabled:opacity-40"
          >
            give
          </button>
        </div>
      </div>
    </section>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const [custom, setCustom] = useState("");
  const pct =
    goal.target > 0 ? Math.min(100, Math.round((goal.raised / goal.target) * 100)) : 0;
  const send = (amount: number | "custom") => {
    const value = amount === "custom" ? Number(custom) || 0 : amount;
    try {
      window.dispatchEvent(
        new CustomEvent("shelf:donate", { detail: { goal: goal.id, amount: value } }),
      );
    } catch {
      /* ignore */
    }
  };
  return (
    <section className="border-t border-dotted border-ink/25 pt-5">
      <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-ink/55">
        {goal.cadence}
      </p>
      <h3 className="mt-1 font-serif text-xl text-ink">{goal.title}</h3>
      <p className="mt-2 font-serif text-sm leading-relaxed text-ink/80">{goal.blurb}</p>
      {goal.target > 0 && (
        <div className="mt-3">
          <div className="flex items-baseline justify-between font-sans text-[11px] text-ink/60">
            <span className="tabular-nums">
              ${goal.raised} / ${goal.target}
              {goal.cadence.includes("Yearly")
                ? " yearly"
                : goal.cadence.includes("Monthly")
                  ? " monthly"
                  : ""}
            </span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="mt-1 h-1 w-full rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-ink/60 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {[1, 3, 5].map((a) => (
          <button
            key={a}
            onClick={() => send(a)}
            className="rounded-full border border-ink/30 px-3 py-1 font-sans text-xs text-ink transition hover:border-ink hover:bg-ink hover:text-paper"
          >
            Donate ${a}
          </button>
        ))}
        <div className="flex items-center gap-1 rounded-full border border-ink/20 px-2 py-0.5">
          <span className="font-sans text-xs text-ink/60">$</span>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="custom"
            inputMode="decimal"
            className="w-16 bg-transparent py-0.5 font-sans text-xs text-ink placeholder:text-ink/40 focus:outline-none"
          />
          <button
            onClick={() => send("custom")}
            disabled={!custom}
            className="font-sans text-[10px] uppercase tracking-wider text-ink/60 hover:text-ink disabled:opacity-40"
          >
            give
          </button>
        </div>
      </div>
    </section>
  );
}

const POLL_OPTIONS = [
  "No thanks",
  "Maybe simple encouragement",
  "Cozy rewards & ambience",
  "RPG-style progression",
  "Nourishment / self-care focused ideas",
];

const LETTER_PARAGRAPHS: string[] = [
  "Hi.",
  "This app exists because modern life started feeling strangely fragmented.",
  "Too many apps. Too many notifications. Too many systems scattered across too many places.",
  "I'm one budget-conscious spouse who was looking for simple support.",
  "Not optimization. Not hustle culture. Not another subscription trying to convince me to become a perfectly organized productivity machine.",
  "I am not a business. I am not a robot. I do not consent to becoming either in the foreseeable future.",
  "I just need realistic support. And honestly? I want this to exist too.",
  "I wanted one calm place to remember groceries, coordinate projects, manage household life, and reduce how much my brain had to carry all at once. Especially on low-energy days.",
  "So instead of waiting for someone else to make it, I decided to start building it myself.",
  "We're beginning as a web app because a web app can be added to any device — phone, tablet, or laptop — which makes it the most affordable and inclusive place to start. I paid the web app site forward myself for the first two years. Google Play will come later when we can get there.",
  "Future goals include an Apple release, expanded syncing, sustainable hosting, and optional accessibility and customization features.",
  "This app is being built with a few important principles: private by default, no ads, no selling user data, no pressure-driven productivity culture, and usable without endless subscriptions.",
  "Privacy matters here. Yours and mine. I don't want my household treated like marketing data, and I don't think yours should be either.",
  "The goal is to build something supportive without turning people into products.",
  "The core app will remain usable whether or not you donate.",
  "I'm covering the first iteration of development myself. Ideally, I won't be covering ongoing development out of pocket forever — but the first iteration is on me.",
  "When a funding goal is met, donations for that goal will close. If a cost repeats monthly or yearly, the goal will quietly reopen when that expense comes back around.",
  "The intention is sustainability. Not endless monetization.",
  "But if this project resonates with you, and you'd like to help pay it forward for future users, you can support the next steps below.",
];

export function DonateBook() {
  const [poll, setPoll] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [mailStatus, setMailStatus] = useState<"idle" | "sent" | "error">("idle");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const toggleRead = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    if (reading) {
      synth.cancel();
      setReading(false);
      return;
    }
    const text = ["Help Us Build This Carefully.", ...LETTER_PARAGRAPHS].join(" ");
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1;
    u.onend = () => setReading(false);
    u.onerror = () => setReading(false);
    utteranceRef.current = u;
    synth.cancel();
    synth.speak(u);
    setReading(true);
  };

  const submitPollMail = async () => {
    if (!poll) return;
    try {
      const res = await fetch("/api/public/poll-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: poll, at: new Date().toISOString() }),
      });
      setMailStatus(res.ok ? "sent" : "error");
    } catch {
      setMailStatus("error");
    } finally {
      window.setTimeout(() => setMailStatus("idle"), 3500);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-md border-2 border-ink/70 bg-ink/5 p-4 text-center">
        <p className="font-sans text-sm font-bold uppercase tracking-[0.18em] text-ink">
          🚧 Site under construction
        </p>
        <p className="mt-1 font-serif text-sm text-ink/80">
          None of the payment links below work yet. They're placeholders while
          the site is being built. Thank you for your patience.
        </p>
      </div>

      <header className="relative">
        <p className="font-sans text-xs uppercase tracking-[0.3em] text-ink/50">
          A note from the maker
        </p>
        <h2 className="mt-2 font-serif text-3xl text-ink">Help Us Build This Carefully</h2>
        <button
          onClick={toggleRead}
          title={reading ? "Stop reading" : "Read this letter aloud"}
          aria-label={reading ? "Stop reading letter" : "Read letter aloud"}
          aria-pressed={reading}
          className="absolute right-0 top-0 text-lg opacity-50 transition hover:opacity-100"
          style={{ color: "#3a2410" }}
        >
          {reading ? "♫" : "♪"}
        </button>
      </header>

      <div className="space-y-3 font-serif text-[15px] leading-relaxed text-ink/85">
        {LETTER_PARAGRAPHS.map((p, i) => (
          <p key={i} className={i === 14 ? "italic" : undefined}>
            {p}
          </p>
        ))}
      </div>

      <div className="space-y-5">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink/55">
          Current goals
        </p>
        <WebsiteGoalCard />
        {GOALS.map((g) => (
          <GoalCard key={g.id} goal={g} />
        ))}
      </div>

      <section className="border-t border-dotted border-ink/25 pt-5">
        <p className="font-serif text-sm italic leading-relaxed text-ink/75">
          Small note: we included a custom amount option because support is support.
          If all someone can or wants to contribute is a penny, honestly, that
          still means they believed this should exist too. And I don't want to
          exclude anyone from participating if they'd like to help.
        </p>
        <p className="mt-3 font-serif text-sm leading-relaxed text-ink/75">
          If the app's basic needs are already covered and you'd simply like to be
          kind anyway, you can also send me a banana at{" "}
          <span className="font-mono text-xs text-ink/60">[xyz]</span>. A banana
          is about 20 cents at my grocery store of choice. 🍌
        </p>
      </section>

      <section className="border-t border-dotted border-ink/25 pt-5">
        <p className="font-serif text-sm leading-relaxed text-ink/85">
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60">P.S. </span>
          I hate choosing between clean apps and whimsical apps — so I made an
          app that doesn't punish me for having changing support needs and
          wishes.
        </p>
      </section>

      <section className="border-t border-dotted border-ink/25 pt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink/55">
            Optional community poll
          </p>
          <button
            onClick={submitPollMail}
            disabled={!poll}
            title={
              poll
                ? "Include this vote in the monthly summary"
                : "Pick an option first"
            }
            aria-label="Send my vote to the monthly summary"
            className="text-base opacity-50 transition hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-25"
            style={{ color: "#3a2410" }}
          >
            ✉
          </button>
        </div>
        <p className="mt-2 font-serif text-sm text-ink">
          Would you enjoy optional low-pressure reward systems someday?
        </p>
        <div className="mt-3 space-y-1.5">
          {POLL_OPTIONS.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 font-serif text-sm text-ink/80 hover:text-ink"
            >
              <input
                type="radio"
                name="donate-poll"
                checked={poll === opt}
                onChange={() => {
                  setPoll(opt);
                  try {
                    window.dispatchEvent(
                      new CustomEvent("shelf:donate-poll", { detail: { choice: opt } }),
                    );
                  } catch {
                    /* ignore */
                  }
                }}
                className="accent-ink"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {mailStatus !== "idle" && (
          <p
            className="mt-2 font-sans text-[11px] italic"
            style={{ color: mailStatus === "sent" ? "#3a6b2e" : "#8a3030" }}
          >
            {mailStatus === "sent"
              ? "Thanks — your vote is queued for the monthly summary."
              : "Couldn't queue your vote right now. Try again soon."}
          </p>
        )}
      </section>

      <p className="border-t border-dotted border-ink/25 pt-5 font-serif text-xs italic text-ink/60">
        Thank you for helping build something calmer. Even sharing feedback helps.
      </p>
    </div>
  );
}
