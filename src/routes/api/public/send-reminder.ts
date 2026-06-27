import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const schema = z.object({
  fromName: z.string().trim().min(1).max(100),
  toName: z.string().trim().min(1).max(100),
  amount: z.string().trim().min(1).max(50),
  groupName: z.string().trim().min(1).max(100).optional(),
  activity: z.string().trim().max(200).optional(),
  splitWays: z.number().int().positive().optional(),
  status: z.string().trim().max(50).optional(),
});

function esc(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export const Route = createFileRoute("/api/public/send-reminder")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const parsed = schema.safeParse(body);
          if (!parsed.success) {
            return Response.json(
              { success: false, message: "Invalid input", errors: parsed.error.flatten() },
              { status: 400, headers: corsHeaders },
            );
          }
          const { fromName, toName, amount, groupName, activity, splitWays, status } = parsed.data;

          const RESEND_API_KEY = process.env.RESEND_API_KEY;
          const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
          if (!RESEND_API_KEY || !ADMIN_EMAIL) {
            return Response.json(
              { success: false, message: "Email service is not configured." },
              { status: 500, headers: corsHeaders },
            );
          }

          const activityLine = activity || "Splitzy group balance";
          const statusLine = status || "Unpaid";
          const subject = `Splitzy Reminder: ${fromName} owes ${amount}`;

          const html = `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
              <h2 style="color:#0d9488;margin:0 0 8px;">Splitzy Reminder</h2>
              <p>Hi <strong>${esc(fromName)}</strong>,</p>
              <p>This is a friendly reminder from Splitzy${groupName ? ` (group: <strong>${esc(groupName)}</strong>)` : ""}.</p>
              <p>You currently have an outstanding balance:</p>
              <ul style="line-height:1.7;">
                <li><strong>Activity:</strong> ${esc(activityLine)}</li>
                <li><strong>Amount owed:</strong> ${esc(amount)}</li>
                <li><strong>Owed to:</strong> ${esc(toName)}</li>
                ${splitWays ? `<li><strong>Split:</strong> ${splitWays} ways</li>` : ""}
                <li><strong>Status:</strong> ${esc(statusLine)}</li>
              </ul>
              <p>Please settle this balance when possible.</p>
              <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
              <p style="font-size:12px;color:#6b7280;">
                Note: This email is sent to the admin email only for demo purposes.
                Intended recipient: <strong>${esc(fromName)}</strong>.
              </p>
            </div>`;

          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Splitzy Reminders <onboarding@resend.dev>",
              to: [ADMIN_EMAIL],
              subject,
              html,
            }),
          });

          const result = await res.json().catch(() => ({}));
          if (!res.ok) {
            return Response.json(
              { success: false, message: "Failed to send reminder.", error: result },
              { status: 502, headers: corsHeaders },
            );
          }
          return Response.json(
            { success: true, message: "Reminder sent." },
            { headers: corsHeaders },
          );
        } catch (err) {
          console.error("send-reminder error", err);
          return Response.json(
            { success: false, message: "Server error." },
            { status: 500, headers: corsHeaders },
          );
        }
      },
    },
  },
});
