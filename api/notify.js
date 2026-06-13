// api/notify.js - MBBA email notifications + backend flag creation

const RESEND_API_KEY = process.env.RESEND_API_KEY;

const TO_EMAIL =
  process.env.ADMIN_EMAIL || "thatbananabreadcompany@gmail.com";

const FROM_EMAIL =
  process.env.FROM_EMAIL || "MBBA <onboarding@resend.dev>";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ROLE_KEY ||
  process.env.SERVICE_ROLE_KEY;

function safe(value) {
  if (value === null || value === undefined || value === "") return "—";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function createFlag({ spotId, reason, otherText }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase backend env vars", {
      hasUrl: Boolean(SUPABASE_URL),
      hasServiceKey: Boolean(SUPABASE_SERVICE_ROLE_KEY),
    });
    return null;
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/flags`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      spot_id: spotId,
      reason: reason || "Other",
      other_text: otherText || "",
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("Supabase flag insert error:", text);
    return null;
  }

  if (!text) {
    console.error("Supabase insert returned empty response");
    return null;
  }

  try {
    const data = JSON.parse(text);
    return Array.isArray(data) ? data[0] : data;
  } catch (err) {
    console.error("Flag JSON parse error:", err, text);
    return null;
  }
}

async function sendEmail(subject, html, text) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set");
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject,
      html,
      text,
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

  try {
    const {
      type,
      name,
      email,
      message,

      spot,
      spotId,
      location,
      category,
      url,

      reason,
      otherText,

      oldName,
      newName,
      oldLocation,
      newLocation,
      oldCategory,
      newCategory,
      halal,
      muslimOwned,
      vegan,
      dairyFree,
      multipleOutlets,
      hiddenGem,
    } = req.body || {};

    const isFlag = type === "flag";

    let subject = "";
    let html = "";
    let text = "";

    if (isFlag) {
      const insertedFlag = await createFlag({
        spotId,
        reason,
        otherText,
      });

      const flagId = insertedFlag?.id;

      const cleanFlagId = safe(flagId);
      const cleanSpotId = safe(spotId);
      const cleanSpot = safe(spot || `Spot ID ${spotId}`);
      const cleanLocation = safe(location);
      const cleanCategory = safe(category);
      const cleanReason = safe(reason);
      const cleanDetails = safe(otherText || message);
      const cleanUrl = safe(url);

      subject = `🚩 Listing flagged: ${cleanSpot}${
        flagId ? ` — Flag #${cleanFlagId}` : ""
      }`;

      html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111; line-height: 1.5;">
          <h2 style="margin-bottom: 8px;">🚩 Listing flagged: ${cleanSpot}</h2>

          <p style="margin-top: 0;">A listing has been flagged on MBBA.</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; background: #f3f3f3; font-weight: bold; width: 35%;">Flag ID</td>
              <td style="padding: 10px; background: #f3f3f3;">${cleanFlagId}</td>
            </tr>

            <tr>
              <td style="padding: 10px; font-weight: bold;">Spot ID</td>
              <td style="padding: 10px;">${cleanSpotId}</td>
            </tr>

            <tr>
              <td style="padding: 10px; background: #f3f3f3; font-weight: bold;">Spot</td>
              <td style="padding: 10px; background: #f3f3f3;">${cleanSpot}</td>
            </tr>

            <tr>
              <td style="padding: 10px; font-weight: bold;">Location</td>
              <td style="padding: 10px;">${cleanLocation}</td>
            </tr>

            <tr>
              <td style="padding: 10px; background: #f3f3f3; font-weight: bold;">Category</td>
              <td style="padding: 10px; background: #f3f3f3;">${cleanCategory}</td>
            </tr>

            <tr>
              <td style="padding: 10px; font-weight: bold;">Reason</td>
              <td style="padding: 10px;">${cleanReason}</td>
            </tr>

            <tr>
              <td style="padding: 10px; background: #f3f3f3; font-weight: bold;">Details</td>
              <td style="padding: 10px; background: #f3f3f3;">${cleanDetails}</td>
            </tr>

            ${
              url
                ? `
            <tr>
              <td style="padding: 10px; font-weight: bold;">Listing URL</td>
              <td style="padding: 10px;">
                <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>
              </td>
            </tr>
            `
                : ""
            }
          </table>

          <div style="margin-top: 24px; padding: 16px; background: #fff3f3; border-left: 4px solid #d33; border-radius: 8px;">
            <p style="margin: 0 0 8px 0;">
              <strong>Resolve this flag in Supabase:</strong>
            </p>

            <code style="display: block; white-space: pre-wrap; background: #eee; padding: 12px; border-radius: 8px; color: #111;">
update flags set resolved = true where id = ${cleanFlagId};
            </code>
          </div>

          <p style="margin-top: 24px; font-size: 13px; color: #777;">
            Sent from <a href="https://makebananabreadagain.com">makebananabreadagain.com</a>
          </p>
        </div>
      `;

      text = `
Listing flagged: ${cleanSpot}

Flag ID: ${cleanFlagId}
Spot ID: ${cleanSpotId}
Spot: ${cleanSpot}
Location: ${cleanLocation}
Category: ${cleanCategory}
Reason: ${cleanReason}
Details: ${cleanDetails}
URL: ${cleanUrl}

Resolve in Supabase:
update flags set resolved = true where id = ${cleanFlagId};

Sent from makebananabreadagain.com
      `;
    } else if (type === "edit") {
      const cleanSpot = safe(spot || newName || `Spot ID ${spotId}`);
      const cleanSpotId = safe(spotId);
      const cleanOldName = safe(oldName);
      const cleanNewName = safe(newName || spot);
      const cleanOldLocation = safe(oldLocation);
      const cleanNewLocation = safe(newLocation || location);
      const cleanOldCategory = safe(oldCategory);
      const cleanNewCategory = safe(newCategory || category);
      const cleanUrl = safe(url);

      const tagList = [
        halal ? "Halal" : null,
        muslimOwned ? "Muslim-owned" : null,
        vegan ? "Vegan" : null,
        dairyFree ? "Dairy-free" : null,
        multipleOutlets ? "Multiple outlets" : null,
        hiddenGem ? "Hidden gems" : null,
      ].filter(Boolean);

      const cleanTags = safe(
        tagList.length ? tagList.join(", ") : "None selected"
      );

      subject = `✏️ Listing edit submitted: ${cleanSpot}`;

      html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111; line-height: 1.5;">
          <h2 style="margin-bottom: 8px;">✏️ Listing edit submitted: ${cleanSpot}</h2>

          <p style="margin-top: 0;">Someone submitted an update for this MBBA listing.</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; background: #f3f3f3; font-weight: bold; width: 35%;">Spot</td>
              <td style="padding: 10px; background: #f3f3f3;">${cleanSpot}</td>
            </tr>

            <tr>
              <td style="padding: 10px; font-weight: bold;">Spot ID</td>
              <td style="padding: 10px;">${cleanSpotId}</td>
            </tr>

            <tr>
              <td style="padding: 10px; background: #f3f3f3; font-weight: bold;">Old name</td>
              <td style="padding: 10px; background: #f3f3f3;">${cleanOldName}</td>
            </tr>

            <tr>
              <td style="padding: 10px; font-weight: bold;">New name</td>
              <td style="padding: 10px;">${cleanNewName}</td>
            </tr>

            <tr>
              <td style="padding: 10px; background: #f3f3f3; font-weight: bold;">Old location</td>
              <td style="padding: 10px; background: #f3f3f3;">${cleanOldLocation}</td>
            </tr>

            <tr>
              <td style="padding: 10px; font-weight: bold;">New location</td>
              <td style="padding: 10px;">${cleanNewLocation}</td>
            </tr>

            <tr>
              <td style="padding: 10px; background: #f3f3f3; font-weight: bold;">Old category</td>
              <td style="padding: 10px; background: #f3f3f3;">${cleanOldCategory}</td>
            </tr>

            <tr>
              <td style="padding: 10px; font-weight: bold;">New category</td>
              <td style="padding: 10px;">${cleanNewCategory}</td>
            </tr>

            <tr>
              <td style="padding: 10px; background: #f3f3f3; font-weight: bold;">Tags selected</td>
              <td style="padding: 10px; background: #f3f3f3;">${cleanTags}</td>
            </tr>

            ${
              url
                ? `
            <tr>
              <td style="padding: 10px; font-weight: bold;">Link</td>
              <td style="padding: 10px;">
                <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>
              </td>
            </tr>
            `
                : ""
            }
          </table>

          <p style="margin-top: 24px; font-size: 13px; color: #777;">
            Sent from <a href="https://makebananabreadagain.com">makebananabreadagain.com</a>
          </p>
        </div>
      `;

      text = `
Listing edit submitted: ${cleanSpot}

Spot ID: ${cleanSpotId}
Old name: ${cleanOldName}
New name: ${cleanNewName}
Old location: ${cleanOldLocation}
New location: ${cleanNewLocation}
Old category: ${cleanOldCategory}
New category: ${cleanNewCategory}
Tags selected: ${cleanTags}
Link: ${cleanUrl}

Sent from makebananabreadagain.com
      `;
    } else {
      subject = `MBBA message: ${safe(type || "General feedback")}`;

      html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111; line-height: 1.5;">
          <h2>New MBBA message</h2>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; background: #f3f3f3; font-weight: bold;">Type</td>
              <td style="padding: 10px; background: #f3f3f3;">${safe(type)}</td>
            </tr>

            <tr>
              <td style="padding: 10px; font-weight: bold;">Name</td>
              <td style="padding: 10px;">${safe(name)}</td>
            </tr>

            <tr>
              <td style="padding: 10px; background: #f3f3f3; font-weight: bold;">Email</td>
              <td style="padding: 10px; background: #f3f3f3;">${safe(email)}</td>
            </tr>

            <tr>
              <td style="padding: 10px; font-weight: bold;">Message</td>
              <td style="padding: 10px;">${safe(message)}</td>
            </tr>
          </table>

          <p style="margin-top: 24px; font-size: 13px; color: #777;">
            Sent from <a href="https://makebananabreadagain.com">makebananabreadagain.com</a>
          </p>
        </div>
      `;

      text = `
New MBBA message

Type: ${safe(type)}
Name: ${safe(name)}
Email: ${safe(email)}
Message: ${safe(message)}

Sent from makebananabreadagain.com
      `;
    }

    const ok = await sendEmail(subject, html, text);

    if (!ok) {
      return res.status(500).json({ error: "Email failed to send" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Notify error:", error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}