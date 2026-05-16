/**
 * Browsers require a user gesture before an AudioContext will actually produce
 * sound. CatPurr / DogSniff mount on app load so their contexts always start
 * suspended. This helper registers contexts and resumes them on the first
 * pointer/key/touch interaction (and on every later one too, since iOS Safari
 * sometimes re-suspends after tab switches).
 */
const contexts = new Set<AudioContext>();
let attached = false;

function resumeAll() {
  contexts.forEach((c) => {
    if (c.state === "suspended") c.resume().catch(() => {});
  });
}

function attach() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  const events: Array<keyof WindowEventMap> = ["pointerdown", "touchstart", "keydown", "click"];
  events.forEach((ev) => window.addEventListener(ev, resumeAll, { capture: true }));
}

export function registerAudioContext(ctx: AudioContext) {
  contexts.add(ctx);
  attach();
  // Also try right away — works if we're already in a user-gesture callback.
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
}
