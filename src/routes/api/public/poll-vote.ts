import { createFileRoute } from "@tanstack/react-router";

/**
 * Accepts a single poll vote from the Donate book and queues it for the
 * monthly summary email. The recipient address is intentionally kept on
 * the server only and is never returned to the client.
 *
 * NOTE: actual email delivery is not yet wired (email infrastructure has
 * not been set up on this project). Votes are accepted and logged so the
 * client UX can confirm receipt; a follow-up will swap the console log
 * for the real monthly report job.
 */
const REPORT_RECIPIENT = "the.super.secret.1@gmail.com";

type Vote = { choice: string; at: string };
const recentVotes: Vote[] = [];

export const Route = createFileRoute("/api/public/poll-vote")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const choice =
          typeof (body as any)?.choice === "string"
            ? String((body as any).choice).slice(0, 200)
            : null;
        if (!choice) {
          return new Response("Missing choice", { status: 400 });
        }
        const vote: Vote = { choice, at: new Date().toISOString() };
        recentVotes.push(vote);
        // Trim in-memory buffer
        if (recentVotes.length > 1000) recentVotes.splice(0, recentVotes.length - 1000);
        // Recipient stays server-side only.
        console.log(
          `[poll-vote] queued for monthly report to ${REPORT_RECIPIENT}:`,
          vote,
        );
        return new Response(JSON.stringify({ ok: true }), {
          status: 202,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
