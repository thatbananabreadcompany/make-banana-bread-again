// api/notify.js — Resend email notifications for MBBA
// Handles: feedback, new spot, flag, weekly winner

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = "thatbananabreadcompany@gmail.com";
const FROM_EMAIL = "MBBA <notifications@makebananabreadagain.com>";

async function sendEmail(subject, html) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject,
      html,
    }),
  });
  return res.ok;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;
  const type = body.type;

  try {
    let subject = "";
    let html = "";

    if (type === "feedback") {
      subject = `💬 New feedback: ${body.feedbackType}`;
      html = `
        <h2 style="color:#1D1D1F;font-family:sans-serif">New feedback from MBBA</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;color:#86868B;width:140px">Type</td><td style="padding:8px;font-weight:600">${body.feedbackType}</td></tr>
          <tr><td style="padding:8px;color:#86868B">Name</td><td style="padding:8px">${body.name}</td></tr>
          <tr><td style="padding:8px;color:#86868B">Email</td><td style="padding:8px"><a href="mailto:${body.email}">${body.email}</a></td></tr>
          <tr><td style="padding:8px;color:#86868B;vertical-align:top">Message</td><td style="padding:8px;line-height:1.6">${body.message}</td></tr>
        </table>
        <p style="font-family:sans-serif;font-size:12px;color:#86868B;margin-top:24px">Sent from makebananabreadagain.com</p>
      `;
    }

    else if (type === "new_spot") {
      subject = `🍌 New spot submitted: ${body.name}`;
      html = `
        <h2 style="color:#1D1D1F;font-family:sans-serif">New spot added to MBBA</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;color:#86868B;width:140px">Name</td><td style="padding:8px;font-weight:600">${body.name}</td></tr>
          <tr><td style="padding:8px;color:#86868B">Location</td><td style="padding:8px">${body.loc}</td></tr>
          <tr><td style="padding:8px;color:#86868B">Category</td><td style="padding:8px">${body.cat}</td></tr>
          <tr><td style="padding:8px;color:#86868B">Outlets</td><td style="padding:8px">${body.outlets}</td></tr>
          <tr><td style="padding:8px;color:#86868B">Link</td><td style="padding:8px">${body.url ? `<a href="${body.url}">${body.url}</a>` : "Not provided"}</td></tr>
          <tr><td style="padding:8px;color:#86868B">Tags</td><td style="padding:8px">${[body.halal&&"Halal",body.muslimOwned&&"Muslim-owned",body.vegan&&"Vegan",body.dairyFree&&"Dairy-free"].filter(Boolean).join(", ")||"None"}</td></tr>
        </table>
        <p style="font-family:sans-serif;font-size:12px;color:#86868B;margin-top:24px">Sent from makebananabreadagain.com</p>
      `;
    }

    else if (type === "flag") {
      subject = `⚑ Listing flagged: ${body.spotName}`;
      html = `
        <h2 style="color:#1D1D1F;font-family:sans-serif">A listing has been flagged</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;color:#86868B;width:140px">Spot</td><td style="padding:8px;font-weight:600">${body.spotName}</td></tr>
          <tr><td style="padding:8px;color:#86868B">Location</td><td style="padding:8px">${body.spotLoc}</td></tr>
          <tr><td style="padding:8px;color:#86868B">Reason</td><td style="padding:8px">${body.reason}</td></tr>
          ${body.otherText ? `<tr><td style="padding:8px;color:#86868B">Details</td><td style="padding:8px">${body.otherText}</td></tr>` : ""}
        </table>
        <p style="font-family:sans-serif;font-size:12px;color:#86868B;margin-top:24px">Review in Supabase → open_flags view</p>
      `;
    }

    else if (type === "weekly_winner") {
      subject = `🏆 Weekly winner: ${body.spotName} — activate in Supabase`;
      html = `
        <h2 style="color:#1D1D1F;font-family:sans-serif">This week's Banana Bread of the Week</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;color:#86868B;width:140px">Winner</td><td style="padding:8px;font-weight:600">${body.spotName}</td></tr>
          <tr><td style="padding:8px;color:#86868B">Location</td><td style="padding:8px">${body.spotLoc}</td></tr>
          <tr><td style="padding:8px;color:#86868B">Weekly votes</td><td style="padding:8px">${body.votes}</td></tr>
          <tr><td style="padding:8px;color:#86868B">Week ending</td><td style="padding:8px">${body.weekEnd}</td></tr>
        </table>
        <div style="margin-top:24px;padding:16px;background:#FFF8DC;border-radius:8px;font-family:sans-serif;font-size:14px">
          <strong>Next steps:</strong><br/>
          1. Reach out to the winner via their Instagram or URL<br/>
          2. Agree on a discount code or offer<br/>
          3. Go to Supabase → weekly_winners table<br/>
          4. Set <code>active = true</code> and add the discount code<br/>
          5. Banner goes live on MBBA automatically
        </div>
        <p style="font-family:sans-serif;font-size:12px;color:#86868B;margin-top:24px">Sent from makebananabreadagain.com</p>
      `;
    }

    else {
      return res.status(400).json({ error: "Unknown notification type" });
    }

    const sent = await sendEmail(subject, html);
    if (sent) {
      return res.status(200).json({ ok: true });
    } else {
      return res.status(500).json({ error: "Email failed to send" });
    }

  } catch (err) {
    console.error("Notify error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
