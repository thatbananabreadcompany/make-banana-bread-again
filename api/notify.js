// api/notify.js — Resend email notifications for MBBA

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = "thatbananabreadcompany@gmail.com";
// Using Resend's default sender until domain is verified
// After verifying makebananabreadagain.com in Resend, change to:
// "MBBA <notifications@makebananabreadagain.com>"
const FROM_EMAIL = "MBBA <onboarding@resend.dev>";

async function sendEmail(subject, html) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set");
    return false;
  }
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
  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
  }
  return res.ok;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;
  const type = body.type;

  if (!type) {
    return res.status(400).json({ error: "Missing type" });
  }

  try {
    let subject = "";
    let html = "";

    if (type === "feedback") {
      subject = `💬 MBBA Feedback: ${body.feedbackType}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1D1D1F;border-bottom:2px solid #FFE135;padding-bottom:12px">New feedback from MBBA</h2>
          <table style="font-size:14px;border-collapse:collapse;width:100%">
            <tr><td style="padding:10px 8px;color:#86868B;width:130px;vertical-align:top">Type</td><td style="padding:10px 8px;font-weight:600">${body.feedbackType || "Not specified"}</td></tr>
            <tr style="background:#F5F5F7"><td style="padding:10px 8px;color:#86868B;vertical-align:top">Name</td><td style="padding:10px 8px">${body.name || "Anonymous"}</td></tr>
            <tr><td style="padding:10px 8px;color:#86868B;vertical-align:top">Email</td><td style="padding:10px 8px">${body.email ? `<a href="mailto:${body.email}" style="color:#0071E3">${body.email}</a>` : "Not provided"}</td></tr>
            <tr style="background:#F5F5F7"><td style="padding:10px 8px;color:#86868B;vertical-align:top">Message</td><td style="padding:10px 8px;line-height:1.6">${body.message || ""}</td></tr>
          </table>
          <p style="font-size:12px;color:#86868B;margin-top:24px;border-top:1px solid #E8E8ED;padding-top:12px">Sent from makebananabreadagain.com</p>
        </div>
      `;
    }

    else if (type === "new_spot") {
      subject = `🍌 New spot submitted: ${body.name}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1D1D1F;border-bottom:2px solid #FFE135;padding-bottom:12px">New spot added to MBBA</h2>
          <table style="font-size:14px;border-collapse:collapse;width:100%">
            <tr><td style="padding:10px 8px;color:#86868B;width:130px">Name</td><td style="padding:10px 8px;font-weight:600">${body.name}</td></tr>
            <tr style="background:#F5F5F7"><td style="padding:10px 8px;color:#86868B">Location</td><td style="padding:10px 8px">${body.loc}</td></tr>
            <tr><td style="padding:10px 8px;color:#86868B">Category</td><td style="padding:10px 8px">${body.cat}</td></tr>
            <tr style="background:#F5F5F7"><td style="padding:10px 8px;color:#86868B">Outlets</td><td style="padding:10px 8px">${body.outlets}</td></tr>
            <tr><td style="padding:10px 8px;color:#86868B">Link</td><td style="padding:10px 8px">${body.url ? `<a href="${body.url}" style="color:#0071E3">${body.url}</a>` : "Not provided"}</td></tr>
            <tr style="background:#F5F5F7"><td style="padding:10px 8px;color:#86868B">Tags</td><td style="padding:10px 8px">${[body.halal && "Halal", body.muslimOwned && "Muslim-owned", body.vegan && "Vegan", body.dairyFree && "Dairy-free"].filter(Boolean).join(", ") || "None"}</td></tr>
          </table>
          <p style="font-size:12px;color:#86868B;margin-top:24px;border-top:1px solid #E8E8ED;padding-top:12px">Sent from makebananabreadagain.com</p>
        </div>
      `;
    }

    else if (type === "flag") {
      subject = `⚑ Listing flagged: ${body.spotName}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1D1D1F;border-bottom:2px solid #FF3B30;padding-bottom:12px">A listing has been flagged</h2>
          <table style="font-size:14px;border-collapse:collapse;width:100%">
            <tr><td style="padding:10px 8px;color:#86868B;width:130px">Spot</td><td style="padding:10px 8px;font-weight:600">${body.spotName}</td></tr>
            <tr style="background:#F5F5F7"><td style="padding:10px 8px;color:#86868B">Location</td><td style="padding:10px 8px">${body.spotLoc || "Unknown"}</td></tr>
            <tr><td style="padding:10px 8px;color:#86868B">Reason</td><td style="padding:10px 8px">${body.reason}</td></tr>
            ${body.otherText ? `<tr style="background:#F5F5F7"><td style="padding:10px 8px;color:#86868B">Details</td><td style="padding:10px 8px">${body.otherText}</td></tr>` : ""}
          </table>
          <div style="margin-top:20px;padding:14px;background:#FFF0F0;border-radius:8px;font-size:13px">
            Review in Supabase → open_flags view, then resolve with:<br/>
            <code style="background:#F5F5F7;padding:2px 6px;border-radius:4px">update flags set resolved = true where id = [id];</code>
          </div>
          <p style="font-size:12px;color:#86868B;margin-top:24px;border-top:1px solid #E8E8ED;padding-top:12px">Sent from makebananabreadagain.com</p>
        </div>
      `;
    }

    else if (type === "weekly_winner") {
      subject = `🏆 Weekly winner: ${body.spotName} — activate in Supabase`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1D1D1F;border-bottom:2px solid #FFE135;padding-bottom:12px">Banana Bread of the Week</h2>
          <table style="font-size:14px;border-collapse:collapse;width:100%">
            <tr><td style="padding:10px 8px;color:#86868B;width:130px">Winner</td><td style="padding:10px 8px;font-weight:600">${body.spotName}</td></tr>
            <tr style="background:#F5F5F7"><td style="padding:10px 8px;color:#86868B">Location</td><td style="padding:10px 8px">${body.spotLoc}</td></tr>
            <tr><td style="padding:10px 8px;color:#86868B">Weekly votes</td><td style="padding:10px 8px">${body.votes}</td></tr>
            <tr style="background:#F5F5F7"><td style="padding:10px 8px;color:#86868B">Week ending</td><td style="padding:10px 8px">${body.weekEnd}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#FFF8DC;border-radius:8px;font-size:14px;line-height:1.8">
            <strong>Your Sunday steps:</strong><br/>
            1. Reach out to the winner via their Instagram or URL<br/>
            2. Agree on a discount code or offer<br/>
            3. Supabase → weekly_winners → find the new row<br/>
            4. Set <code style="background:#F5F5F7;padding:2px 6px;border-radius:4px">active = true</code> and add the code<br/>
            5. Banner goes live on MBBA automatically
          </div>
          <p style="font-size:12px;color:#86868B;margin-top:24px;border-top:1px solid #E8E8ED;padding-top:12px">Sent from makebananabreadagain.com</p>
        </div>
      `;
    }

    else {
      return res.status(400).json({ error: "Unknown type" });
    }

    const sent = await sendEmail(subject, html);
    return res.status(sent ? 200 : 500).json({ ok: sent });

  } catch (err) {
    console.error("Notify error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
