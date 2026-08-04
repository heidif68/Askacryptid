const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message, type } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }
  if (message.length > 5000) {
    return res.status(400).json({ error: "Message is too long" });
  }
  if (email && (typeof email !== "string" || !EMAIL_RE.test(email))) {
    return res.status(400).json({ error: "Invalid email address" });
  }
  if (name && (typeof name !== "string" || name.length > 200)) {
    return res.status(400).json({ error: "Invalid name" });
  }

  const kind = type === "suggestion" ? "suggestion" : "contact";
  const subject = kind === "suggestion" ? "New cryptid suggestion" : "New contact form message";

  const html = `
    <p><strong>Type:</strong> ${escapeHtml(kind)}</p>
    <p><strong>Name:</strong> ${escapeHtml(name || "(not provided)")}</p>
    <p><strong>Email:</strong> ${escapeHtml(email || "(not provided)")}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Ask a Cryptid <onboarding@resend.dev>",
        to: process.env.CONTACT_EMAIL,
        reply_to: email || undefined,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Resend error:", errText);
      return res.status(502).json({ error: "Failed to send message" });
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
}
