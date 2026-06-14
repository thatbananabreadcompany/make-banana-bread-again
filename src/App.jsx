import { useState, useEffect, useMemo, useCallback } from "react";

const T = {
  white: "#FFFFFF",
  black: "#1D1D1F",
  yellow: "#FFE135",
  muted: "#86868B",
  sep: "#F5F5F7",
  border: "#E8E8ED",
  blue: "#0071E3",
  green: "#34C759",
  red: "#FF3B30",
  orange: "#FF9500",
  font: "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',Arial,sans-serif",
};

const CONTACT = "thatbananabreadcompany@gmail.com";

const CATS = [
  "Café",
  "Restaurant",
  "Chain",
  "Heritage",
  "Hawker",
  "Home Baker",
  "Bakery",
  "Confectionery",
  "Japanese",
  "Hotel",
];

const ABOUT_TEXT = [
  "Most people have no idea how big Singapore's banana bread scene really is. It all started with a Reddit thread.",
  "Heritage bakeries that have been doing it for generations. Japanese confectioneries with their own take. Home bakers taking orders through Instagram DMs. Cafés experimenting with flavours and techniques you won't find anywhere else.",
  "It's all out there. The problem is, most of it never gets discovered.",
  "We're building a community-powered guide to Singapore's best banana bread. No critics. No paid rankings. No secret judging panels. Just banana bread lovers having their say.",
  "Every bakery, café, home baker, and brand gets the same shot. A home baker in Tampines gets the same chance as a chain with forty outlets. The votes decide. We're just here to help people discover great banana bread.",
  "MBBA is an initiative by the team behind That Banana Bread Company. We love banana bread in all its forms, and yes, TBBC is on the list too. Same rules. Same votes. Same fate as everyone else.",
  "Vote for your favourites. Discover something new. Add a spot we've missed. Tell your friends.",
  "Let's make banana… bread again.",
];

const FAQS = [
  {
    q: "What is Make Banana Bread Again?",
    a: "A community game and directory celebrating Singapore's banana bread scene. It started with a Reddit thread on r/SingaporeEats. The community kept adding more. MBBA is what happened next.",
  },
  {
    q: "Are these rankings official?",
    a: "No. Rankings reflect community votes only. They are for discovery and entertainment. Nothing here is a professional review, a competition, or a commercial endorsement of any business.",
  },
  {
    q: "How do I get my business listed?",
    a: `Anyone can add a spot using the Add section. To update or remove a listing, contact us at ${CONTACT}.`,
  },
  {
    q: "Can I get my listing removed?",
    a: `Yes. Email ${CONTACT} and we will act on it promptly.`,
  },
];

const DISCLAIMER =
  "All rankings and ratings on this website are based on community submissions and opinions. They are provided for informational and entertainment purposes only and do not represent professional reviews, endorsements, or any measure of business performance.";

const DESCRIPTORS = {
  Texture: ["Moist", "Dense", "Light", "Cakey", "Crusty top", "Gooey"],
  Flavour: [
    "Fragrant",
    "Strong banana",
    "Subtle",
    "Well balanced",
    "Too sweet",
    "Artificial taste",
    "Real banana",
  ],
  Value: ["Worth it", "Hidden gem", "Overpriced"],
  Vibe: [
    "Best warm",
    "Good for gifts",
    "Worth the queue",
    "Good takeaway",
    "Best with coffee",
    "Good for sharing",
  ],
};

function mkSpot(id, name, loc, cat, outlets, url = "", opts = {}) {
  return {
    id,
    name,
    loc,
    cat,
    outlets,
    url,
    halal: false,
    muslimOwned: false,
    noPorkLard: false,
    vegan: false,
    dairyFree: false,
    hiddenGem: false,
    multipleOutlets: outlets === "multiple",
    wins: 0,
    losses: 0,
    weeklyWins: 0,
    stars: [],
    tags: {},
    addedAt: Date.now(),
    ...opts,
  };
}

const SEED = [
  mkSpot(1, "8th Floor Bakes", "Jalan Besar / Lavender", "Home Baker", "single", "https://instagram.com/8thfloorbakes"),
  mkSpot(2, "Ah Tas Muffins", "Serangoon Garden Way", "Hawker", "single", "", { halal: true }),
  mkSpot(3, "Anatta Bakery", "Neil Road", "Café", "single", "https://instagram.com/anattabakery"),
  mkSpot(4, "Auntie Peng Banana Pie", "Katong", "Heritage", "single", ""),
  mkSpot(5, "Bake It Babe SG", "Desker Road", "Bakery", "single", "https://instagram.com/bakeitbabesg"),
  mkSpot(6, "Baker's Brew", "Island-wide", "Bakery", "island-wide", "https://bakersbrew.com"),
  mkSpot(7, "Bakery Brera", "Empress Road", "Café", "multiple", "https://instagram.com/bakerybrera"),
  mkSpot(8, "Balmoral Bakery", "Sunset Way Residence", "Heritage", "single", ""),
  mkSpot(9, "Banelé", "Chancery Court", "Bakery", "single", "https://instagram.com/banelesg"),
  mkSpot(10, "Barcook Bakery", "Island-wide", "Chain", "island-wide", "https://barcookbakery.com"),
  mkSpot(11, "Baristart Coffee", "Multiple outlets", "Café", "multiple", "https://instagram.com/baristart_sg"),
  mkSpot(12, "Bengawan Solo", "Island-wide", "Confectionery", "island-wide", "https://bengawansolo.com.sg"),
  mkSpot(13, "Bollywood Farms", "Kranji", "Café", "single", "https://bollywoodfarms.com", { vegan: true }),
  mkSpot(14, "Brunoise SG", "Home-based", "Home Baker", "single", "https://instagram.com/brunoisesg"),
  mkSpot(15, "Burnt Ends Bakery", "Dempsey / Cross Street", "Bakery", "multiple", "https://bakery.burntends.com.sg"),
  mkSpot(16, "C'rius Bake", "Bukit Timah Plaza", "Café", "single", ""),
  mkSpot(17, "Cedele", "Island-wide", "Chain", "island-wide", "https://cedelesg.com", { dairyFree: true }),
  mkSpot(18, "Chocolat N Spice", "Multiple outlets", "Bakery", "multiple", "https://instagram.com/chocolatnspice"),
  mkSpot(19, "Conrad Hotel", "Conrad Hotel", "Hotel", "single", "https://www.instagram.com/dolcetto.sg"),
  mkSpot(20, "Dawn Kissa", "TBC", "Café", "single", "https://instagram.com/dawnkissa"),
  mkSpot(21, "Dona Manis", "Katong", "Heritage", "multiple", "https://donamanis.com"),
  mkSpot(22, "Four Leaves", "Island-wide", "Chain", "island-wide", "https://fourleaves.com.sg"),
  mkSpot(23, "Fredo's", "Balmoral", "Café", "single", ""),
  mkSpot(24, "Jioyoueatcake", "Home-based", "Home Baker", "single", "https://instagram.com/jioyoueatcake"),
  mkSpot(25, "Kamome Bakery", "TBC", "Bakery", "single", "https://instagram.com/kamomebakery"),
  mkSpot(26, "Keong Saik Bakery", "Island-wide", "Chain", "island-wide", "https://keongsaikbakery.com"),
  mkSpot(27, "Keryi", "TBC", "Bakery", "single", "https://instagram.com/keryibakes"),
  mkSpot(28, "Kith Café", "Island-wide", "Café", "island-wide", "https://kith.com.sg"),
  mkSpot(29, "Mirana", "Clementi", "Chain", "multiple", "https://instagram.com/miranabakery"),
  mkSpot(30, "Morimori Yogashi", "Orchard", "Japanese", "single", "https://instagram.com/morimoriyogashi"),
  mkSpot(31, "Mother Dough", "Kampong Glam", "Bakery", "single", "https://motherdough.com.sg", { halal: true, muslimOwned: true }),
  mkSpot(32, "Muji Singapore", "Multiple outlets", "Chain", "multiple", "https://muji.com/sg"),
  mkSpot(33, "Nakanishi Cakes", "Island-wide", "Japanese", "multiple", "https://instagram.com/nakanishicakes"),
  mkSpot(34, "Nakey", "Chinatown", "Café", "single", "https://instagram.com/nakeysg"),
  mkSpot(35, "New Deli", "Tampines East", "Café", "single", ""),
  mkSpot(36, "Ollella", "Online", "Home Baker", "single", "https://instagram.com/ollellasg", { dairyFree: true }),
  mkSpot(37, "On Lee's", "TBC", "Café", "single", "", { halal: true }),
  mkSpot(38, "Pawa Bakery", "TBC", "Chain", "single", ""),
  mkSpot(39, "Plain Vanilla", "Holland Village", "Café", "multiple", "https://plainvanilla.com.sg"),
  mkSpot(40, "Polar Puffs and Cakes", "Island-wide", "Chain", "island-wide", "https://polarpuffscakes.com.sg"),
  mkSpot(41, "Pour.traits", "TBC", "Café", "single", "https://instagram.com/pour.traits"),
  mkSpot(42, "Proofer", "Island-wide", "Chain", "island-wide", "https://proofer.com.sg"),
  mkSpot(43, "Rise Bakehouse", "Potong Pasir", "Café", "multiple", "https://risebakehouse.sg", { halal: true }),
  mkSpot(44, "Rotitiam", "Multiple outlets", "Chain", "multiple", ""),
  mkSpot(45, "SL II", "Heartland", "Hawker", "single", ""),
  mkSpot(46, "Same Days Coffee Stand", "Joo Chiat", "Café", "single", ""),
  mkSpot(47, "Spring Coffee", "TBC", "Café", "single", ""),
  mkSpot(48, "Swee Heng Bakery", "Island-wide", "Chain", "island-wide", "https://sweeheng1984.com.sg"),
  mkSpot(49, "Thai Baàng", "Island-wide", "Bakery", "island-wide", "https://thaibaangbakery.com"),
  mkSpot(50, "That Banana Bread Co", "Home-based", "Home Baker", "single", "https://thatbananabreadcompany.com"),
  mkSpot(51, "The Freshly Baked", "TBC", "Bakery", "single", ""),
  mkSpot(52, "Tiong Bahru Bakery", "Island-wide", "Chain", "island-wide", "https://tiongbahrubakeryboutique.com"),
  mkSpot(53, "Toast Box", "Island-wide", "Chain", "island-wide", "https://toastbox.com.sg"),
  mkSpot(54, "Two of Us Bakes", "Macpherson", "Home Baker", "single", "https://instagram.com/twoofusbakes", { halal: true, muslimOwned: true }),
  mkSpot(55, "Uncle Lee's Confectionery", "TBC", "Heritage", "single", "https://uncleleeconfectionery.cococart.co"),
  mkSpot(56, "Wheathead", "One-North", "Bakery", "single", "https://wheathead.supplies"),
  mkSpot(57, "Yeast Side", "Island-wide", "Café", "multiple", "https://instagram.com/yeastsidesg"),
  mkSpot(58, "Mini Toast House", "Chinatown / Toa Payoh", "Hawker", "multiple", ""),
  mkSpot(59, "Bakersmith", "Tampines / Marine Parade", "Chain", "multiple", "https://bakersmith.sg"),
  mkSpot(60, "Huggs Coffee", "Island-wide", "Chain", "island-wide", "https://huggscoffee.com"),
  mkSpot(61, "Unpackt", "Mandai Wildlife West", "Café", "single", "https://instagram.com/unpackt.sg"),
  mkSpot(62, "Frosted by Fang", "Joo Seng / MacPherson", "Bakery", "single", "https://frostedbyfang.com"),
];

