import { useEffect } from "react";
import { useSettings } from "./useSettings";

// Best-effort speech recognition; gracefully no-ops if unsupported.
export function TalkToMe() {
  const { talkToMe, setTalkToMe } = useSettings();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (!talkToMe) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (ev: any) => {
      const text = Array.from(ev.results)
        .map((r: any) => r[0]?.transcript ?? "")
        .join(" ")
        .toLowerCase()
        .trim();
      if (!text) return;
      if (
        text.includes("talk to me off") ||
        text.includes("stop listening") ||
        text.includes("turn off talk to me") ||
        text.includes("be quiet")
      ) {
        setTalkToMe(false);
      }
    };
    rec.onerror = () => {};
    rec.onend = () => {
      // auto-restart while enabled
      if (talkToMe) {
        try { rec.start(); } catch { /* ignore */ }
      }
    };
    try { rec.start(); } catch { /* ignore */ }
    return () => {
      try { rec.stop(); } catch { /* ignore */ }
    };
  }, [talkToMe, setTalkToMe]);

  return null;
}
