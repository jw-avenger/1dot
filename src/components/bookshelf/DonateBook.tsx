import { useState } from "react";

/**
 * Donate book interior. Long-form letter from the maker plus three funding
 * goals (Google Play, Apple developer license, hosting & sync) and an
 * optional community poll. Donate buttons are placeholders — they emit a
 * `shelf:donate` custom event so a payment integration can be wired later
 * without changing this component's copy or layout.
 */

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
    id: "play",
    title: "Google Play Release",
    cadence: "One-time cost",
    blurb:
      "I paid this forward upfront so the project could begin. If you'd like to help reimburse that starting cost and support future development, you can here.",
    raised: 11,
    target: 25,
  },
  {
    id: "apple",
    title: "Apple Developer License",
    cadence: "Yearly cost",
    blurb:
      "Apple requires a yearly developer fee to publish on iPhone and iPad. We'd genuinely love to support Apple users too — we're just starting where we can realistically afford to begin.",
    raised: 43,
    target: 99,
  },
  {
    id: "hosting",
    title: "Hosting & Sync Infrastructure",
    cadence: "Monthly cost",
    blurb:
      "Helping keep shared spaces, syncing, and backups sustainable.",
    raised: 112,
    target: 250,
  },
];

function GoalCard({ goal }: { goal: Goal }) {
  const [custom, setCustom] = useState("");
  const pct = Math.min(100, Math.round((goal.raised / goal.target) * 100));
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
      <div className="mt-3">
        <div className="flex items-baseline justify-between font-sans text-[11px] text-ink/60">
          <span className="tabular-nums">
            ${goal.raised} / ${goal.target}
            {goal.cadence.includes("Yearly") ? " yearly" : goal.cadence.includes("Monthly") ? " monthly" : ""}
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

export function DonateBook() {
  const [poll, setPoll] = useState<string | null>(null);
  return (
    <div className="space-y-5">
      <header>
        <p className="font-sans text-xs uppercase tracking-[0.3em] text-ink/50">
          A note from the maker
        </p>
        <h2 className="mt-2 font-serif text-3xl text-ink">Help Us Build This Carefully</h2>
      </header>

      <div className="space-y-3 font-serif text-[15px] leading-relaxed text-ink/85">
        <p>Hi.</p>
        <p>This app exists because modern life started feeling strangely fragmented.</p>
        <p>Too many apps. Too many notifications. Too many systems scattered across too many places.</p>
        <p>I'm one budget-conscious spouse who was looking for simple support.</p>
        <p>Not optimization. Not hustle culture. Not another subscription trying to convince me to become a perfectly organized productivity machine.</p>
        <p>I am not a business. I am not a robot. I do not consent to becoming either in the foreseeable future.</p>
        <p>I just need realistic support. And honestly? I want this to exist too.</p>
        <p>I wanted one calm place to:</p>
        <ul className="ml-5 list-disc space-y-1 text-ink/80">
          <li>remember groceries,</li>
          <li>coordinate projects,</li>
          <li>manage household life,</li>
          <li>and reduce how much my brain had to carry all at once.</li>
        </ul>
        <p>Especially on low-energy days.</p>
        <p>So instead of waiting for someone else to make it, I decided to start building it myself.</p>
        <p>We're beginning with a simple Google / web release because it's the most affordable place to start.</p>
        <p>Future goals include:</p>
        <ul className="ml-5 list-disc space-y-1 text-ink/80">
          <li>Apple release</li>
          <li>expanded syncing</li>
          <li>sustainable hosting</li>
          <li>optional accessibility and customization features</li>
        </ul>
        <p>This app is being built with a few important principles:</p>
        <ul className="ml-5 list-disc space-y-1 text-ink/80">
          <li>private by default</li>
          <li>no ads</li>
          <li>no selling user data</li>
          <li>no pressure-driven productivity culture</li>
          <li>usable without endless subscriptions</li>
        </ul>
        <p>Privacy matters here. Yours and mine.</p>
        <p>I don't want my household treated like marketing data, and I don't think yours should be either.</p>
        <p>The goal is to build something supportive without turning people into products.</p>
        <p className="italic">The core app will remain usable whether or not you donate.</p>
        <p>And genuinely: I am serious about not wanting this to become a giant business machine.</p>
        <p>When a funding goal is met, donations for that goal will close. If a cost repeats monthly or yearly, the goal will quietly reopen when that expense comes back around.</p>
        <p>The intention is sustainability. Not endless monetization.</p>
        <p>But if this project resonates with you, and you'd like to help pay it forward for future users, you can support the next steps below.</p>
      </div>

      <div className="space-y-5">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink/55">
          Current goals
        </p>
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
          is about 20 cents at Walmart. 🍌
        </p>
      </section>

      <section className="border-t border-dotted border-ink/25 pt-5">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink/55">
          Optional community poll
        </p>
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
      </section>

      <p className="border-t border-dotted border-ink/25 pt-5 font-serif text-xs italic text-ink/60">
        Thank you for helping build something calmer. Even sharing feedback helps.
      </p>
    </div>
  );
}
