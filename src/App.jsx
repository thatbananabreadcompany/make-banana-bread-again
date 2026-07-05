import { useState, useEffect, useMemo, useCallback } from "react";
import { CATS, DESCRIPTORS, ABOUT_TEXT, DISCLAIMER, CONTACT, FAQS, FLAG_REASONS } from "./constants.js";
import Ticker from "./components/Ticker.jsx";
import BottomNav from "./components/BottomNav.jsx";
import AboutSheet from "./components/AboutSheet.jsx";
import FeedbackSheet from "./components/FeedbackSheet.jsx";
import VotePage from "./pages/VotePage.jsx";
import RankingsPage from "./pages/RankingsPage.jsx";
import SpotsPage from "./pages/SpotsPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";

const T = {
  white:  "#FFFFFF",
  black:  "#1D1D1F",
  yellow: "#FFE135",
  muted:  "#86868B",
  sep:    "#F5F5F7",
  border: "#E8E8ED",
  blue:   "#0071E3",
  green:  "#34C759",
  red:    "#FF3B30",
  orange: "#FF9500",
  font:   "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',Arial,sans-serif",
};

function strSimilarity(a, b) {
  const x=a.toLowerCase().replace(/[^a-z0-9]/g,"");
  const y=b.toLowerCase().replace(/[^a-z0-9]/g,"");
  if(x===y) return 1;
  if(x.length<2||y.length<2) return 0;
  const bg=new Map();
  for(let i=0;i<x.length-1;i++){const s=x.slice(i,i+2);bg.set(s,(bg.get(s)||0)+1);}
  let hits=0;
  for(let i=0;i<y.length-1;i++){const s=y.slice(i,i+2);if(bg.get(s)>0){hits++;bg.set(s,bg.get(s)-1);}}
  return(2*hits)/(x.length+y.length-2);
}

const mkSpot=(id,name,loc,cat,outlets,url="",opts={})=>({
  id,name,loc,cat,outlets,url,
halal:false,muslimOwned:false,noPorkLard:false,vegan:false,dairyFree:false,
  wins:0,losses:0,stars:[],tags:{},
  addedAt:Date.now()-Math.floor(Math.random()*30)*86400000,
  weeklyWins:0,
  ...opts,
});

const SEED = [
  mkSpot(1,  "8th Floor Bakes",          "Jalan Besar / Lavender","Home Baker",    "single",     "https://instagram.com/8thfloorbakes"),
  mkSpot(2,  "Ah Tas Muffins",           "Heartland",             "Hawker",        "single",     "",{halal:true}),
  mkSpot(3,  "Anatta Bakery",            "Neil Road",             "Café",          "single",     "https://instagram.com/anattabakery"),
  mkSpot(4,  "Auntie Peng Banana Pie",   "Katong",                "Heritage",      "single",     ""),
  mkSpot(5,  "Bake It Babe SG",          "Desker Road",           "Bakery",        "single",     "https://instagram.com/bakeitbabesg"),
  mkSpot(6,  "Baker's Brew",             "Island-wide",           "Chain",         "island-wide","https://bakersbrew.com"),
  mkSpot(7,  "Bakery Brera",             "Empress Road",          "Café",          "multiple",   "https://instagram.com/bakerybrera"),
  mkSpot(8,  "Balmoral Bakery",          "Balmoral",              "Heritage",      "single",     ""),
  mkSpot(9,  "Banelé",                   "Chancery Court",        "Bakery",        "single",     "https://instagram.com/banelesg"),
  mkSpot(10, "Barcook Bakery",           "Island-wide",           "Chain",         "island-wide","https://barcookbakery.com"),
  mkSpot(11, "Baristart Coffee",         "Multiple outlets",      "Café",          "multiple",   "https://instagram.com/baristart_sg"),
  mkSpot(12, "Bengawan Solo",            "Island-wide",           "Confectionery", "island-wide","https://bengawansolo.com.sg"),
  mkSpot(13, "Bollywood Farms",          "Kranji",                "Café",          "single",     "https://bollywoodfarms.com",{vegan:true}),
  mkSpot(14, "Brunoise SG",              "Home-based",            "Home Baker",    "single",     "https://instagram.com/brunoisesg"),
  mkSpot(15, "Burnt Ends Bakery",        "Dempsey / Cross Street","Bakery",        "multiple",   "https://bakery.burntends.com.sg"),
  mkSpot(16, "C'rius Bake",              "Bukit Timah Plaza",     "Café",          "single",     ""),
  mkSpot(17, "Cedele",                   "Island-wide",           "Chain",         "island-wide","https://cedelesg.com",{dairyFree:true}),
  mkSpot(18, "Chocolat N Spice",         "Multiple outlets",      "Bakery",        "multiple",   "https://instagram.com/chocolatnspice"),
  mkSpot(19, "Conrad Hotel",             "City Hall",             "Hotel",         "single",     "https://www.hilton.com/en/hotels/sincihi-conrad-centennial-singapore"),
  mkSpot(20, "Dawn Kissa",               "TBC",                   "Café",          "single",     "https://instagram.com/dawnkissa"),
  mkSpot(21, "Dona Manis",               "Katong",                "Heritage",      "multiple",   "https://donamanis.com"),
  mkSpot(22, "Four Leaves",              "Island-wide",           "Chain",         "island-wide","https://fourleaves.com.sg"),
  mkSpot(23, "Fredo's",                  "Balmoral",              "Café",          "single",     ""),
  mkSpot(24, "Jioyoueatcake",            "Home-based",            "Home Baker",    "single",     "https://instagram.com/jioyoueatcake"),
  mkSpot(25, "Kamome Bakery",            "TBC",                   "Bakery",        "single",     "https://instagram.com/kamomebakery"),
  mkSpot(26, "Keong Saik Bakery",        "Island-wide",           "Chain",         "island-wide","https://keongsaikbakery.com"),
  mkSpot(27, "Keryi",                    "TBC",                   "Bakery",        "single",     "https://instagram.com/keryibakes"),
  mkSpot(28, "Kith Café",                "Island-wide",           "Café",          "island-wide","https://kith.com.sg"),
  mkSpot(29, "Mirana",                   "Clementi",              "Chain",         "multiple",   "https://instagram.com/miranabakery"),
  mkSpot(30, "Morimori Yogashi",         "Orchard",               "Japanese",      "single",     "https://instagram.com/morimoriyogashi"),
  mkSpot(31, "Mother Dough",             "Kampong Glam",          "Bakery",        "single",     "https://motherdough.com.sg",{halal:true,muslimOwned:true}),
  mkSpot(32, "Muji Singapore",           "Multiple outlets",      "Chain",         "multiple",   "https://muji.com/sg"),
  mkSpot(33, "Nakanishi Cakes",          "Island-wide",           "Japanese",      "multiple",   "https://instagram.com/nakanishicakes"),
  mkSpot(34, "Nakey",                    "Chinatown",             "Café",          "single",     "https://instagram.com/nakeysg"),
  mkSpot(35, "New Deli",                 "Tampines East",         "Café",          "single",     ""),
  mkSpot(36, "Ollella",                  "Online",                "Home Baker",    "single",     "https://instagram.com/ollellasg",{dairyFree:true}),
  mkSpot(37, "On Lee's",                 "TBC",                   "Café",          "single",     "",{halal:true}),
  mkSpot(38, "Pawa Bakery",              "TBC",                   "Chain",         "single",     ""),
  mkSpot(39, "Plain Vanilla",            "Holland Village",       "Café",          "multiple",   "https://plainvanilla.com.sg"),
  mkSpot(40, "Polar Puffs and Cakes",    "Island-wide",           "Chain",         "island-wide","https://polarpuffscakes.com.sg"),
  mkSpot(41, "Pour.traits",              "TBC",                   "Café",          "single",     "https://instagram.com/pour.traits"),
  mkSpot(42, "Proofer",                  "Island-wide",           "Chain",         "island-wide","https://proofer.com.sg"),
  mkSpot(43, "Rise Bakehouse",           "Potong Pasir",          "Café",          "multiple",   "https://risebakehouse.sg",{halal:true}),
  mkSpot(44, "Rotitiam",                 "Multiple outlets",      "Chain",         "multiple",   ""),
  mkSpot(45, "SL II",                    "Heartland",             "Hawker",        "single",     ""),
  mkSpot(46, "Same Days Coffee Stand",   "Joo Chiat",             "Café",          "single",     ""),
  mkSpot(47, "Spring Coffee",            "TBC",                   "Café",          "single",     ""),
  mkSpot(48, "Swee Heng Bakery",         "Island-wide",           "Chain",         "island-wide","https://sweeheng1984.com.sg"),
  mkSpot(49, "Thai Baàng",               "Island-wide",           "Bakery",        "island-wide","https://thaibaangbakery.com"),
  mkSpot(50, "That Banana Bread Co",     "Home-based",            "Home Baker",    "single",     "https://thatbananabreadcompany.com"), // MBBA founders — same rules as everyone
  mkSpot(51, "The Freshly Baked",        "TBC",                   "Bakery",        "single",     ""),
  mkSpot(52, "Tiong Bahru Bakery",       "Island-wide",           "Chain",         "island-wide","https://tiongbahrubakeryboutique.com"),
  mkSpot(53, "Toast Box",                "Island-wide",           "Chain",         "island-wide","https://toastbox.com.sg"),
  mkSpot(54, "Two of Us Bakes",          "Macpherson",            "Home Baker",    "single",     "https://instagram.com/twoofusbakes",{halal:true,muslimOwned:true}),
  mkSpot(55, "Uncle Lee's Confectionery","TBC",                   "Heritage",      "single",     "https://uncleleeconfectionery.cococart.co"),
  mkSpot(56, "Wheathead",                "One-North",             "Bakery",        "single",     "https://wheathead.supplies"),
  mkSpot(57, "Yeast Side",               "Island-wide",           "Café",          "multiple",   "https://instagram.com/yeastsidesg"),
  mkSpot(58, "Mini Toast House",         "Chinatown / Toa Payoh",  "Hawker",        "multiple",   ""),
  mkSpot(59, "Bakersmith",               "Tampines / Marine Parade","Chain",         "multiple",   "https://bakersmith.sg"),
  mkSpot(60, "Huggs Coffee",             "Island-wide",           "Chain",         "island-wide","https://huggscoffee.com"),
  mkSpot(61, "Unpackt",                  "Mandai Wildlife West",  "Café",          "single",     "https://instagram.com/unpackt.sg"),
  mkSpot(62, "Frosted by Fang",          "Joo Seng / MacPherson", "Bakery",        "single",     "https://frostedbyfang.com"),
];