const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SB_HEADERS = {
  apikey: SB_KEY,
  Authorization: "Bearer " + SB_KEY,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const sbDb = {
  async select(table, query = "") {
    if (!SB_URL || !SB_KEY) throw new Error("Missing Supabase env vars");
    const res = await fetch(`${SB_URL}/rest/v1/${table}?${query}`, {
      headers: SB_HEADERS,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async insert(table, data) {
    if (!SB_URL || !SB_KEY) throw new Error("Missing Supabase env vars");
    const res = await fetch(`${SB_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: SB_HEADERS,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  },

  async update(table, data, match) {
    if (!SB_URL || !SB_KEY) throw new Error("Missing Supabase env vars");
    const query = Object.entries(match)
      .map(([k, v]) => `${encodeURIComponent(k)}=eq.${encodeURIComponent(v)}`)
      .join("&");

    const res = await fetch(`${SB_URL}/rest/v1/${table}?${query}`, {
      method: "PATCH",
      headers: SB_HEADERS,
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  },
};

function getSupabase() {
  return sbDb;
}

function mapSpotFromDb(s) {
  return {
    id: s.id,
    name: s.name || "",
    loc: s.loc || "",
    cat: s.cat || "",
    outlets: s.outlets || "single",
    multipleOutlets: !!s.multiple_outlets,
    url: s.url || "",

    halal: !!s.halal,
    muslimOwned: !!s.muslim_owned,
    noPorkLard: !!s.no_pork_lard,
    vegan: !!s.vegan,
    dairyFree: !!s.dairy_free,
    hiddenGem: !!s.hidden_gem,

    wins: Number(s.wins) || 0,
    losses: Number(s.losses) || 0,
    weeklyWins: Number(s.weekly_wins) || 0,
    stars:
      Number(s.star_count) > 0
        ? Array(Number(s.star_count)).fill(Number(s.stars_total) / Number(s.star_count))
        : [],
    tags: {},
    addedAt: s.added_at ? new Date(s.added_at).getTime() : Date.now(),
    flagged: !!s.flagged,
  };
}

function mapSpotToDb(s) {
  return {
    name: s.name || "",
    loc: s.loc || "",
    cat: s.cat || "",
    outlets: s.outlets || "single",
    multiple_outlets: s.outlets === "multiple",
    url: s.url || "",

    halal: !!s.halal,
    muslim_owned: !!s.muslimOwned,
    no_pork_lard: !!s.noPorkLard,
    vegan: !!s.vegan,
    dairy_free: !!s.dairyFree,
    hidden_gem: !!s.hiddenGem,

    wins: Number(s.wins) || 0,
    losses: Number(s.losses) || 0,
    weekly_wins: Number(s.weeklyWins) || 0,
    stars_total: s.stars?.length ? s.stars.reduce((a, b) => a + b, 0) : 0,
    star_count: s.stars?.length || 0,
  };
}

function getSessionId() {
  try {
    let id = localStorage.getItem("mbba_session");
    if (!id) {
      id = "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("mbba_session", id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

const SESSION_ID = getSessionId();

let _lastPairIds = [-1, -1];

function randPair(arr) {
  if (!arr.length) return [SEED[0], SEED[1]];
  if (arr.length === 1) return [arr[0], arr[0]];

  let a;
  let b;
  let attempts = 0;

  do {
    a = Math.floor(Math.random() * arr.length);
    b = Math.floor(Math.random() * (arr.length - 1));
    if (b >= a) b++;
    attempts++;
  } while (
    attempts < 20 &&
    ((arr[a].id === _lastPairIds[0] && arr[b].id === _lastPairIds[1]) ||
      (arr[a].id === _lastPairIds[1] && arr[b].id === _lastPairIds[0]))
  );

  _lastPairIds = [arr[a].id, arr[b].id];
  return [arr[a], arr[b]];
}

function calcElo(w, l) {
  const n = w + l;
  if (!n) return 1000;
  return Math.round(1000 + (w - l) * 32);
}

function calcAvg(arr) {
  if (!arr?.length) return null;
  return (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1);
}

function getLoc(loc, outlets) {
  if (!loc) return null;
  if (outlets === "island-wide") return null;
  if (
    outlets === "multiple" &&
    (loc.toLowerCase().includes("multiple") || loc.toLowerCase().includes("outlets"))
  ) {
    return null;
  }
  return loc === "TBC" ? null : loc;
}

function strSimilarity(a, b) {
  const x = a.toLowerCase().replace(/[^a-z0-9]/g, "");
  const y = b.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (x === y) return 1;
  if (x.length < 2 || y.length < 2) return 0;

  const bg = new Map();
  for (let i = 0; i < x.length - 1; i++) {
    const s = x.slice(i, i + 2);
    bg.set(s, (bg.get(s) || 0) + 1);
  }

  let hits = 0;
  for (let i = 0; i < y.length - 1; i++) {
    const s = y.slice(i, i + 2);
    if (bg.get(s) > 0) {
      hits++;
      bg.set(s, bg.get(s) - 1);
    }
  }

  return (2 * hits) / (x.length + y.length - 2);
}

function useOGMeta() {
  useEffect(() => {
    const setMeta = (prop, content, attr = "property") => {
      let el = document.querySelector(`meta[${attr}="${prop}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, prop);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("og:title", "Make Banana Bread Again 🍌");
    setMeta(
      "og:description",
      "Singapore's community-powered banana bread directory. Vote, discover, and add your favourite spots."
    );
    setMeta("og:url", "https://makebananabreadagain.com");
    setMeta("og:type", "website");
    setMeta("twitter:card", "summary_large_image", "name");
    setMeta("twitter:title", "Make Banana Bread Again 🍌", "name");
    setMeta("twitter:description", "Singapore's community-powered banana bread directory.", "name");
    document.title = "Make Banana Bread Again 🍌";
  }, []);
}

function Badge({ label, bg, color }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        background: bg,
        color,
        borderRadius: 7,
        padding: "3px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function OutletBadge({ outlets }) {
  if (outlets === "single") return null;
  return (
    <Badge
      label={outlets === "island-wide" ? "Island-wide" : "Multiple outlets"}
      bg="#EAF4FF"
      color={T.blue}
    />
  );
}

function VerifiedBadge() {
  return <Badge label="Link provided" bg="#F0FDF4" color={T.green} />;
}

function DietTags({ spot }) {
  const items = [];

  if (spot.halal) items.push(["Halal", "#F0FDF4", "#15803D"]);
  if (spot.muslimOwned) items.push(["Muslim-owned", "#F0FDF4", "#15803D"]);
  if (spot.noPorkLard) items.push(["No pork, no lard", "#F0FDF4", "#15803D"]);
  if (spot.vegan) items.push(["Vegan", "#FAF5FF", "#7E22CE"]);
  if (spot.dairyFree) items.push(["Dairy-free", "#FFF7ED", "#C2410C"]);
  if (spot.hiddenGem) items.push(["Hidden gems", "#FEFCE8", "#A16207"]);

  if (!items.length) return null;

  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
      {items.map(([label, bg, color]) => (
        <Badge key={label} label={label} bg={bg} color={color} />
      ))}
    </div>
  );
}

function Stars({ value, size = 12 }) {
  const n = Math.round(value);
  return (
    <span style={{ fontSize: size, color: "#FFB800", letterSpacing: "0.5px" }}>
      {"★".repeat(n)}
      {"☆".repeat(5 - n)}
    </span>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "7px 15px",
        borderRadius: 999,
        border: `1.5px solid ${active ? T.black : T.border}`,
        background: active ? T.yellow : T.white,
        color: T.black,
        fontSize: 13,
        fontWeight: active ? 800 : 500,
        cursor: "pointer",
        fontFamily: T.font,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function Sheet({ children, onClose, title }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 99999,
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxHeight: "calc(100dvh - 90px)",
          background: T.white,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: "22px 24px 120px",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: 54,
            height: 6,
            borderRadius: 999,
            background: T.border,
            margin: "0 auto 16px",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, textAlign: "center" }}>
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              fontSize: 34,
              color: T.muted,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ReviewSheet({ spot, onSubmit, onClose }) {
  const [stars, setStars] = useState(0);
  const [picked, setPicked] = useState({});

  const toggle = (group, tag) => {
    setPicked(prev => {
      const k = `${group}:${tag}`;
      const next = { ...prev };
      if (next[k]) delete next[k];
      else next[k] = true;
      return next;
    });
  };

  return (
    <Sheet onClose={onClose} title={`Rate ${spot.name}`}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setStars(n)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 34,
              cursor: "pointer",
              color: stars >= n ? "#FFB800" : T.border,
            }}
          >
            ★
          </button>
        ))}
      </div>

      {stars > 0 &&
        Object.entries(DESCRIPTORS).map(([group, tags]) => (
          <div key={group} style={{ marginBottom: 16 }}>
            <p style={smallLabel}>{group}</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {tags.map(tag => {
                const active = picked[`${group}:${tag}`];
                return (
                  <Pill key={tag} active={active} onClick={() => toggle(group, tag)}>
                    {tag}
                  </Pill>
                );
              })}
            </div>
          </div>
        ))}

      <button
        type="button"
        onClick={() => {
          if (!stars) return;
          onSubmit(stars, picked);
          onClose();
        }}
        style={primaryOutlineButton}
      >
        Submit review
      </button>
    </Sheet>
  );
}

