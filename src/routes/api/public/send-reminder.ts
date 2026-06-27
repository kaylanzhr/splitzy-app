import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(2000),
});

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export const Route = createFileRoute("/api/public/send-notification")({
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
          const { name, email, message } = parsed.data;

          const RESEND_API_KEY = process.env.RESEND_API_KEY;
          const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
          if (!RESEND_API_KEY || !ADMIN_EMAIL) {
            return Response.json(
              { success: false, message: "Email service is not configured." },
              { status: 500, headers: corsHeaders },
            );
          }

          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Splitzy Notify <onboarding@resend.dev>",
              to: [ADMIN_EMAIL],
              reply_to: email,
              subject: `New message from ${name}`,
              html: `
                <h2>New website notification</h2>
                <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                <p><strong>Message:</strong></p>
                <p>${escapeHtml(message).replaceAll("\n", "<br/>")}</p>
              `,
            }),
          });

          const result = await res.json().catch(() => ({}));
          if (!res.ok) {
            return Response.json(
              { success: false, message: "Failed to send email.", error: result },
              { status: 502, headers: corsHeaders },
            );
          }
          return Response.json(
            { success: true, message: "Notification sent." },
            { headers: corsHeaders },
          );
        } catch (err) {
          console.error("send-notification error", err);
          return Response.json(
            { success: false, message: "Server error." },
            { status: 500, headers: corsHeaders },
          );
        }
      },
    },
  },
});