// ── SUPABASE REST CLIENT (direct fetch, no SDK) ───────────────────────────────
const SB_URL = 'https://cpefjwjyxgmdwjrfirda.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZWZqd2p5eGdtZHdqcmZpcmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMjIwNTUsImV4cCI6MjA5NjU5ODA1NX0.a0wLpyBfUhaj3KR5MBjlForRcxfxHIrKmuEEQUPL20w';
const SB_HEADERS = {
  'apikey': SB_KEY,
  'Authorization': 'Bearer ' + SB_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

const sbDb = {
  async select(table, query='') {
    const res = await fetch(`${SB_URL}/rest/v1/${table}?${query}`, {
      headers: SB_HEADERS,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async insert(table, data) {
  const res = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      ...SB_HEADERS,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Insert failed for ${table}`);
  }

  const text = await res.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Insert response parse error', err, text);
    return null;
  }
},
  async update(table, data, match) {
    const query = Object.entries(match)
      .map(([k,v])=>`${encodeURIComponent(k)}=eq.${encodeURIComponent(v)}`)
      .join('&');
    const res = await fetch(`${SB_URL}/rest/v1/${table}?${query}`, {
      method: 'PATCH',
      headers: SB_HEADERS,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async rpc(fn, params) {
    const res = await fetch(`${SB_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: SB_HEADERS,
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
function getSupabase(){ return sbDb; }

function mapSpotFromDb(s){
  return {
    id:s.id,
    name:s.name,
    loc:s.loc,
    cat:s.cat,
    outlets: s.outlets || "",
    multipleOutlets: s.multiple_outlets || false,
    url:s.url||'',
halal: s.halal || false,
muslimOwned: s.muslim_owned || false,
noPorkLard: s.no_pork_lard || false,
vegan: s.vegan || false,
dairyFree: s.dairy_free || false,
hiddenGem: s.hidden_gem || false,
    wins:Number(s.wins)||0,
    losses:Number(s.losses)||0,
    weeklyWins:Number(s.weekly_wins)||0,
    stars:Number(s.star_count)>0 ? Array(Number(s.star_count)).fill(Number(s.stars_total)/Number(s.star_count)) : [],
    tags:{},
    addedAt:s.added_at ? new Date(s.added_at).getTime() : Date.now(),
    flagged:!!s.flagged,
  };
}

function mapSpotToDb(s){
  return {
    name: s.name,
    loc: s.loc,
    cat: s.cat,
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
    stars_total: s.stars?.length ? s.stars.reduce((a,b) => a + b, 0) : 0,
    star_count: s.stars?.length || 0,
  };
}


// ── SESSION ID (anonymous, persists per device) ───────────────────────────
function getSessionId(){
  try{
    let id=localStorage.getItem('mbba_session');
    if(!id){
      id='s_'+Math.random().toString(36).slice(2)+Date.now().toString(36);
      localStorage.setItem('mbba_session',id);
    }
    return id;
  }catch{return 'anonymous';}
}
const SESSION_ID=getSessionId();

// Minimal tier for badge canvas (winner badge only)
const TIERS = [
  { min:1, max:Infinity, label:"Banana Bread Voter", emoji:"🍌", bg:"#FFF8DC", border:"#E8C84A" },
];
function getTier(){ return TIERS[0]; }

// ── HELPERS ───────────────────────────────────────────────────────────────
function calcElo(w,l){const n=w+l;if(!n)return 1000;return Math.round(1000+(w-l)*32);}
let _lastPairIds=[-1,-1];
function randPair(arr){
  if(arr.length<2)return[arr[0],arr[0]];
  let a,b,attempts=0;
  do{
    a=Math.floor(Math.random()*arr.length);
    b=Math.floor(Math.random()*(arr.length-1));
    if(b>=a)b++;
    attempts++;
  }while(attempts<20&&(
    (arr[a].id===_lastPairIds[0]&&arr[b].id===_lastPairIds[1])||
    (arr[a].id===_lastPairIds[1]&&arr[b].id===_lastPairIds[0])
  ));
  _lastPairIds=[arr[a].id,arr[b].id];
  return[arr[a],arr[b]];
}
function getLoc(loc,outlets){
  if(outlets==="island-wide")return null;
  if(outlets==="multiple"&&(loc.toLowerCase().includes("multiple")||loc.toLowerCase().includes("outlets")))return null;
  return loc==="TBC"?null:loc;
}


// ── OG META TAGS (injected at runtime for Vercel Edge later) ─────────────
function useOGMeta(){
  useEffect(()=>{
    const setMeta=(prop,content,attr="property")=>{
      let el=document.querySelector(`meta[${attr}="${prop}"]`);
      if(!el){el=document.createElement("meta");el.setAttribute(attr,prop);document.head.appendChild(el);}
      el.setAttribute("content",content);
    };
    setMeta("og:title","Make Banana Bread Again 🍌");
    setMeta("og:description","Singapore's community-powered banana bread directory. Vote, discover, and add your favourite spots.");
    setMeta("og:url","https://makebananabreadagain.com");
    setMeta("og:image","https://makebananabreadagain.com/og.png");
    setMeta("og:type","website");
    setMeta("twitter:card","summary_large_image","name");
    setMeta("twitter:title","Make Banana Bread Again 🍌","name");
    setMeta("twitter:description","Singapore's community-powered banana bread directory.","name");
    document.title="Make Banana Bread Again 🍌";
  },[]);
}

// ── ATOMS ─────────────────────────────────────────────────────────────────
function Pill({active,onClick,children}){
  return <button onClick={onClick} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${active?T.black:T.border}`,background:active?T.yellow:T.white,color:T.black,fontSize:13,fontWeight:active?600:400,cursor:"pointer",fontFamily:T.font,transition:"all 0.12s",whiteSpace:"nowrap",flexShrink:0}}>{children}</button>;
}

// ── CANVAS BADGE ──────────────────────────────────────────────────────────
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}

function genBadgeImage(spot, tier, votes, fmt, isWinner) {
  const W = 1080;
  const H = fmt === "story" ? 1920 : 1350; // 4:5 feed or 9:16 story
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  const mid = W / 2;

  if (isWinner) {
    // ── WINNER BADGE: Dark, premium, gold ──
    // Background: deep espresso with subtle gradient feel
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#1A0800");
    bgGrad.addColorStop(1, "#0D0400");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Gold accent line top and bottom
    ctx.fillStyle = "#C8960C";
    ctx.fillRect(0, 0, W, 6);
    ctx.fillRect(0, H - 6, W, 6);

    // Vertical center Y for 4:5
    const centerY = H / 2;

    // Crown — large, centered
    ctx.font = `${fmt === "story" ? 160 : 140}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("🏆", mid, centerY - (fmt === "story" ? 280 : 220));

    // "BANANA BREAD OF THE WEEK" label
    ctx.fillStyle = "#C8960C";
    ctx.font = `700 ${fmt === "story" ? 36 : 30}px Arial, sans-serif`;
    ctx.letterSpacing = "0.15em";
    ctx.fillText("BANANA BREAD OF THE WEEK", mid, centerY - (fmt === "story" ? 140 : 110));

    // Thin gold rule
    ctx.strokeStyle = "rgba(200,150,12,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mid - 200, centerY - (fmt === "story" ? 110 : 88));
    ctx.lineTo(mid + 200, centerY - (fmt === "story" ? 110 : 88));
    ctx.stroke();

    // Spot name — hero text
    ctx.fillStyle = "#FFE135";
    const nameSize = fmt === "story" ? 88 : 72;
    ctx.font = `700 ${nameSize}px Arial, sans-serif`;
    // Word wrap
    const words = spot.name.split(" ");
    let line = "", lineY = centerY + (fmt === "story" ? 20 : 10), lineH = nameSize * 1.2;
    const maxW = W - 160;
    words.forEach(w => {
      const test = line + w + " ";
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line.trim(), mid, lineY);
        line = w + " "; lineY += lineH;
      } else { line = test; }
    });
    ctx.fillText(line.trim(), mid, lineY);

    // Location
    const locStr = getLoc(spot.loc, spot.outlets);
    if (locStr) {
      ctx.fillStyle = "rgba(255,225,53,0.55)";
      ctx.font = `400 ${fmt === "story" ? 34 : 28}px Arial, sans-serif`;
      ctx.fillText("📍 " + locStr, mid, lineY + (fmt === "story" ? 64 : 54));
    }

    // Thin gold rule bottom
    const ruleY = H - (fmt === "story" ? 140 : 120);
    ctx.strokeStyle = "rgba(200,150,12,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mid - 200, ruleY);
    ctx.lineTo(mid + 200, ruleY);
    ctx.stroke();

    // Site watermark
    ctx.fillStyle = "rgba(200,150,12,0.6)";
    ctx.font = `600 ${fmt === "story" ? 30 : 25}px Arial, sans-serif`;
    ctx.fillText("Vote now at makebananabreadagain.com", mid, H - (fmt === "story" ? 118 : 100));
    ctx.fillStyle = "rgba(200,150,12,0.35)";
    ctx.font = `400 ${fmt === "story" ? 24 : 20}px Arial, sans-serif`;
    ctx.fillText("Votes close every Saturday 11:59pm SGT", mid, H - (fmt === "story" ? 82 : 68));

  } else {
    // ── PERSONAL TIER BADGE: Warm, celebratory ──
    // Background: tier color, clean
    ctx.fillStyle = tier.bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle vignette at bottom
    const vignette = ctx.createLinearGradient(0, H * 0.65, 0, H);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.08)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, H * 0.65, W, H * 0.35);

    const centerY = H / 2;

    // Site name — quiet top
    ctx.fillStyle = "rgba(26,10,0,0.4)";
    ctx.font = `600 ${fmt === "story" ? 30 : 26}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("MAKE BANANA BREAD AGAIN", mid, fmt === "story" ? 100 : 84);

    // Big tier emoji
    ctx.font = `${fmt === "story" ? 160 : 130}px serif`;
    ctx.fillText(tier.emoji, mid, centerY - (fmt === "story" ? 220 : 170));

    // Tier label
    ctx.fillStyle = "rgba(26,10,0,0.85)";
    ctx.font = `700 ${fmt === "story" ? 58 : 48}px Arial, sans-serif`;
    ctx.fillText(tier.label, mid, centerY - (fmt === "story" ? 90 : 68));

    // Thin separator
    ctx.strokeStyle = "rgba(26,10,0,0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mid - 160, centerY - (fmt === "story" ? 58 : 44));
    ctx.lineTo(mid + 160, centerY - (fmt === "story" ? 58 : 44));
    ctx.stroke();

    // "voted for"
    ctx.fillStyle = "rgba(26,10,0,0.45)";
    ctx.font = `400 ${fmt === "story" ? 34 : 28}px Arial, sans-serif`;
    ctx.fillText("voted for", mid, centerY + (fmt === "story" ? -10 : -4));

    // Spot name — large, centered
    ctx.fillStyle = "#1A0A00";
    const nameSize = fmt === "story" ? 80 : 66;
    ctx.font = `700 ${nameSize}px Arial, sans-serif`;
    const words = spot.name.split(" ");
    let line = "", lineY = centerY + (fmt === "story" ? 80 : 62), lineH = nameSize * 1.2;
    const maxW = W - 160;
    words.forEach(w => {
      const test = line + w + " ";
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line.trim(), mid, lineY);
        line = w + " "; lineY += lineH;
      } else { line = test; }
    });
    ctx.fillText(line.trim(), mid, lineY);

    // Location
    const locStr = getLoc(spot.loc, spot.outlets);
    if (locStr) {
      ctx.fillStyle = "rgba(26,10,0,0.4)";
      ctx.font = `400 ${fmt === "story" ? 32 : 26}px Arial, sans-serif`;
      ctx.fillText("📍 " + locStr, mid, lineY + (fmt === "story" ? 60 : 50));
    }

    // Vote count + site — bottom
    ctx.fillStyle = "rgba(26,10,0,0.35)";
    ctx.font = `500 ${fmt === "story" ? 26 : 22}px Arial, sans-serif`;
    ctx.fillStyle = "rgba(26,10,0,0.55)";
    ctx.font = `600 ${fmt === "story" ? 28 : 23}px Arial, sans-serif`;
    ctx.fillText("Have you voted? makebananabreadagain.com", mid, H - (fmt === "story" ? 118 : 102));
    ctx.fillStyle = "rgba(26,10,0,0.3)";
    ctx.font = `400 ${fmt === "story" ? 24 : 20}px Arial, sans-serif`;
    ctx.fillText(votes + " vote" + (votes !== 1 ? "s" : "") + " cast this session", mid, H - (fmt === "story" ? 82 : 70));
  }

  return cv.toDataURL("image/png");
}

// ── SHARE SHEET ───────────────────────────────────────────────────────────
function ShareSheet({spot, votes, isWinner=false, onClose}){
  const tier=getTier(Math.max(votes,1));
  const [fmt,setFmt]=useState("story");
  const [imgSrc,setImgSrc]=useState(null);
  const [sharing,setSharing]=useState(false);
  const siteUrl="https://makebananabreadagain.com";
  const shareText=isWinner
    ?`${spot.name} is Singapore's Banana Bread of the Week 🏆\nVoted by the community on Make Banana Bread Again.\n${siteUrl}`
    :`I voted for ${spot.name} on Make Banana Bread Again 🍌\nSingapore's community banana bread directory.\n${siteUrl}`;

  useEffect(()=>{
    try{setImgSrc(genBadgeImage(spot,tier,votes,fmt,isWinner));}catch(e){console.error(e);}
  },[spot,tier,votes,fmt,isWinner]);

  const saveImage=async()=>{
    if(!imgSrc)return;
    setSharing(true);
    const blob=await(await fetch(imgSrc)).blob();
    const file=new File([blob],"mbba-badge.png",{type:"image/png"});
    // Try native share with file (works for IG, WA, Telegram on mobile)
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      try{
        await navigator.share({files:[file],title:"Make Banana Bread Again",text:shareText});
      }catch(e){
        // User cancelled or not supported — fall back to download
        const a=document.createElement("a");a.href=imgSrc;a.download="mbba-badge.png";a.click();
      }
    } else {
      // Desktop: download
      const a=document.createElement("a");a.href=imgSrc;a.download="mbba-badge.png";a.click();
    }
    setSharing(false);
  };

  const copyText=()=>{
    navigator.clipboard.writeText(shareText+"\n"+siteUrl).catch(()=>{});
  };

  // Direct share links (text only — image requires native share API)
  const waLink=`https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const tgLink=`https://t.me/share/url?url=${encodeURIComponent(siteUrl)}&text=${encodeURIComponent(shareText)}`;
  const igNote="Instagram doesn't support direct share links. Save the image below and post it to your story or feed.";

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:560,padding:"24px 24px 48px",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{width:36,height:4,background:T.border,borderRadius:2}}/>
          <span style={{fontSize:15,fontWeight:600}}>{isWinner?"Winner Badge":"Share your badge"}</span>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:T.muted}}>✕</button>
        </div>

        {/* Tier strip for personal badge */}
        {!isWinner&&(
          <div style={{background:tier.bg,border:`1.5px solid ${tier.border}`,borderRadius:14,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:22}}>{tier.emoji}</span>
            <div>
              <p style={{fontSize:13,fontWeight:700,color:T.black}}>{tier.label}</p>
              <p style={{fontSize:11,color:"#5C4500"}}>{votes} vote{votes!==1?"s":""} cast</p>
            </div>
          </div>
        )}

        {/* Format picker */}
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {[["story","Story 9:16"],["feed","Feed 4:5"]].map(([f,l])=>(
            <button key={f} onClick={()=>setFmt(f)} style={{flex:1,padding:"9px",borderRadius:12,border:`1.5px solid ${fmt===f?T.black:T.border}`,background:fmt===f?T.yellow:T.white,color:T.black,fontSize:13,fontWeight:fmt===f?600:400,cursor:"pointer",fontFamily:T.font}}>{l}</button>
          ))}
        </div>

        {/* Badge preview */}
        {imgSrc&&(
          <div style={{borderRadius:14,overflow:"hidden",marginBottom:16,border:`1px solid ${T.border}`,background:T.sep}}>
            <img src={imgSrc} style={{width:"100%",display:"block"}} alt="Share badge"/>
          </div>
        )}

        {/* Save + native share */}
        <button onClick={saveImage} disabled={sharing} style={{width:"100%",padding:"14px",borderRadius:14,border:`1.5px solid ${T.black}`,background:T.black,color:T.yellow,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:T.font,marginBottom:10,opacity:sharing?0.7:1}}>
          {sharing?"Opening share…":"Save image / Share"}
        </button>
        <p style={{fontSize:11,color:T.muted,textAlign:"center",marginBottom:20,lineHeight:1.5}}>
          On mobile: tap to open your share sheet (Instagram, WhatsApp, Telegram). On desktop: saves the image to download.
        </p>

        {/* Direct links for WA and Telegram */}
        <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:10}}>Share directly</p>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <a href={waLink} target="_blank" rel="noopener noreferrer" style={{flex:1,textAlign:"center",padding:"11px",borderRadius:12,border:`1.5px solid ${T.border}`,background:"#25D366",color:"#FFF",fontSize:14,fontWeight:600,textDecoration:"none",display:"block"}}>
            WhatsApp
          </a>
          <a href={tgLink} target="_blank" rel="noopener noreferrer" style={{flex:1,textAlign:"center",padding:"11px",borderRadius:12,border:`1.5px solid ${T.border}`,background:"#0088CC",color:"#FFF",fontSize:14,fontWeight:600,textDecoration:"none",display:"block"}}>
            Telegram
          </a>
        </div>
        <div style={{background:T.sep,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
          <p style={{fontSize:11,color:"#E1306C",fontWeight:600,marginBottom:4}}>📷 Instagram</p>
          <p style={{fontSize:12,color:T.muted,lineHeight:1.5}}>{igNote}</p>
        </div>
        <button onClick={copyText} style={{width:"100%",padding:"11px",borderRadius:12,border:`1.5px solid ${T.border}`,background:T.white,color:T.black,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.font}}>
          Copy text caption
        </button>
      </div>
    </div>
  );
}

