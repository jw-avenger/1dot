import { useEffect, useRef } from "react";
import { useSettings } from "./useSettings";

/**
 * Synthesized gentle dog sniffing loop. Plays whenever:
 *   sfxEnabled && sniffsVolume > 0 && atmosphere !== "basic" && !talkToMe
 *
 * Built entirely with WebAudio (no asset shipping). Each "sniff" is a short
 * burst of filtered noise shaped by an envelope, spaced ~1.4–2.4s apart, so it
 * reads as a calm dog nosing around rather than panting.
 */
export function DogSniff() {
  const { sfxEnabled, sniffsVolume, atmosphere, talkToMe } = useSettings();
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  // Keep latest volume in a ref so the scheduling loop reads it live without
  // re-creating the AudioContext on every slider tick.
  const volRef = useRef(sniffsVolume);
  useEffect(() => {
    volRef.current = sniffsVolume;
  }, [sniffsVolume]);

  const active =
    sfxEnabled && sniffsVolume > 0 && atmosphere !== "basic" && !talkToMe;

  useEffect(() => {
    if (!active) {
      stopRef.current?.();
      stopRef.current = null;
      return;
    }
    if (typeof window === "undefined") return;

    const AC: typeof AudioContext =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = ctxRef.current ?? new AC();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    let cancelled = false;
    let timer = 0;

    // Generate ~0.5s of brown-noise buffer reused for every sniff burst.
    const bufLen = Math.floor(ctx.sampleRate * 0.5);
    const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufLen; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }

    const playSniff = (kind: "in" | "out") => {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = kind === "in" ? 900 : 600;
      bp.Q.value = 0.9;
      const g = ctx.createGain();
      const now = ctx.currentTime;
      const peak = (kind === "in" ? 0.55 : 0.4) * Math.max(0, Math.min(1, volRef.current));
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(peak, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + (kind === "in" ? 0.32 : 0.42));
      src.connect(bp).connect(g).connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.5);
    };

    const schedule = () => {
      if (cancelled) return;
      // A little phrasing: two quick sniffs in, brief pause, soft exhale.
      playSniff("in");
      window.setTimeout(() => !cancelled && playSniff("in"), 280);
      window.setTimeout(() => !cancelled && playSniff("out"), 720);
      const nextMs = 1400 + Math.random() * 1000;
      timer = window.setTimeout(schedule, nextMs + 600);
    };
    timer = window.setTimeout(schedule, 600);

    stopRef.current = () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [active]);

  return null;
}
