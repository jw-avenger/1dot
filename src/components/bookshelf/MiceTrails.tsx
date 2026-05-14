import { useEffect, useRef } from "react";
import { useSettings } from "./useSettings";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  kind: string;
  color: string;
  size: number;
};

let audioCtx: AudioContext | null = null;
function tone(freq: number, durMs: number, type: OscillatorType = "sine", gain = 0.04) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + durMs / 1000);
    o.stop(audioCtx.currentTime + durMs / 1000);
  } catch {
    // ignore
  }
}

export function MiceTrails() {
  const { mice, sfxEnabled, romanticColor } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastSoundRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      if (mice === "basic") {
        // grey dot, very subtle
        particlesRef.current.push({
          x: e.clientX, y: e.clientY, vx: 0, vy: 0,
          life: 0, max: 18, kind: "dot", color: "rgba(150,150,150,0.5)", size: 3,
        });
      } else if (mice === "cozy") {
        particlesRef.current.push({
          x: e.clientX, y: e.clientY,
          vx: (Math.random() - 0.5) * 0.4, vy: 0.2,
          life: 0, max: 40, kind: "dot",
          color: `hsla(${30 + Math.random() * 20}, 60%, 60%, 0.55)`, size: 5,
        });
      } else if (mice === "whimsical") {
        if (Math.random() < 0.35) {
          particlesRef.current.push({
            x: e.clientX + (Math.random() - 0.5) * 10,
            y: e.clientY + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 0.4, vy: -0.3,
            life: 0, max: 45, kind: "diamond",
            color: "#daa520", size: 4 + Math.random() * 3,
          });
          maybeSfx(sfxEnabled, lastSoundRef, () => tone(1500 + Math.random() * 400, 80, "triangle", 0.025));
        }
      } else if (mice === "romantic") {
        if (Math.random() < 0.4) {
          particlesRef.current.push({
            x: e.clientX, y: e.clientY,
            vx: (Math.random() - 0.5) * 0.3, vy: -0.4,
            life: 0, max: 50, kind: "heart",
            color: romanticColor || "#c42b2b", size: 8,
          });
          maybeSfx(sfxEnabled, lastSoundRef, () => tone(880, 60, "sine", 0.02));
        }
      } else if (mice === "spa") {
        particlesRef.current.push({
          x: e.clientX, y: e.clientY,
          vx: 0, vy: -0.1,
          life: 0, max: 60, kind: "ring",
          color: "rgba(180,210,200,0.5)", size: 6,
        });
        maybeSfx(sfxEnabled, lastSoundRef, () => tone(660, 250, "sine", 0.015), 800);
      } else if (mice === "paperplanner") {
        particlesRef.current.push({
          x: e.clientX, y: e.clientY,
          vx: 0, vy: 0,
          life: 0, max: 90, kind: "dot",
          color: "rgba(0,0,0,0.7)", size: 1.5,
        });
        maybeSfx(sfxEnabled, lastSoundRef, () => tone(180, 30, "sawtooth", 0.012), 70);
      } else if (mice === "nature") {
        particlesRef.current.push({
          x: e.clientX, y: e.clientY,
          vx: (Math.random() - 0.5) * 0.5, vy: 0.1,
          life: 0, max: 55, kind: "leaf",
          color: `hsla(${90 + Math.random() * 30}, 40%, 45%, 0.7)`, size: 4,
        });
        maybeSfx(sfxEnabled, lastSoundRef, () => tone(220, 400, "sine", 0.01), 1200);
      } else if (mice === "custom") {
        particlesRef.current.push({
          x: e.clientX, y: e.clientY,
          vx: 0, vy: 0, life: 0, max: 25, kind: "dot",
          color: "rgba(150,150,150,0.5)", size: 3,
        });
      }
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const arr = particlesRef.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        const t = 1 - p.life / p.max;
        if (t <= 0) {
          arr.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = t;
        if (p.kind === "diamond") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        } else if (p.kind === "heart") {
          drawHeart(ctx, p.x, p.y, p.size, p.color);
        } else if (p.kind === "ring") {
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.arc(p.x, p.y, p.size + (1 - t) * 14, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.kind === "leaf") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.life * 0.05);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [mice, sfxEnabled, romanticColor]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[55]"
      aria-hidden
    />
  );
}

function maybeSfx(
  enabled: boolean,
  ref: React.MutableRefObject<number>,
  play: () => void,
  minGap = 120,
) {
  if (!enabled) return;
  const now = performance.now();
  if (now - ref.current < minGap) return;
  ref.current = now;
  play();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 10, s / 10);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.bezierCurveTo(0, -2, -6, -2, -6, 2);
  ctx.bezierCurveTo(-6, 6, 0, 9, 0, 12);
  ctx.bezierCurveTo(0, 9, 6, 6, 6, 2);
  ctx.bezierCurveTo(6, -2, 0, -2, 0, 3);
  ctx.fill();
  ctx.restore();
}