// ── SHEET ─────────────────────────────────────────────────────────────────
function Sheet({ children, onClose, title }) {
  return (
    <div
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
          position: "relative",
          zIndex: 100000,
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
          <h2
            style={{
              fontSize: 20,
              fontWeight: 900,
              margin: 0,
              textAlign: "center",
            }}
          >
            {title}
          </h2>

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              fontSize: 28,
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

// ── REVIEW SHEET ──────────────────────────────────────────────────────────
function ReviewSheet({spot,onSubmit,onClose}){
  const [stars,setStars]=useState(0);
  const [hov,setHov]=useState(0);
  const [picked,setPicked]=useState({});
  const toggle=(g,t)=>setPicked(prev=>{const k=`${g}:${t}`;const next={...prev};if(next[k])delete next[k];else next[k]=true;return next;});
  return(
    <Sheet onClose={onClose} title={`Rate ${spot.name}`}>
      <div style={{display:"flex",gap:8,marginBottom:stars>0?20:0}}>
        {[1,2,3,4,5].map(n=>(
          <span key={n} onClick={()=>setStars(n)} onMouseEnter={()=>setHov(n)} onMouseLeave={()=>setHov(0)}
            style={{fontSize:32,cursor:"pointer",color:(hov||stars)>=n?"#FFB800":T.border,transition:"color 0.1s",userSelect:"none"}}>★</span>
        ))}
      </div>
      {stars>0&&Object.entries(DESCRIPTORS).map(([grp,tags])=>(
        <div key={grp} style={{marginBottom:16}}>
          <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:8}}>{grp}</p>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {tags.map(tag=>{const on=picked[`${grp}:${tag}`];return(
              <button key={tag} onClick={()=>toggle(grp,tag)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${on?T.black:T.border}`,background:on?T.yellow:T.white,color:T.black,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:T.font,transition:"all 0.12s"}}>{tag}</button>
            );})}
          </div>
        </div>
      ))}
      <button onClick={()=>{if(stars){onSubmit(stars,picked);onClose();}}} style={{marginTop:16,width:"100%",padding:"14px",borderRadius:14,border:`1.5px solid ${stars?T.black:T.border}`,background:T.white,color:stars?T.black:T.muted,fontSize:15,fontWeight:600,cursor:stars?"pointer":"default",fontFamily:T.font}}>
        Submit review
      </button>
    </Sheet>
  );
}

// ── EDIT SHEET ────────────────────────────────────────────────────────────
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
  const [eHalal, setEHalal] = useState(spot.halal || false);
  const [eMuslim, setEMuslim] = useState(spot.muslimOwned || false);
  const [eNoPorkLard, setENoPorkLard] = useState(spot.noPorkLard || false);
  const [eVegan, setEVegan] = useState(spot.vegan || false);
  const [eDairy, setEDairy] = useState(spot.dairyFree || false);
  const [eHidden, setEHidden] = useState(spot.hiddenGem || false);

  return (
    <Sheet onClose={onClose} title="Suggest an edit">
      <p style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
        {spot.name}
      </p>

      <p style={{ fontSize: 12, color: T.muted, marginBottom: 18 }}>
        Help us keep this listing accurate. Updates are sent to our team for review.
      </p>

      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: T.muted, display: "block", marginBottom: 8 }}>
        NAME
      </label>

      <input
        value={eName}
        onChange={e => setEName(e.target.value)}
        placeholder="Listing name"
        style={{
          width: "100%",
          padding: "13px 16px",
          borderRadius: 12,
          border: `1.5px solid ${T.border}`,
          fontSize: 16,
          outline: "none",
          marginBottom: 16,
        }}
      />

      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: T.muted, display: "block", marginBottom: 8 }}>
        WEBSITE OR INSTAGRAM LINK
      </label>

      <input
        value={eUrl}
        onChange={e => setEUrl(e.target.value)}
        placeholder="https://instagram.com/..."
        style={{
          width: "100%",
          padding: "13px 16px",
          borderRadius: 12,
          border: `1.5px solid ${T.border}`,
          fontSize: 16,
          outline: "none",
          marginBottom: 16,
        }}
      />

      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: T.muted, display: "block", marginBottom: 8 }}>
        LOCATION OR AREA
      </label>

      <input
        value={eLoc}
        onChange={e => setELoc(e.target.value)}
        placeholder="Area / location"
        style={{
          width: "100%",
          padding: "13px 16px",
          borderRadius: 12,
          border: `1.5px solid ${T.border}`,
          fontSize: 16,
          outline: "none",
          marginBottom: 16,
        }}
      />

      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: T.muted, display: "block", marginBottom: 8 }}>
        CATEGORY
      </label>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {CATS.map(c => (
          <Pill key={c} active={eCat === c} onClick={() => setECat(c)}>
            {c}
          </Pill>
        ))}
      </div>

      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: T.muted, display: "block", marginBottom: 8 }}>
        OUTLETS
      </label>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
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

      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: T.muted, display: "block", marginBottom: 8 }}>
        TAGS
      </label>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22 }}>
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
        onClick={() => {
          onSubmit(spot.id, {
  name: eName,
  url: eUrl,
  loc: eLoc,
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
        style={{
          width: "100%",
          padding: "14px 16px",
          borderRadius: 14,
          border: `2px solid ${T.black}`,
          background: T.white,
          color: T.black,
          fontSize: 16,
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Submit update
      </button>
    </Sheet>
  );
}

// ── FLAG SHEET ────────────────────────────────────────────────────────────
function FlagSheet({spot,onClose,onFlag}){
  const [selected,setSelected]=useState("");
  const [otherText,setOtherText]=useState("");
  const canSubmit=selected&&(selected!=="Other"||otherText.trim().length>2);
  return(
    <Sheet onClose={onClose} title="Flag listing">
      <p style={{fontSize:14,fontWeight:600,marginBottom:2}}>{spot.name}</p>
      <p style={{fontSize:12,color:T.muted,marginBottom:18}}>What's the issue?</p>
      {FLAG_REASONS.map(r=>(
        <button key={r} onClick={()=>setSelected(r)}
          style={{display:"flex",alignItems:"center",gap:10,width:"100%",textAlign:"left",padding:"13px 14px",marginBottom:6,borderRadius:12,background:selected===r?T.sep:T.white,border:`1.5px solid ${selected===r?T.black:T.border}`,fontSize:14,color:T.black,cursor:"pointer",fontFamily:T.font}}>
          <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${selected===r?T.black:T.border}`,background:selected===r?T.black:"transparent",flexShrink:0}}/>
          {r}
        </button>
      ))}
      {selected==="Other"&&(
        <textarea value={otherText} onChange={e=>setOtherText(e.target.value)} placeholder="Please describe the issue..."
          style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`1.5px solid ${T.border}`,fontSize:14,fontFamily:T.font,color:T.black,background:T.white,outline:"none",marginTop:6,resize:"vertical",minHeight:80}}/>
      )}
      <button onClick={()=>{if(canSubmit){onFlag(spot.id,selected,otherText);onClose();}}}
        disabled={!canSubmit}
        style={{marginTop:16,width:"100%",padding:"14px",borderRadius:14,border:`1.5px solid ${canSubmit?T.black:T.border}`,background:T.white,color:canSubmit?T.black:T.muted,fontSize:15,fontWeight:600,cursor:canSubmit?"pointer":"default",fontFamily:T.font}}>
        Submit flag
      </button>
      <button onClick={onClose} style={{marginTop:8,width:"100%",padding:"12px",borderRadius:14,border:`1.5px solid ${T.border}`,background:T.white,color:T.muted,fontSize:14,cursor:"pointer",fontFamily:T.font}}>Cancel</button>
    </Sheet>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────
export default function MBBA(){
  const [spots,setSpots]     = useState([]);
  const [isLoading,setIsLoading] = useState(false);
  const [dbError,setDbError]   = useState(null); // null = no error, string = show banner
  const [section,setSection] = useState("vote");
  const [showLanding,setShowLanding] = useState(()=>{
    try{ return sessionStorage.getItem('mbba_seen_intro')!=='true'; }catch{ return true; }
  });
  const dismissLanding=useCallback(()=>{
    try{ sessionStorage.setItem('mbba_seen_intro','true'); }catch{}
    setShowLanding(false);
  },[]);
  const goHome=useCallback(()=>setShowLanding(true),[]);
  const [pair,setPair]       = useState(()=>randPair(SEED));
  const [chosen,setChosen]   = useState(null);
  const [loser,setLoser]     = useState(null);
  const [sessionVotes,setSV] = useState(0);
  const [voteRounds,setVoteRounds] = useState(0);
  const [showAbout,setShowAbout]   = useState(false);
  const [showFeedback,setShowFeedback] = useState(false);
  const [reviewSpot,setReviewSpot] = useState(null);
  const [editSpot,setEditSpot]     = useState(null);
  const [flagSpot,setFlagSpot]     = useState(null);
  const [shareSpot,setShareSpot]   = useState(null);
  const [shareIsWinner,setShareIsWinner] = useState(false);
  const [toast,setToast]     = useState(null);
  // Add form — separate state vars to avoid hooks-in-objects issues
  const [nName,setNName]=useState("");
  const [nLoc,setNLoc]=useState("");
  const [nUrl,setNUrl]=useState("");
  const [nCat,setNCat]=useState("Café");
  const [nOut,setNOut]=useState("single");
  const [nHalal,setNHalal]=useState(false);
const [nMuslim,setNMuslim]=useState(false);
const [nNoPorkLard,setNNoPorkLard]=useState(false);
const [nVegan,setNVegan]=useState(false);
const [nDairy,setNDairy]=useState(false);
const [nHidden,setNHidden]=useState(false);
const [nSG,setNSG]=useState(false);
  const [formErr,setFormErr]=useState("");
  const [fbName,setFbName]=useState("");
  const [fbEmail,setFbEmail]=useState("");
  const [fbType,setFbType]=useState("General feedback");
  const [fbMsg,setFbMsg]=useState("");
  const [fbSending,setFbSending]=useState(false);
  const [fbDone,setFbDone]=useState(false);
  const [fbErr,setFbErr]=useState("");
  const [dupWarn,setDupWarn]=useState(null);

  useOGMeta();
  // ── LOAD SPOTS FROM SUPABASE ──────────────────────────────────────────────
  useEffect(()=>{
    async function loadSpots(){
      setIsLoading(true);
      const db = getSupabase();
      try{
        const data=await db.select('spots','select=*&order=name.asc');
        if(data&&data.length>0){
          setDbError(null);
          const mapped=data.map(mapSpotFromDb);
          setSpots(mapped);
          setPair(randPair(mapped));
        } else {
          // First run — seed the database with SEED data
          await seedDatabase();
        }
      }catch(err){
        console.error('Failed to load spots:',err);
        // Show specific error in banner for debugging
        const msg = err?.message || err?.toString() || 'Unknown error';
        setDbError('Connection error: ' + msg + ' — showing local data.');
        setSpots(SEED);
        setPair(randPair(SEED));
      }
      setIsLoading(false);
    }
    loadSpots();
  },[]);

  async function seedDatabase(){
    const db=getSupabase();
    const inserted=[];
    const batchSize=10;
    for(let i=0;i<SEED.length;i+=batchSize){
      const batch=SEED.slice(i,i+batchSize).map(mapSpotToDb);
      try{
        const rows = await db.insert('spots', batch);
        if(rows) inserted.push(...(Array.isArray(rows)?rows:[rows]));
      }catch(e){ console.error('Batch error:',e.message); }
    }
    if(inserted.length>0){
      const mapped=inserted.map(mapSpotFromDb);
      setSpots(mapped);setPair(randPair(mapped));setDbError(null);
    }else{
      setDbError('Seed failed — check Supabase policies.');
      setSpots(SEED);setPair(randPair(SEED));
    }
  }

  // ── RELOAD SPOTS FROM DB (called after votes to refresh rankings) ──────────
  const reloadSpots=useCallback(async()=>{
    try{
      const data=await getSupabase().select('spots','select=*&order=name.asc');
      if(data&&data.length>0){
        setSpots(data.map(mapSpotFromDb));
      }
    }catch(e){console.error('Reload error:',e);}
  },[]);

  // ── LOAD WEEKLY WINNER ────────────────────────────────────────────────────
  const [weeklyWinner,setWeeklyWinner]=useState(null);
  useEffect(()=>{
    async function loadWinner(){
      const rows=await getSupabase().select('weekly_winners','select=*,spots(name,loc,cat)&active=eq.true&limit=1').catch(()=>null);
      if(rows&&rows[0]) setWeeklyWinner(rows[0]);
    }
    loadWinner();
  },[]);

  // Reload from DB when switching to rankings
  const handleSection=useCallback((s)=>{setSection(s);if(s==='rankings')reloadSpots();},[reloadSpots]);
  const skipBout=useCallback(()=>{setSpots(prev=>{setPair(randPair(prev));return prev;});setChosen(null);setLoser(null);},[]);
  const showToast=useCallback((msg)=>{setToast(msg);setTimeout(()=>setToast(null),2000);},[]);

  const handleNName=useCallback((val)=>{
    setNName(val);
    if(val.length<3){setDupWarn(null);return;}
    const m=spots.find(s=>strSimilarity(s.name,val)>0.75);
    setDupWarn(m||null);
  },[spots]);

  const vote=useCallback((winner,loserSpot)=>{
    if(chosen)return;
    setChosen(winner.id);setLoser(loserSpot.id);setSV(v=>v+1);
    // Optimistic UI update
    setSpots(prev=>prev.map(s=>{
      if(s.id===winner.id)return{...s,wins:s.wins+1,weeklyWins:(s.weeklyWins||0)+1};
      if(s.id===loserSpot.id)return{...s,losses:s.losses+1};
      return s;
    }));
    // Write to Supabase via a SECURITY DEFINER RPC (see
    // supabase/migrations/0001_harden_spots_rls.sql). Spots no longer has a
    // public UPDATE policy, since a raw client-side PATCH let anyone set
    // wins/losses to any value on any row — this atomically does exactly
    // +1/+1 server-side and nothing else.
    const db=getSupabase();
    const wid=winner.id, lid=loserSpot.id;
    db.rpc('cast_vote',{p_winner_id:wid,p_loser_id:lid}).catch(()=>{});
    db.insert('votes',{winner_id:wid,loser_id:lid,session_id:SESSION_ID}).catch(()=>{});
    // Always advance regardless of DB result
    setTimeout(()=>{
      setChosen(null);
      setLoser(null);
      setVoteRounds(b=>b+1);
      setSpots(prev=>{setPair(randPair(prev));return prev;});
      if(voteRounds>0&&voteRounds%5===0)setReviewSpot(winner);
    },750);
  },[chosen,voteRounds]);

  const submitReview=useCallback((spotId,stars,tags)=>{
    // Optimistic update
    setSpots(prev=>prev.map(s=>{
      if(s.id!==spotId)return s;
      const t={...s.tags};
      Object.keys(tags).forEach(k=>{const tag=k.split(":")[1];t[tag]=(t[tag]||0)+1;});
      return{...s,stars:[...s.stars,stars],tags:t};
    }));
    // Write to Supabase
    const tagList=Object.keys(tags).map(k=>k.split(":")[1]);
    const db=getSupabase();
    db.insert('reviews',{
      spot_id:spotId,
      stars,
      tags:tagList,
      session_id:SESSION_ID,
    }).then(async()=>{
      const data=await db.select('reviews',`select=stars&spot_id=eq.${encodeURIComponent(spotId)}`);
      if(data&&data.length){
        const total=data.reduce((a,b)=>a+(Number(b.stars)||0),0);
        await db.update('spots',{
          stars_total:total,
          star_count:data.length,
        },{id:spotId});
      }
    }).catch(err=>console.error('Review write error:',err));
    showToast("Review added");
  },[showToast]);

const submitEdit = useCallback((spotId, data) => {
  const editedSpot = spots.find(s => s.id === spotId);

  const nextOutlets =
    data.outletType === "island"
      ? "island-wide"
      : data.outletType === "multiple"
      ? "multiple"
      : "single";

  const nextMultipleOutlets = data.outletType === "multiple";

  // Update the frontend immediately
  setSpots(prev =>
    prev.map(s =>
      s.id === spotId
        ? {
            ...s,
            name: data.name || s.name,
            url: data.url || "",
            loc: data.loc || "",
            cat: data.cat || s.cat,
            outlets: nextOutlets,
            multipleOutlets: nextMultipleOutlets,

            halal: data.halal || false,
            muslimOwned: data.muslimOwned || false,
            noPorkLard: data.noPorkLard || false,
            vegan: data.vegan || false,
            dairyFree: data.dairyFree || false,
            hiddenGem: data.hiddenGem || false,
          }
        : s
    )
  );

  // Save to Supabase
  getSupabase()
    .update(
      "spots",
      {
        name: data.name || "",
        url: data.url || "",
        loc: data.loc || "",
        cat: data.cat || "",
        outlets: nextOutlets,
        multiple_outlets: nextMultipleOutlets,

        halal: data.halal || false,
        muslim_owned: data.muslimOwned || false,
        no_pork_lard: data.noPorkLard || false,
        vegan: data.vegan || false,
        dairy_free: data.dairyFree || false,
        hidden_gem: data.hiddenGem || false,
      },
      { id: spotId }
    )
    .catch(err => console.error("Edit write error", err));

  // Send email notification
  fetch("/api/notify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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

      oldOutlets: editedSpot?.outlets || "",
      newOutlets: nextOutlets,

      url: data.url || "",

      halal: data.halal || false,
      muslimOwned: data.muslimOwned || false,
      noPorkLard: data.noPorkLard || false,
      vegan: data.vegan || false,
      dairyFree: data.dairyFree || false,
      multipleOutlets: nextMultipleOutlets,
      islandWide: data.outletType === "island",
      hiddenGem: data.hiddenGem || false,
    }),
  }).catch(err => {
    console.error("Edit email error", err);
  });

  showToast("Thanks for the update. We’ll review it soon.");
}, [showToast, spots]);

  const flagListing = useCallback((spotId, reason, otherText) => {
  setSpots(prev =>
    prev.map(s =>
      s.id === spotId ? { ...s, flagged: true } : s
    )
  );

  showToast("Flagged. We will review it.");

  const spot = spots.find(s => s.id === spotId);

  fetch("/api/notify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
  }).catch(err => {
    console.error("Flag email/save error", err);
  });
}, [showToast, spots]);

  const submitSpot=useCallback(()=>{
    // Rate limiting handled server-side via Supabase RLS + IP check
    // Client-side: basic session guard to prevent double-submit
    if(!nName.trim()){setFormErr("Name is required.");return;}
    if(!nLoc.trim()){setFormErr("Location is required.");return;}
    if(!nSG){setFormErr("Please confirm this business is in Singapore.");return;}
    let outlets=nOut;
    const l=nLoc.toLowerCase();
    if(l.includes("island-wide")||l.includes("islandwide"))outlets="island-wide";
    else if(l.includes("multiple")||l.includes("outlets"))outlets="multiple";
    const tempId=`temp_${Date.now()}`;
const tempSpot=mkSpot(tempId,nName.trim(),nLoc.trim(),nCat,outlets,nUrl.trim(),{
  halal:nHalal,
  muslimOwned:nMuslim,
  noPorkLard:nNoPorkLard,
  vegan:nVegan,
  dairyFree:nDairy,
  hiddenGem:nHidden,
});
    const newSpotData={...mapSpotToDb(tempSpot),outlets};
const notifyPayload={
  type:"new_spot",
  name:nName.trim(),
  loc:nLoc.trim(),
  cat:nCat,
  outlets,
  url:nUrl.trim(),
  halal:nHalal,
  muslimOwned:nMuslim,
  noPorkLard:nNoPorkLard,
  vegan:nVegan,
  dairyFree:nDairy,
  hiddenGem:nHidden,
};

    setFormErr("");setDupWarn(null);
    setSpots(prev=>{const u=[...prev,tempSpot];setPair(randPair(u));return u;});
    setNName("");setNLoc("");setNUrl("");setNCat("Café");setNOut("single");
setNHalal(false);
setNMuslim(false);
setNNoPorkLard(false);
setNVegan(false);
setNDairy(false);
setNHidden(false);
setNSG(false);
    showToast("Added to the vote");setSection("vote");

    // Write to Supabase, then replace the temporary local item with the saved DB row
    getSupabase().insert('spots',newSpotData).then(data=>{
      const saved=Array.isArray(data)?data[0]:data;
      if(saved){
        const mapped=mapSpotFromDb(saved);
        setSpots(prev=>{
          const u=prev.map(item=>item.id===tempId?mapped:item);
          setPair(randPair(u));
          return u;
        });
      }
    }).catch(err=>{
      console.error('Add spot error:',err);
      setDbError('Add spot saved locally but failed to sync: '+(err?.message||err));
    });

    // Email notification
    fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify(notifyPayload)
    }).catch(()=>{});
},[nName,nLoc,nUrl,nCat,nOut,nHalal,nMuslim,nNoPorkLard,nVegan,nDairy,nHidden,nSG,showToast]);

  const submitFeedback=useCallback(async()=>{
    if(!fbMsg.trim()){setFbErr("Please write your message.");return;}
    setFbSending(true);setFbErr("");
    try{
      const res=await fetch("/api/notify",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          type:"feedback",
          name:fbName||"Anonymous",
          email:fbEmail||"Not provided",
          feedbackType:fbType,
          message:fbMsg,
        })
      });
      if(res.ok){setFbDone(true);setFbName("");setFbEmail("");setFbMsg("");setFbType("General feedback");}
      else{setFbErr("Something went wrong. Please try again.");}
    }catch{setFbErr("Something went wrong. Please try again.");}
    setFbSending(false);
  },[fbName,fbEmail,fbType,fbMsg]);

