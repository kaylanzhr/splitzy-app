// Cloudflare Pages Function for sending email notification

export const onRequestPost = async ({ request, env }: any) => {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return jsonResponse(
        { success: false, message: "Nama, email, dan pesan wajib diisi." },
        400
      );
    }

    const emailPayload = {
      from: "Splitzy Notification <onboarding@resend.dev>",
      to: [env.ADMIN_EMAIL],
      reply_to: email,
      subject: `Notifikasi baru dari ${name}`,
      html: `
        <h2>Notifikasi Baru dari Website</h2>
        <p><strong>Nama:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Pesan:</strong></p>
        <p>${escapeHtml(message)}</p>
      `,
    };

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await resendResponse.json();

    if (!resendResponse.ok) {
      return jsonResponse(
        {
          success: false,
          message: "Email gagal dikirim.",
          error: result,
        },
        500
      );
    }

    return jsonResponse({
      success: true,
      message: "Email berhasil dikirim.",
      data: result,
    });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      500
    );
  }
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