function EditSheet({ spot, onClose, onSubmit }) {
  const getInitialOutletType = () => {
    if (spot.outlets === "island-wide") return "island";
    if (spot.outlets === "multiple" || spot.multipleOutlets) return "multiple";
    return "single";
  };

  const [eName, setEName] = useState(spot.name || "");
  const [eUrl, setEUrl] = useState(spot.url || "");
  const [eLoc, setELoc] = useState(spot.loc || "");
  const [eCat, setECat] = useState(spot.cat || "");
  const [eOutletType, setEOutletType] = useState(getInitialOutletType());
  const [eHalal, setEHalal] = useState(!!spot.halal);
  const [eMuslim, setEMuslim] = useState(!!spot.muslimOwned);
  const [eNoPorkLard, setENoPorkLard] = useState(!!spot.noPorkLard);
  const [eVegan, setEVegan] = useState(!!spot.vegan);
  const [eDairy, setEDairy] = useState(!!spot.dairyFree);
  const [eHidden, setEHidden] = useState(!!spot.hiddenGem);

  return (
    <Sheet onClose={onClose} title="Suggest an edit">
      <p style={{ fontSize: 15, fontWeight: 900, marginBottom: 6 }}>{spot.name}</p>
      <p style={{ fontSize: 13, color: T.muted, marginBottom: 22, lineHeight: 1.45 }}>
        Help us keep this listing accurate. Updates are sent to our team for review.
      </p>

      <Field label="Name" value={eName} onChange={setEName} placeholder="Listing name" />
      <Field
        label="Website or Instagram link"
        value={eUrl}
        onChange={setEUrl}
        placeholder="https://instagram.com/..."
      />
      <Field label="Location or area" value={eLoc} onChange={setELoc} placeholder="Area / location" />

      <p style={smallLabel}>Category</p>
      <div style={pillWrap}>
        {CATS.map(c => (
          <Pill key={c} active={eCat === c} onClick={() => setECat(c)}>
            {c}
          </Pill>
        ))}
      </div>

      <p style={smallLabel}>Outlets</p>
      <div style={pillWrap}>
        <Pill active={eOutletType === "single"} onClick={() => setEOutletType("single")}>
          Single location
        </Pill>
        <Pill active={eOutletType === "multiple"} onClick={() => setEOutletType("multiple")}>
          Multiple outlets
        </Pill>
        <Pill active={eOutletType === "island"} onClick={() => setEOutletType("island")}>
          Island-wide
        </Pill>
      </div>

      <p style={smallLabel}>Tags</p>
      <div style={pillWrap}>
        {[
          ["Halal", eHalal, setEHalal],
          ["Muslim-owned", eMuslim, setEMuslim],
          ["No pork, no lard", eNoPorkLard, setENoPorkLard],
          ["Vegan", eVegan, setEVegan],
          ["Dairy-free", eDairy, setEDairy],
          ["Hidden gems", eHidden, setEHidden],
        ].map(([label, active, setter]) => (
          <Pill key={label} active={active} onClick={() => setter(prev => !prev)}>
            {label}
          </Pill>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          onSubmit(spot.id, {
            name: eName.trim(),
            url: eUrl.trim(),
            loc: eLoc.trim(),
            cat: eCat,
            outletType: eOutletType,
            halal: eHalal,
            muslimOwned: eMuslim,
            noPorkLard: eNoPorkLard,
            vegan: eVegan,
            dairyFree: eDairy,
            hiddenGem: eHidden,
          });
          onClose();
        }}
        style={primaryOutlineButton}
      >
        Submit update
      </button>
    </Sheet>
  );
}

function FlagSheet({ spot, onClose, onFlag }) {
  const reasons = [
    "Permanently closed",
    "Wrong information (name, location, category)",
    "Incorrect dietary tags",
    "Banana bread no longer on their menu",
    "Duplicate listing",
    "Other",
  ];

  const [selected, setSelected] = useState("");
  const [otherText, setOtherText] = useState("");

  const canSubmit = selected && (selected !== "Other" || otherText.trim().length > 2);

  return (
    <Sheet onClose={onClose} title="Flag listing">
      <p style={{ fontSize: 15, fontWeight: 900, marginBottom: 4 }}>{spot.name}</p>
      <p style={{ fontSize: 13, color: T.muted, marginBottom: 18 }}>What’s the issue?</p>

      {reasons.map(r => (
        <button
          key={r}
          type="button"
          onClick={() => setSelected(r)}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "13px 14px",
            marginBottom: 8,
            borderRadius: 14,
            background: selected === r ? T.sep : T.white,
            border: `1.5px solid ${selected === r ? T.black : T.border}`,
            fontSize: 14,
            color: T.black,
            cursor: "pointer",
            fontFamily: T.font,
          }}
        >
          {r}
        </button>
      ))}

      {selected === "Other" && (
        <textarea
          value={otherText}
          onChange={e => setOtherText(e.target.value)}
          placeholder="Please describe the issue..."
          style={{
            ...inputStyle,
            minHeight: 90,
            resize: "vertical",
            marginTop: 6,
          }}
        />
      )}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => {
          if (!canSubmit) return;
          onFlag(spot.id, selected, otherText);
          onClose();
        }}
        style={{
          ...primaryOutlineButton,
          color: canSubmit ? T.black : T.muted,
          borderColor: canSubmit ? T.black : T.border,
        }}
      >
        Submit flag
      </button>
    </Sheet>
  );
}

