import { useEffect, useRef } from "react";
import { useSettings } from "./useSettings";

/**
 * Synthesized cat purr loop. Plays whenever:
 *   sfxEnabled && purrsVolume > 0 && atmosphere !== "basic" (Simple) && !talkToMe
 * Built with WebAudio so no asset shipping is required. The purr is a
 * low-frequency amplitude-modulated rumble (~25 Hz purr rate, ~55 Hz body)
 * shaped through a lowpass for a warm, relaxing chest-rumble feel.
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

    // Carrier: warm low rumble
    const carrier = ctx.createOscillator();
    carrier.type = "sawtooth";
    carrier.frequency.value = 55;

    // Lowpass for warmth
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 220;
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

    carrier.connect(lp).connect(amGain).connect(master).connect(ctx.destination);

    carrier.start();
    lfo.start();

    // Smooth fade-in
    const target = 0.18 * purrsVolume;
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
              carrier.stop();
              lfo.stop();
              carrier.disconnect();
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
    const target = active ? 0.18 * purrsVolume : 0;
    node.gain.gain.cancelScheduledValues(ctx.currentTime);
    node.gain.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.15);
  }, [purrsVolume, active]);

  return null;
}
