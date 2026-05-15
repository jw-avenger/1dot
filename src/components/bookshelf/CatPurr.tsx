import { useEffect, useRef } from "react";
import { useSettings } from "./useSettings";

/**
 * Synthesized cat purr loop. Plays whenever:
 *   sfxEnabled && purrsVolume > 0 && atmosphere !== "basic" (Simple) && !talkToMe
 * Built with WebAudio so no asset shipping is required. The purr is a
 * low-frequency amplitude-modulated rumble with audible upper harmonics so it
 * remains hearable on small phone/tablet speakers as well as headphones.
 */
export function CatPurr() {
  const { sfxEnabled, purrsVolume, atmosphere, talkToMe } = useSettings();
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ gain: GainNode; stop: () => void } | null>(null);

  const active =
    sfxEnabled && purrsVolume > 0 && atmosphere !== "basic" && !talkToMe;

  useEffect(() => {
    if (!active) {
      nodesRef.current?.stop();
      nodesRef.current = null;
      return;
    }
    if (typeof window === "undefined") return;
    if (nodesRef.current) return;

    const AC: typeof AudioContext =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;

    const ctx = ctxRef.current ?? new AC();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    // Carriers: warm body rumble plus upper harmonics that small speakers can reproduce.
    const body = ctx.createOscillator();
    body.type = "sawtooth";
    body.frequency.value = 58;
    const chest = ctx.createOscillator();
    chest.type = "triangle";
    chest.frequency.value = 116;
    const throat = ctx.createOscillator();
    throat.type = "sine";
    throat.frequency.value = 174;

    const bodyGain = ctx.createGain();
    bodyGain.gain.value = 0.95;
    const chestGain = ctx.createGain();
    chestGain.gain.value = 0.48;
    const throatGain = ctx.createGain();
    throatGain.gain.value = 0.2;

    // Lowpass for warmth
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 520;
    lp.Q.value = 0.7;

    // Amplitude modulation = the actual "purr" rate
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 25; // breaths per second-ish
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5;

    const amGain = ctx.createGain();
    amGain.gain.value = 0.5; // baseline; LFO adds ±0.5

    lfo.connect(lfoGain).connect(amGain.gain);

    // Master gain (controlled by purrsVolume)
    const master = ctx.createGain();
    master.gain.value = 0;

    body.connect(bodyGain).connect(lp);
    chest.connect(chestGain).connect(lp);
    throat.connect(throatGain).connect(lp);
    lp.connect(amGain).connect(master).connect(ctx.destination);

    body.start();
    chest.start();
    throat.start();
    lfo.start();

    // Smooth fade-in
    const target = 0.95 * purrsVolume;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.6);

    nodesRef.current = {
      gain: master,
      stop: () => {
        try {
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
          setTimeout(() => {
            try {
              body.stop();
              chest.stop();
              throat.stop();
              lfo.stop();
              body.disconnect();
              chest.disconnect();
              throat.disconnect();
              bodyGain.disconnect();
              chestGain.disconnect();
              throatGain.disconnect();
              lfo.disconnect();
              lfoGain.disconnect();
              amGain.disconnect();
              lp.disconnect();
              master.disconnect();
            } catch {
              /* ignore */
            }
          }, 500);
        } catch {
          /* ignore */
        }
      },
    };

    return () => {
      nodesRef.current?.stop();
      nodesRef.current = null;
    };
  }, [active]);

  // Live-update volume without rebuilding the graph
  useEffect(() => {
    const node = nodesRef.current;
    const ctx = ctxRef.current;
    if (!node || !ctx) return;
    if (active && ctx.state === "suspended") ctx.resume().catch(() => {});
    const target = active ? 0.95 * purrsVolume : 0;
    node.gain.gain.cancelScheduledValues(ctx.currentTime);
    node.gain.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.15);
  }, [purrsVolume, active]);

  return null;
}