function AboutSheet({ onClose }) {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <Sheet onClose={onClose} title="About MBBA">
      <div style={{ marginBottom: 28 }}>
        {ABOUT_TEXT.map((para, i) => (
          <p
            key={i}
            style={{
              fontSize: 14,
              lineHeight: 1.75,
              color: i === ABOUT_TEXT.length - 1 ? T.black : "#3A3A3A",
              fontWeight: i === ABOUT_TEXT.length - 1 ? 700 : 400,
              marginBottom: 12,
            }}
          >
            {para}
          </p>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 18 }}>
        <p style={smallLabel}>FAQ</p>

        {FAQS.map((faq, i) => (
          <div key={faq.q} style={{ borderTop: `1px solid ${T.border}`, padding: "13px 0" }}>
            <button
              type="button"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                fontFamily: T.font,
                gap: 12,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, textAlign: "left", color: T.black }}>
                {faq.q}
              </span>
              <span style={{ fontSize: 20, color: T.muted }}>{openIdx === i ? "−" : "+"}</span>
            </button>

            {openIdx === i && (
              <p style={{ fontSize: 13, color: "#3A3A3A", lineHeight: 1.7, marginTop: 10 }}>
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
        <p style={smallLabel}>Disclaimer</p>
        <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.65 }}>{DISCLAIMER}</p>
      </div>

      <button type="button" onClick={onClose} style={primaryOutlineButton}>
        Done
      </button>
    </Sheet>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={smallLabel}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function Filters({
  fCat,
  setFCat,
  fHalal,
  setFHalal,
  fMuslim,
  setFMuslim,
  fNoPork,
  setFNoPork,
  fVegan,
  setFVegan,
  fDairy,
  setFDairy,
  fOutlets,
  setFOutlets,
  fHidden,
  setFHidden,
  search,
  setSearch,
}) {
  return (
    <>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or area..."
        style={{ ...inputStyle, marginBottom: 12 }}
      />

      <div style={scrollPills}>
        {["All", ...CATS].map(c => (
          <Pill key={c} active={fCat === c} onClick={() => setFCat(c)}>
            {c}
          </Pill>
        ))}
      </div>

      <div style={{ ...scrollPills, marginBottom: 24 }}>
        {[
          ["Halal", fHalal, setFHalal],
          ["Muslim-owned", fMuslim, setFMuslim],
          ["No pork, no lard", fNoPork, setFNoPork],
          ["Vegan", fVegan, setFVegan],
          ["Dairy-free", fDairy, setFDairy],
          ["Multiple outlets", fOutlets, setFOutlets],
          ["Hidden gems", fHidden, setFHidden],
        ].map(([l, v, s]) => (
          <Pill key={l} active={v} onClick={() => s(prev => !prev)}>
            {l}
          </Pill>
        ))}
      </div>
    </>
  );
}

function AlphaList({ spots, onEdit, onFlag }) {
  if (!spots.length) {
    return <p style={{ textAlign: "center", color: T.muted, padding: "60px 0" }}>No spots match.</p>;
  }

  const groups = [];
  let lastLetter = "";

  spots.forEach(spot => {
    const letter = (spot.name?.[0] || "#").toUpperCase();
    if (letter !== lastLetter) {
      lastLetter = letter;
      groups.push({ type: "header", letter, key: `h-${letter}` });
    }
    groups.push({ type: "spot", spot, key: `s-${spot.id}` });
  });

  return (
    <div>
      {groups.map(item => {
        if (item.type === "header") {
          return (
            <p key={item.key} style={alphaHeader}>
              {item.letter}
            </p>
          );
        }

        const spot = item.spot;
        const locStr = getLoc(spot.loc, spot.outlets);

        return (
          <div key={item.key} style={listRow}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                <span style={{ fontSize: 15, fontWeight: 800 }}>{spot.name}</span>
                <OutletBadge outlets={spot.outlets} />
                {spot.url && <VerifiedBadge />}
              </div>

              <p style={{ fontSize: 13, color: T.muted }}>
                {spot.cat}
                {locStr ? ` · 📍 ${locStr}` : ""}
              </p>

              <DietTags spot={spot} />
            </div>

            <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
              {spot.url && (
                <a
                  href={spot.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: T.blue, fontWeight: 700, textDecoration: "none" }}
                >
                  Visit
                </a>
              )}

              <button type="button" onClick={() => onEdit(spot)} style={miniButton}>
                Edit
              </button>

              <button type="button" onClick={() => onFlag(spot)} style={flagButton}>
                ⚑
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SpotCard({ spot, onRate, onFlag, onEdit }) {
  const avg = calcAvg(spot.stars);
  const locStr = getLoc(spot.loc, spot.outlets);

  return (
    <div style={spotCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={smallLabel}>{spot.cat}</span>
        <button type="button" onClick={() => onFlag(spot)} style={flagButton}>
          ⚑
        </button>
      </div>

      <span style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.25 }}>{spot.name}</span>

      {locStr && <span style={{ fontSize: 13, color: T.muted }}>📍 {locStr}</span>}

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <OutletBadge outlets={spot.outlets} />
        {spot.url && <VerifiedBadge />}
      </div>

      <DietTags spot={spot} />

      {avg && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Stars value={parseFloat(avg)} />
          <span style={{ fontSize: 11, color: T.muted }}>({spot.stars.length})</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <button type="button" onClick={() => onRate(spot)} style={cardButton}>
          Rate
        </button>

        {spot.url ? (
          <a
            href={spot.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...cardButton, textAlign: "center", color: T.blue, textDecoration: "none" }}
          >
            Visit
          </a>
        ) : (
          <button type="button" onClick={() => onEdit(spot)} style={cardButton}>
            Add info
          </button>
        )}
      </div>
    </div>
  );
}

export default function MBBA() {
  const [spots, setSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dbError, setDbError] = useState(null);

  const [section, setSection] = useState("vote");
  const [pair, setPair] = useState(() => randPair(SEED));
  const [chosen, setChosen] = useState(null);
  const [loser, setLoser] = useState(null);
  const [sessionVotes, setSV] = useState(0);
  const [voteRounds, setVoteRounds] = useState(0);

  const [showAbout, setShowAbout] = useState(false);
  const [reviewSpot, setReviewSpot] = useState(null);
  const [editSpot, setEditSpot] = useState(null);
  const [flagSpot, setFlagSpot] = useState(null);
  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState("");
  const [fCat, setFCat] = useState("All");
  const [fHalal, setFHalal] = useState(false);
  const [fMuslim, setFMuslim] = useState(false);
  const [fNoPork, setFNoPork] = useState(false);
  const [fVegan, setFVegan] = useState(false);
  const [fDairy, setFDairy] = useState(false);
  const [fOutlets, setFOutlets] = useState(false);
  const [fHidden, setFHidden] = useState(false);
  const [dirSort, setDirSort] = useState("alpha");

  const [nName, setNName] = useState("");
  const [nLoc, setNLoc] = useState("");
  const [nUrl, setNUrl] = useState("");
  const [nCat, setNCat] = useState("Café");
  const [nOut, setNOut] = useState("single");
  const [nHalal, setNHalal] = useState(false);
  const [nMuslim, setNMuslim] = useState(false);
  const [nNoPorkLard, setNNoPorkLard] = useState(false);
  const [nVegan, setNVegan] = useState(false);
  const [nDairy, setNDairy] = useState(false);
  const [nHidden, setNHidden] = useState(false);
  const [nSG, setNSG] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [dupWarn, setDupWarn] = useState(null);

  const [fbName, setFbName] = useState("");
  const [fbEmail, setFbEmail] = useState("");
  const [fbType, setFbType] = useState("General feedback");
  const [fbMsg, setFbMsg] = useState("");
  const [fbSending, setFbSending] = useState(false);
  const [fbDone, setFbDone] = useState(false);
  const [fbErr, setFbErr] = useState("");

  useOGMeta();

  const showToast = useCallback(msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const loadSpots = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await getSupabase().select("spots", "select=*&order=name.asc");

      if (data && data.length) {
        const mapped = data.map(mapSpotFromDb);
        setSpots(mapped);
        setPair(randPair(mapped));
        setDbError(null);
      } else {
        const inserted = await getSupabase().insert("spots", SEED.map(mapSpotToDb));
        const mapped = inserted ? inserted.map(mapSpotFromDb) : SEED;
        setSpots(mapped);
        setPair(randPair(mapped));
      }
    } catch (err) {
      console.error("Failed to load spots:", err);
      setDbError("Using local fallback data. Check Supabase setup.");
      setSpots(SEED);
      setPair(randPair(SEED));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSpots();
  }, [loadSpots]);

  const reloadSpots = useCallback(async () => {
    try {
      const data = await getSupabase().select("spots", "select=*&order=name.asc");
      if (data && data.length) setSpots(data.map(mapSpotFromDb));
    } catch (err) {
      console.error("Reload error:", err);
    }
  }, []);

  const handleSection = useCallback(
    s => {
      setSection(s);
      if (s === "rankings" || s === "directory") reloadSpots();
    },
    [reloadSpots]
  );

  const nav = [
    { key: "vote", label: "Vote" },
    { key: "rankings", label: "Rankings" },
    { key: "directory", label: "Directory" },
    { key: "add", label: "Add a spot" },
    { key: "feedback", label: "Feedback" },
  ];

  const handleNName = useCallback(
    val => {
      setNName(val);

      if (val.length < 3) {
        setDupWarn(null);
        return;
      }

      const match = spots.find(s => strSimilarity(s.name, val) > 0.78);
      setDupWarn(match || null);
    },
    [spots]
  );

  const vote = useCallback(
    (winner, loserSpot) => {
      if (chosen) return;

      setChosen(winner.id);
      setLoser(loserSpot.id);
      setSV(v => v + 1);

      setSpots(prev =>
        prev.map(s => {
          if (s.id === winner.id) {
            return { ...s, wins: s.wins + 1, weeklyWins: (s.weeklyWins || 0) + 1 };
          }
          if (s.id === loserSpot.id) {
            return { ...s, losses: s.losses + 1 };
          }
          return s;
        })
      );

      const db = getSupabase();

      Promise.all([
        db.select("spots", `select=id,wins,weekly_wins&id=eq.${winner.id}`),
        db.select("spots", `select=id,losses&id=eq.${loserSpot.id}`),
      ])
        .then(([wRows, lRows]) => {
          const w = wRows?.[0];
          const l = lRows?.[0];

          if (w) {
            db.update(
              "spots",
              {
                wins: (Number(w.wins) || 0) + 1,
                weekly_wins: (Number(w.weekly_wins) || 0) + 1,
              },
              { id: winner.id }
            ).catch(() => {});
          }

          if (l) {
            db.update("spots", { losses: (Number(l.losses) || 0) + 1 }, { id: loserSpot.id }).catch(
              () => {}
            );
          }
        })
        .catch(() => {});

      db.insert("votes", {
        winner_id: winner.id,
        loser_id: loserSpot.id,
        session_id: SESSION_ID,
      }).catch(() => {});

      setTimeout(() => {
        setChosen(null);
        setLoser(null);
        setVoteRounds(v => v + 1);
        setSpots(prev => {
          setPair(randPair(prev));
          return prev;
        });
      }, 750);
    },
    [chosen]
  );

  const submitReview = useCallback(
    (spotId, stars, tags) => {
      setSpots(prev =>
        prev.map(s => {
          if (s.id !== spotId) return s;

          const t = { ...s.tags };
          Object.keys(tags).forEach(k => {
            const tag = k.split(":")[1];
            t[tag] = (t[tag] || 0) + 1;
          });

          return { ...s, stars: [...s.stars, stars], tags: t };
        })
      );

      const tagList = Object.keys(tags).map(k => k.split(":")[1]);
      const db = getSupabase();

      db.insert("reviews", {
        spot_id: spotId,
        stars,
        tags: tagList,
        session_id: SESSION_ID,
      })
        .then(async () => {
          const data = await db.select("reviews", `select=stars&spot_id=eq.${encodeURIComponent(spotId)}`);

          if (data && data.length) {
            const total = data.reduce((a, b) => a + (Number(b.stars) || 0), 0);

            await db.update(
              "spots",
              {
                stars_total: total,
                star_count: data.length,
              },
              { id: spotId }
            );
          }
        })
        .catch(err => console.error("Review write error:", err));

      showToast("Review added");
    },
    [showToast]
  );

  const submitEdit = useCallback(
    (spotId, data) => {
      const editedSpot = spots.find(s => s.id === spotId);

      const outlets =
        data.outletType === "island"
          ? "island-wide"
          : data.outletType === "multiple"
          ? "multiple"
          : "single";

      const updatedData = {
        name: data.name || "",
        url: data.url || "",
        loc: data.loc || "",
        cat: data.cat || "",
        outlets,
        multiple_outlets: outlets === "multiple",
        halal: !!data.halal,
        muslim_owned: !!data.muslimOwned,
        no_pork_lard: !!data.noPorkLard,
        vegan: !!data.vegan,
        dairy_free: !!data.dairyFree,
        hidden_gem: !!data.hiddenGem,
      };

      setSpots(prev =>
        prev.map(s =>
          s.id === spotId
            ? {
                ...s,
                name: updatedData.name,
                url: updatedData.url,
                loc: updatedData.loc,
                cat: updatedData.cat,
                outlets,
                multipleOutlets: outlets === "multiple",
                halal: updatedData.halal,
                muslimOwned: updatedData.muslim_owned,
                noPorkLard: updatedData.no_pork_lard,
                vegan: updatedData.vegan,
                dairyFree: updatedData.dairy_free,
                hiddenGem: updatedData.hidden_gem,
              }
            : s
        )
      );

      getSupabase()
        .update("spots", updatedData, { id: spotId })
        .catch(err => console.error("Edit write error:", err));

      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "edit",
          spotId,
          spot: data.name || editedSpot?.name || "",
          oldName: editedSpot?.name || "",
          newName: data.name || "",
          oldLocation: editedSpot?.loc || "",
          newLocation: data.loc || "",
          oldCategory: editedSpot?.cat || "",
          newCategory: data.cat || "",
          url: data.url || "",
          halal: !!data.halal,
          muslimOwned: !!data.muslimOwned,
          noPorkLard: !!data.noPorkLard,
          vegan: !!data.vegan,
          dairyFree: !!data.dairyFree,
          hiddenGem: !!data.hiddenGem,
          multipleOutlets: outlets === "multiple",
          islandWide: outlets === "island-wide",
        }),
      }).catch(err => console.error("Edit email error:", err));

      showToast("Thanks for the update. We’ll review it soon.");
    },
    [showToast, spots]
  );

  const flagListing = useCallback(
    (spotId, reason, otherText) => {
      const spot = spots.find(s => s.id === spotId);

      setSpots(prev => prev.map(s => (s.id === spotId ? { ...s, flagged: true } : s)));

      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "flag",
          spotId,
          spot: spot?.name || "",
          location: spot?.loc || "",
          category: spot?.cat || "",
          url: spot?.url || "",
          reason,
          otherText: otherText || "",
        }),
      }).catch(err => console.error("Flag email error:", err));

      showToast("Flagged. We will review it.");
    },
    [showToast, spots]
  );

  const submitSpot = useCallback(() => {
    if (!nName.trim()) {
      setFormErr("Name is required.");
      return;
    }

    if (!nLoc.trim()) {
      setFormErr("Location is required.");
      return;
    }

    if (!nSG) {
      setFormErr("Please confirm this business is in Singapore.");
      return;
    }

    const outlets = nOut;
    const tempId = `temp_${Date.now()}`;

    const tempSpot = mkSpot(tempId, nName.trim(), nLoc.trim(), nCat, outlets, nUrl.trim(), {
      halal: nHalal,
      muslimOwned: nMuslim,
      noPorkLard: nNoPorkLard,
      vegan: nVegan,
      dairyFree: nDairy,
      hiddenGem: nHidden,
      multipleOutlets: outlets === "multiple",
    });

    const newSpotData = {
      ...mapSpotToDb(tempSpot),
      outlets,
      multiple_outlets: outlets === "multiple",
      no_pork_lard: nNoPorkLard,
      hidden_gem: nHidden,
    };

    const notifyPayload = {
      type: "new_spot",
      name: nName.trim(),
      loc: nLoc.trim(),
      cat: nCat,
      outlets,
      url: nUrl.trim(),
      halal: nHalal,
      muslimOwned: nMuslim,
      noPorkLard: nNoPorkLard,
      vegan: nVegan,
      dairyFree: nDairy,
      hiddenGem: nHidden,
      multipleOutlets: outlets === "multiple",
      islandWide: outlets === "island-wide",
    };

    setFormErr("");
    setDupWarn(null);

    setSpots(prev => {
      const updated = [...prev, tempSpot];
      setPair(randPair(updated));
      return updated;
    });

    setNName("");
    setNLoc("");
    setNUrl("");
    setNCat("Café");
    setNOut("single");
    setNHalal(false);
    setNMuslim(false);
    setNNoPorkLard(false);
    setNVegan(false);
    setNDairy(false);
    setNHidden(false);
    setNSG(false);

    showToast("Added to the vote");
    setSection("vote");

    getSupabase()
      .insert("spots", newSpotData)
      .then(data => {
        const saved = Array.isArray(data) ? data[0] : data;

        if (saved) {
          const mapped = mapSpotFromDb(saved);

          setSpots(prev => {
            const updated = prev.map(item => (item.id === tempId ? mapped : item));
            setPair(randPair(updated));
            return updated;
          });
        }
      })
      .catch(err => {
        console.error("Add spot error:", err);
        setDbError("Add spot saved locally but failed to sync: " + (err?.message || err));
      });

    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notifyPayload),
    }).catch(() => {});
  }, [
    nName,
    nLoc,
    nUrl,
    nCat,
    nOut,
    nHalal,
    nMuslim,
    nNoPorkLard,
    nVegan,
    nDairy,
    nHidden,
    nSG,
    showToast,
  ]);

  const submitFeedback = useCallback(async () => {
    if (!fbMsg.trim()) {
      setFbErr("Please write your message.");
      return;
    }

    setFbSending(true);
    setFbErr("");

    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "feedback",
          name: fbName || "Anonymous",
          email: fbEmail || "Not provided",
          feedbackType: fbType,
          message: fbMsg,
        }),
      });

      if (res.ok) {
        setFbDone(true);
        setFbName("");
        setFbEmail("");
        setFbMsg("");
        setFbType("General feedback");
      } else {
        setFbErr("Something went wrong. Please try again.");
      }
    } catch {
      setFbErr("Something went wrong. Please try again.");
    }

    setFbSending(false);
  }, [fbName, fbEmail, fbType, fbMsg]);

  const ranked = useMemo(
    () =>
      [...spots].sort((a, b) => {
        const aVotes = a.wins + a.losses;
        const bVotes = b.wins + b.losses;

        if (aVotes === 0 && bVotes === 0) return a.name.localeCompare(b.name);
        if (aVotes === 0) return 1;
        if (bVotes === 0) return -1;

        return calcElo(b.wins, b.losses) - calcElo(a.wins, a.losses);
      }),
    [spots]
  );

  const filterFn = useCallback(
    list =>
      list.filter(s => {
        if (fCat !== "All" && s.cat !== fCat) return false;
        if (fHalal && !s.halal) return false;
        if (fMuslim && !s.muslimOwned) return false;
        if (fNoPork && !s.noPorkLard) return false;
        if (fVegan && !s.vegan) return false;
        if (fDairy && !s.dairyFree) return false;
        if (fOutlets && s.outlets === "single") return false;
        if (fHidden && !s.hiddenGem) return false;

        if (
          search &&
          !s.name.toLowerCase().includes(search.toLowerCase()) &&
          !s.loc.toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }

        return true;
      }),
    [fCat, fHalal, fMuslim, fNoPork, fVegan, fDairy, fOutlets, fHidden, search]
  );

  const filteredRanked = useMemo(() => filterFn(ranked), [ranked, filterFn]);
  const filteredAlpha = useMemo(
    () => filterFn([...spots].sort((a, b) => a.name.localeCompare(b.name))),
    [spots, filterFn]
  );
  const filteredRecent = useMemo(
    () => filterFn([...spots].sort((a, b) => b.addedAt - a.addedAt)),
    [spots, filterFn]
  );

  return (
    <div style={{ minHeight: "100vh", background: T.white, display: "flex", flexDirection: "column" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{font-size:16px;-webkit-text-size-adjust:100%;text-size-adjust:100%;}
        html,body,#root{background:${T.white};font-family:${T.font};color:${T.black};-webkit-font-smoothing:antialiased;min-height:100%;}
        body{margin:0;padding:0;overscroll-behavior-y:contain;}
        button,input,textarea,select{font-family:${T.font};-webkit-appearance:none;appearance:none;}
        input,textarea,select{font-size:16px !important;}
        button{touch-action:manipulation;}
        a{-webkit-tap-highlight-color:transparent;}
        *{scrollbar-width:none;-ms-overflow-style:none;}
        *::-webkit-scrollbar{display:none;}
        @media(max-width:560px){.dk-nav{display:none !important;}}
        @media(min-width:561px){.mb-nav{display:none !important;}}
        .mb-nav{padding-bottom:max(18px, env(safe-area-inset-bottom)) !important;}
        main{padding-bottom:calc(140px + env(safe-area-inset-bottom)) !important;}
        button:active{opacity:0.72;}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .sec{animation:fadeUp 0.25s ease both;}
      `}</style>

      {showAbout && <AboutSheet onClose={() => setShowAbout(false)} />}
      {reviewSpot && (
        <ReviewSheet
          spot={reviewSpot}
          onSubmit={(stars, tags) => submitReview(reviewSpot.id, stars, tags)}
          onClose={() => setReviewSpot(null)}
        />
      )}
      {editSpot && <EditSheet spot={editSpot} onSubmit={submitEdit} onClose={() => setEditSpot(null)} />}
      {flagSpot && (
        <FlagSheet
          spot={flagSpot}
          onFlag={(id, reason, other) => flagListing(id, reason, other)}
          onClose={() => setFlagSpot(null)}
        />
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 84,
            left: "50%",
            transform: "translateX(-50%)",
            background: T.black,
            color: T.white,
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            zIndex: 100000,
            whiteSpace: "nowrap",
            animation: "toastIn 0.22s ease",
          }}
        >
          {toast}
        </div>
      )}

      {isLoading && spots.length === 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: T.white,
            zIndex: 500,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <span style={{ fontSize: 48 }}>🍌</span>
          <p style={{ fontSize: 14, color: T.muted }}>Loading the directory…</p>
        </div>
      )}

      <header
        style={{
          borderBottom: `1px solid ${T.border}`,
          position: "sticky",
          top: 0,
          background: T.white,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "0 20px",
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <button
            type="button"
            onClick={() => handleSection("vote")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 20 }}>🍌</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: T.black }}>Make Banana Bread Again</span>
          </button>

          <nav className="dk-nav" style={{ display: "flex", gap: 4 }}>
            {nav.map(n => (
              <button
                key={n.key}
                type="button"
                onClick={() => handleSection(n.key)}
                style={{
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "none",
                  color: section === n.key ? T.black : T.muted,
                  fontSize: 13,
                  fontWeight: section === n.key ? 800 : 500,
                  cursor: "pointer",
                }}
              >
                {n.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowAbout(true)}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                border: "none",
                background: "none",
                color: T.muted,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              About
            </button>
          </nav>
        </div>
      </header>

      {dbError && (
        <div
          style={{
            maxWidth: 720,
            margin: "12px auto 0",
            padding: "10px 20px",
            fontSize: 12,
            color: T.orange,
            background: "#FFF8E1",
            borderRadius: 12,
          }}
        >
          {dbError}
        </div>
      )}

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px", width: "100%", flex: 1 }}>
        {section === "vote" && (
          <div className="sec">
            <div style={{ textAlign: "center", padding: "42px 0 28px" }}>
              <p style={{ ...smallLabel, marginBottom: 10 }}>That list from Reddit.</p>
              <h1
                style={{
                  fontSize: "clamp(28px,6vw,42px)",
                  fontWeight: 900,
                  letterSpacing: "-1px",
                  lineHeight: 1.1,
                  marginBottom: 10,
                }}
              >
                Which would you choose?
              </h1>
              <p style={{ fontSize: 14, color: T.muted }}>{spots.length} spots</p>
            </div>

            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {pair.map((spot, idx) => {
                const other = pair[idx === 0 ? 1 : 0];
                const isWin = chosen === spot.id;
                const isLose = loser === spot.id;
                const avg = calcAvg(spot.stars);
                const locStr = getLoc(spot.loc, spot.outlets);

                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => !chosen && vote(spot, other)}
                    style={{
                      textAlign: "left",
                      background: isWin ? T.yellow : T.white,
                      opacity: isLose ? 0.35 : 1,
                      border: `1.5px solid ${isWin ? T.black : T.border}`,
                      borderRadius: 22,
                      padding: "22px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 7,
                      minHeight: "clamp(190px,42vw,260px)",
                      cursor: chosen ? "default" : "pointer",
                    }}
                  >
                    <span style={smallLabel}>{spot.cat}</span>
                    <span
                      style={{
                        fontSize: "clamp(15px,3.6vw,21px)",
                        fontWeight: 900,
                        letterSpacing: "-0.3px",
                        lineHeight: 1.2,
                      }}
                    >
                      {spot.name}
                    </span>

                    {locStr && <span style={{ fontSize: 12, color: T.muted }}>📍 {locStr}</span>}

                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <OutletBadge outlets={spot.outlets} />
                      {spot.url && <VerifiedBadge />}
                    </div>

                    <DietTags spot={spot} />

                    {avg && (
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Stars value={parseFloat(avg)} size={11} />
                        <span style={{ fontSize: 10, color: T.muted }}>({spot.stars.length})</span>
                      </div>
                    )}

                    {isWin && (
                      <span style={{ fontSize: 11, fontWeight: 900, marginTop: "auto" }}>Your pick</span>
                    )}
                  </button>
                );
              })}

              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: T.white,
                  border: `1.5px solid ${T.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 900,
                  color: T.muted,
                  pointerEvents: "none",
                }}
              >
                VS
              </div>
            </div>

            {sessionVotes > 0 && (
              <p style={{ textAlign: "center", fontSize: 12, color: T.muted, marginTop: 12 }}>
                {sessionVotes} vote{sessionVotes !== 1 ? "s" : ""} this session
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => {
                  setSpots(prev => {
                    setPair(randPair(prev));
                    return prev;
                  });
                  setChosen(null);
                  setLoser(null);
                }}
                style={miniButton}
              >
                Skip
              </button>

              {chosen && (
                <button
                  type="button"
                  onClick={() => setReviewSpot(spots.find(s => s.id === chosen))}
                  style={miniButton}
                >
                  Rate it
                </button>
              )}
            </div>
          </div>
        )}

        {section === "rankings" && (
          <div className="sec" style={{ paddingTop: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
              <h1 style={pageTitle}>Rankings</h1>
              <span style={{ fontSize: 13, color: T.muted }}>{filteredRanked.length} spots</span>
            </div>

            <p style={{ fontSize: 13, color: T.muted, marginBottom: 24 }}>
              Community votes only.{" "}
              <button type="button" onClick={() => setShowAbout(true)} style={linkButton}>
                About this
              </button>
            </p>

            <Filters
              {...{
                fCat,
                setFCat,
                fHalal,
                setFHalal,
                fMuslim,
                setFMuslim,
                fNoPork,
                setFNoPork,
                fVegan,
                setFVegan,
                fDairy,
                setFDairy,
                fOutlets,
                setFOutlets,
                fHidden,
                setFHidden,
                search,
                setSearch,
              }}
            />

            {filteredRanked.map(spot => {
              const rank = ranked.indexOf(spot) + 1;
              const total = spot.wins + spot.losses;
              const avg = calcAvg(spot.stars);
              const locStr = getLoc(spot.loc, spot.outlets);

              return (
                <div key={spot.id} style={listRow}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: rank <= 3 ? T.black : T.muted,
                      minWidth: 28,
                    }}
                  >
                    {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : rank}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 3 }}>
                      <span style={{ fontSize: 16, fontWeight: 900 }}>{spot.name}</span>
                      <OutletBadge outlets={spot.outlets} />
                      {spot.url && <VerifiedBadge />}
                    </div>

                    <p style={{ fontSize: 13, color: T.muted, marginBottom: 5 }}>
                      {spot.cat}
                      {locStr ? ` · 📍 ${locStr}` : ""}
                    </p>

                    <DietTags spot={spot} />

                    {total > 0 && (
                      <div
                        style={{
                          height: 3,
                          background: T.sep,
                          borderRadius: 10,
                          marginTop: 8,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.round((spot.wins / total) * 100)}%`,
                            background: T.yellow,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {avg && <Stars value={parseFloat(avg)} size={11} />}
                    <p style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                      {spot.wins}W {spot.losses}L
                    </p>

                    <div style={{ display: "flex", gap: 5, marginTop: 5, justifyContent: "flex-end" }}>
                      <button type="button" onClick={() => setReviewSpot(spot)} style={miniButton}>
                        Rate
                      </button>
                      <button type="button" onClick={() => setEditSpot(spot)} style={miniButton}>
                        Edit
                      </button>
                      <button type="button" onClick={() => setFlagSpot(spot)} style={flagButton}>
                        ⚑
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {section === "directory" && (
          <div className="sec" style={{ paddingTop: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
              <h1 style={pageTitle}>Directory</h1>
              <button type="button" onClick={() => setSection("add")} style={linkButton}>
                Add a spot
              </button>
            </div>

            <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>{spots.length} spots.</p>

            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              <Pill active={dirSort === "alpha"} onClick={() => setDirSort("alpha")}>
                A–Z
              </Pill>
              <Pill active={dirSort === "ranked"} onClick={() => setDirSort("ranked")}>
                Top rated
              </Pill>
              <Pill active={dirSort === "new"} onClick={() => setDirSort("new")}>
                Recently added
              </Pill>
            </div>

            <Filters
              {...{
                fCat,
                setFCat,
                fHalal,
                setFHalal,
                fMuslim,
                setFMuslim,
                fNoPork,
                setFNoPork,
                fVegan,
                setFVegan,
                fDairy,
                setFDairy,
                fOutlets,
                setFOutlets,
                fHidden,
                setFHidden,
                search,
                setSearch,
              }}
            />

            {dirSort === "alpha" ? (
              <AlphaList spots={filteredAlpha} onEdit={setEditSpot} onFlag={setFlagSpot} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(168px,1fr))", gap: 10 }}>
                {(dirSort === "ranked" ? filteredRanked : filteredRecent).map(spot => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    onRate={setReviewSpot}
                    onFlag={setFlagSpot}
                    onEdit={setEditSpot}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {section === "add" && (
          <div className="sec" style={{ paddingTop: 40 }}>
            <h1 style={pageTitle}>Add a spot</h1>
            <p style={{ fontSize: 13, color: T.muted, marginBottom: 28, lineHeight: 1.55 }}>
              Know somewhere selling banana bread or cake in Singapore? Add it to the vote.
            </p>

            <Field label="Name" value={nName} onChange={handleNName} placeholder="e.g. Plain Vanilla" />

            {dupWarn && (
              <div
                style={{
                  marginTop: -8,
                  marginBottom: 18,
                  background: "#FFF8E1",
                  border: `1px solid ${T.orange}`,
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#5C3A00",
                  lineHeight: 1.45,
                }}
              >
                ⚠️ Might already be listed: <strong>{dupWarn.name}</strong> ({dupWarn.loc}).
              </div>
            )}

            <Field label="Location or area" value={nLoc} onChange={setNLoc} placeholder="e.g. Joo Chiat" />
            <Field
              label="Instagram, website, or link"
              value={nUrl}
              onChange={setNUrl}
              placeholder="https://instagram.com/yourbrand"
            />

            <p style={smallLabel}>Category</p>
            <div style={pillWrap}>
              {CATS.map(c => (
                <Pill key={c} active={nCat === c} onClick={() => setNCat(c)}>
                  {c}
                </Pill>
              ))}
            </div>

            <p style={smallLabel}>Outlets</p>
            <div style={pillWrap}>
              <Pill active={nOut === "single"} onClick={() => setNOut("single")}>
                Single location
              </Pill>
              <Pill active={nOut === "multiple"} onClick={() => setNOut("multiple")}>
                Multiple outlets
              </Pill>
              <Pill active={nOut === "island-wide"} onClick={() => setNOut("island-wide")}>
                Island-wide
              </Pill>
            </div>

            <p style={smallLabel}>Tags</p>
            <div style={pillWrap}>
              {[
                ["Halal", nHalal, setNHalal],
                ["Muslim-owned", nMuslim, setNMuslim],
                ["No pork, no lard", nNoPorkLard, setNNoPorkLard],
                ["Vegan", nVegan, setNVegan],
                ["Dairy-free", nDairy, setNDairy],
                ["Hidden gems", nHidden, setNHidden],
              ].map(([label, active, setter]) => (
                <Pill key={label} active={active} onClick={() => setter(prev => !prev)}>
                  {label}
                </Pill>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setNSG(prev => !prev)}
              style={{
                marginBottom: 24,
                width: "100%",
                background: T.sep,
                border: "none",
                borderRadius: 16,
                padding: "16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  border: `1.5px solid ${nSG ? T.black : T.border}`,
                  background: nSG ? T.yellow : T.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                  fontWeight: 900,
                }}
              >
                {nSG ? "✓" : ""}
              </span>

              <span>
                <strong style={{ display: "block", fontSize: 15, marginBottom: 2 }}>
                  This business is in Singapore
                </strong>
                <span style={{ fontSize: 13, color: T.muted }}>
                  MBBA is a Singapore-only directory for now.
                </span>
              </span>
            </button>

            {formErr && (
              <p style={{ fontSize: 13, color: T.red, marginBottom: 12, fontWeight: 800 }}>{formErr}</p>
            )}

            <button type="button" onClick={submitSpot} style={primaryOutlineButton}>
              Add to the vote
            </button>

            <p style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 10, lineHeight: 1.6 }}>
              By submitting, you confirm this is a real business selling banana bread or cake in Singapore.
            </p>
          </div>
        )}

        {section === "feedback" && (
          <div className="sec" style={{ paddingTop: 40 }}>
            <h1 style={pageTitle}>Feedback</h1>

            <p style={{ fontSize: 13, color: T.muted, marginBottom: 28, lineHeight: 1.6 }}>
              Got a suggestion, spotted an issue, or want to say something? We read every message.
            </p>

            {fbDone ? (
              <div
                style={{
                  background: "#F0FDF4",
                  border: `1.5px solid ${T.green}`,
                  borderRadius: 16,
                  padding: "28px 20px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: 24, marginBottom: 8 }}>🍌</p>
                <p style={{ fontSize: 17, fontWeight: 900, marginBottom: 6 }}>Message sent.</p>
                <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>Thanks for taking the time.</p>

                <button type="button" onClick={() => setFbDone(false)} style={{ ...miniButton, marginTop: 18 }}>
                  Send another
                </button>
              </div>
            ) : (
              <>
                <p style={smallLabel}>Type</p>
                <div style={pillWrap}>
                  {["General feedback", "Suggest a spot", "Report an issue", "Partnership enquiry", "Other"].map(t => (
                    <Pill key={t} active={fbType === t} onClick={() => setFbType(t)}>
                      {t}
                    </Pill>
                  ))}
                </div>

                <Field label="Name" value={fbName} onChange={setFbName} placeholder="Your name" />
                <Field label="Email" value={fbEmail} onChange={setFbEmail} placeholder="your@email.com" />

                <div style={{ marginBottom: 24 }}>
                  <label style={smallLabel}>Message</label>
                  <textarea
                    value={fbMsg}
                    onChange={e => setFbMsg(e.target.value)}
                    placeholder="Tell us anything..."
                    rows={5}
                    style={{ ...inputStyle, resize: "vertical", minHeight: 120, lineHeight: 1.6 }}
                  />
                </div>

                {fbErr && <p style={{ fontSize: 13, color: T.red, marginBottom: 12, fontWeight: 800 }}>{fbErr}</p>}

                <button
                  type="button"
                  onClick={submitFeedback}
                  disabled={fbSending}
                  style={{ ...primaryOutlineButton, opacity: fbSending ? 0.6 : 1 }}
                >
                  {fbSending ? "Sending…" : "Send message"}
                </button>
              </>
            )}
          </div>
        )}
      </main>

      <nav
        className="mb-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: T.white,
          borderTop: `1px solid ${T.border}`,
          zIndex: 100,
          padding: "8px 12px 0",
          display: "flex",
          gap: 6,
          overflowX: "auto",
          alignItems: "center",
        }}
      >
        {[...nav, { key: "about", label: "About" }].map(n => (
          <button
            key={n.key}
            type="button"
            onClick={() => (n.key === "about" ? setShowAbout(true) : handleSection(n.key))}
            style={{
              flexShrink: 0,
              padding: "8px 17px",
              borderRadius: 999,
              border: `1.5px solid ${section === n.key && n.key !== "about" ? T.black : T.border}`,
              background: section === n.key && n.key !== "about" ? T.yellow : T.white,
              color: T.black,
              fontSize: 14,
              fontWeight: section === n.key && n.key !== "about" ? 900 : 500,
              cursor: "pointer",
              fontFamily: T.font,
              whiteSpace: "nowrap",
            }}
          >
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

const pageTitle = {
  fontSize: 28,
  fontWeight: 900,
  letterSpacing: "-0.6px",
  marginBottom: 8,
};

const smallLabel = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: T.muted,
  display: "block",
  marginBottom: 9,
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: `1.5px solid ${T.border}`,
  fontSize: 16,
  fontFamily: T.font,
  color: T.black,
  background: T.white,
  outline: "none",
};

const primaryOutlineButton = {
  width: "100%",
  padding: "15px 16px",
  borderRadius: 16,
  border: `2px solid ${T.black}`,
  background: T.white,
  color: T.black,
  fontSize: 16,
  fontWeight: 900,
  cursor: "pointer",
  fontFamily: T.font,
  marginTop: 8,
};

const miniButton = {
  background: T.white,
  border: `1px solid ${T.border}`,
  borderRadius: 999,
  padding: "5px 10px",
  fontSize: 12,
  cursor: "pointer",
  color: T.muted,
  fontFamily: T.font,
};

const flagButton = {
  background: "none",
  border: "none",
  fontSize: 13,
  cursor: "pointer",
  color: T.muted,
  padding: "3px 2px",
};

const pillWrap = {
  display: "flex",
  gap: 7,
  flexWrap: "wrap",
  marginBottom: 20,
};

const scrollPills = {
  display: "flex",
  gap: 7,
  overflowX: "auto",
  paddingBottom: 4,
  marginBottom: 9,
  WebkitOverflowScrolling: "touch",
};

const alphaHeader = {
  fontWeight: 900,
  fontSize: 12,
  color: T.muted,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  padding: "18px 0 9px",
};

const listRow = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  padding: "13px 0",
  borderBottom: `1px solid ${T.sep}`,
};

const spotCard = {
  border: `1.5px solid ${T.border}`,
  borderRadius: 18,
  padding: "16px 14px",
  display: "flex",
  flexDirection: "column",
  gap: 7,
  background: T.white,
};

const cardButton = {
  flex: 1,
  background: T.white,
  border: `1px solid ${T.border}`,
  borderRadius: 12,
  padding: "7px 0",
  fontSize: 12,
  cursor: "pointer",
  color: T.muted,
  fontFamily: T.font,
};