const ranked = useMemo(() => [...spots].sort((a, b) => {
  const aVotes = a.wins + a.losses;
  const bVotes = b.wins + b.losses;

  if (aVotes === 0 && bVotes === 0) return a.name.localeCompare(b.name);
  if (aVotes === 0) return 1;
  if (bVotes === 0) return -1;

  const rankDiff = calcElo(b.wins, b.losses) - calcElo(a.wins, a.losses);
  if (rankDiff !== 0) return rankDiff;

  return b.wins - a.wins;
}), [spots]);

  return(
    <div className="mbba" style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{font-size:16px;-webkit-text-size-adjust:100%;text-size-adjust:100%;height:100%;}
        html,body,#root{background:var(--crumb);font-family:var(--font-body);color:var(--crust);-webkit-font-smoothing:antialiased;min-height:100%;}
        body{overscroll-behavior-y:contain;margin:0;padding:0;}
        #root{display:flex;flex-direction:column;min-height:100vh;}
        button,input,textarea,select{font-family:inherit;color:inherit;-webkit-appearance:none;appearance:none;}
        input,textarea,select{font-size:16px !important;}
        button{touch-action:manipulation;}
        button:active{opacity:0.85;}
        a{-webkit-tap-highlight-color:transparent;}
        img{max-width:100%;height:auto;display:block;}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        *{scrollbar-width:none;-ms-overflow-style:none;}
        *::-webkit-scrollbar{display:none;}
      `}</style>

      {showAbout    && <AboutSheet onClose={()=>setShowAbout(false)}/>}
      {showFeedback && (
        <FeedbackSheet
          fbName={fbName} setFbName={setFbName}
          fbEmail={fbEmail} setFbEmail={setFbEmail}
          fbType={fbType} setFbType={setFbType}
          fbMsg={fbMsg} setFbMsg={setFbMsg}
          fbSending={fbSending} fbDone={fbDone} setFbDone={setFbDone} fbErr={fbErr}
          submitFeedback={submitFeedback}
          onClose={()=>setShowFeedback(false)}
        />
      )}
      {reviewSpot  && <ReviewSheet spot={reviewSpot}  onSubmit={(s,t)=>submitReview(reviewSpot.id,s,t)} onClose={()=>setReviewSpot(null)}/>}
      {editSpot    && <EditSheet   spot={editSpot}    onSubmit={submitEdit}  onClose={()=>setEditSpot(null)}/>}
      {flagSpot    && <FlagSheet   spot={flagSpot}    onFlag={(id,reason,other)=>flagListing(id,reason,other)}   onClose={()=>setFlagSpot(null)}/>}
      {shareSpot   && <ShareSheet  spot={shareSpot}   votes={sessionVotes}   isWinner={shareIsWinner} onClose={()=>setShareSpot(null)}/>}

      {toast&&<div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",background:"var(--crust)",color:"var(--crumb)",padding:"10px 20px",borderRadius:20,fontSize:13,fontWeight:600,zIndex:400,whiteSpace:"nowrap",animation:"toastIn 0.22s ease",pointerEvents:"none"}}>{toast}</div>}

      {/* LOADING SCREEN */}
      {isLoading&&spots.length===0&&(
        <div style={{position:"fixed",inset:0,background:"var(--crumb)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
          <span style={{fontSize:48}}>🍌</span>
          <p style={{fontSize:14,color:"var(--ink-soft)"}}>Loading the directory…</p>
        </div>
      )}

      {showLanding ? (
        <LandingPage spots={spots} ranked={ranked} weeklyWinner={weeklyWinner} onEnter={dismissLanding}/>
      ) : (
        <>
          {section==="vote" && (
            <VotePage spots={spots} ranked={ranked} weeklyWinner={weeklyWinner} pair={pair} chosen={chosen} vote={vote} onSkip={skipBout} sessionVotes={sessionVotes} onGoHome={goHome}/>
          )}
          {section==="rankings" && (
            <RankingsPage spots={spots} ranked={ranked} weeklyWinner={weeklyWinner} onGoHome={goHome}/>
          )}
          {section==="spots" && (
            <SpotsPage
              spots={spots} ranked={ranked}
              nName={nName} setNName={setNName} handleNName={handleNName} dupWarn={dupWarn}
              nLoc={nLoc} setNLoc={setNLoc} nUrl={nUrl} setNUrl={setNUrl}
              nCat={nCat} setNCat={setNCat} nOut={nOut} setNOut={setNOut}
              nHalal={nHalal} setNHalal={setNHalal} nMuslim={nMuslim} setNMuslim={setNMuslim}
              nNoPorkLard={nNoPorkLard} setNNoPorkLard={setNNoPorkLard}
              nVegan={nVegan} setNVegan={setNVegan} nDairy={nDairy} setNDairy={setNDairy}
              nHidden={nHidden} setNHidden={setNHidden} nSG={nSG} setNSG={setNSG}
              formErr={formErr} submitSpot={submitSpot}
              onGoHome={goHome}
            />
          )}

          <BottomNav section={section} onSelect={handleSection} onOpenFeedback={()=>setShowFeedback(true)} onOpenAbout={()=>setShowAbout(true)}/>
        </>
      )}
    </div>
  );
}