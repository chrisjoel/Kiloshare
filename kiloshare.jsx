import { useState, useEffect } from "react";

// ── Data layer (swap this section for API calls later) ──────────────────────
const ROUTES = [
  { id: "cmr-rus", from: "Cameroon", to: "Russia", flag_from: "🇨🇲", flag_to: "🇷🇺" },
  { id: "rus-cmr", from: "Russia", to: "Cameroon", flag_from: "🇷🇺", flag_to: "🇨🇲" },
];

const CITIES = {
  Cameroon: ["Douala", "Yaoundé", "Bafoussam", "Garoua", "Bamenda"],
  Russia: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan"],
};

const SEED_LISTINGS = [
  {
    id: 1, seller: "Amara K.", avatar: "AK", route: "cmr-rus",
    from: "Cameroon", to: "Russia", city_from: "Douala", city_to: "Moscow",
    date: "2025-06-15", kilos: 8, price_per_kg: 12, currency: "USD",
    flight: "AF 700 → SU 123", verified: true,
    note: "Direct connection via Paris. Available for food & personal items.",
  },
  {
    id: 2, seller: "Nikolai V.", avatar: "NV", route: "rus-cmr",
    from: "Russia", to: "Cameroon", city_from: "Moscow", city_to: "Yaoundé",
    date: "2025-06-20", kilos: 15, price_per_kg: 10, currency: "USD",
    flight: "SU 265 → AF 702", verified: true,
    note: "Electronics & documents OK. No liquids please.",
  },
  {
    id: 3, seller: "Fatou N.", avatar: "FN", route: "cmr-rus",
    from: "Cameroon", to: "Russia", city_from: "Yaoundé", city_to: "Saint Petersburg",
    date: "2025-07-02", kilos: 5, price_per_kg: 14, currency: "USD",
    flight: "ET 512 → SU 050", verified: false,
    note: "Small parcels preferred. Contact me first.",
  },
  {
    id: 4, seller: "Ivan M.", avatar: "IM", route: "rus-cmr",
    from: "Russia", to: "Cameroon", city_from: "Saint Petersburg", city_to: "Douala",
    date: "2025-07-10", kilos: 20, price_per_kg: 9, currency: "USD",
    flight: "SU 034 → KQ 201", verified: true,
    note: "Flexible on content. Regular traveller — reliable.",
  },
];

// ── Components ───────────────────────────────────────────────────────────────

function Avatar({ initials, color = "#185FA5" }) {
  const bg = color + "22";
  return (
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      background: bg, color, border: `1.5px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 500, fontSize: 13, flexShrink: 0,
      fontFamily: "'DM Mono', monospace",
    }}>
      {initials}
    </div>
  );
}

const avatarColors = ["#185FA5", "#0F6E56", "#993C1D", "#7F77DD", "#D4537E"];
function colorFor(id) { return avatarColors[id % avatarColors.length]; }

function Badge({ children, type = "default" }) {
  const styles = {
    default: { bg: "#F1EFE8", color: "#5F5E5A", border: "#B4B2A9" },
    success: { bg: "#EAF3DE", color: "#3B6D11", border: "#97C459" },
    info:    { bg: "#E6F1FB", color: "#185FA5", border: "#85B7EB" },
    warn:    { bg: "#FAEEDA", color: "#854F0B", border: "#EF9F27" },
  };
  const s = styles[type];
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: "2px 8px",
      borderRadius: 99, background: s.bg, color: s.color,
      border: `0.5px solid ${s.border}`, letterSpacing: "0.03em",
    }}>{children}</span>
  );
}

function ListingCard({ listing, onContact }) {
  const [kg, setKg] = useState(1);
  const total = (kg * listing.price_per_kg).toFixed(0);
  const color = colorFor(listing.id);

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "1.25rem",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Avatar initials={listing.avatar} color={color} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 500, fontSize: 15, color: "var(--color-text-primary)" }}>
              {listing.seller}
            </span>
            {listing.verified && <Badge type="success">✓ Verified</Badge>}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>
            {listing.flight}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)", fontFamily: "'DM Mono', monospace" }}>
            ${listing.price_per_kg}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>per kg</div>
        </div>
      </div>

      {/* Route */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "var(--color-background-secondary)",
        borderRadius: "var(--border-radius-md)",
        padding: "10px 14px", fontSize: 13,
      }}>
        <span style={{ fontWeight: 500 }}>{listing.city_from}</span>
        <span style={{ color: "var(--color-text-secondary)", flex: 1, textAlign: "center", letterSpacing: 2 }}>——→</span>
        <span style={{ fontWeight: 500 }}>{listing.city_to}</span>
        <span style={{ color: "var(--color-text-secondary)", marginLeft: 8 }}>
          {new Date(listing.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </span>
      </div>

      {/* Capacity */}
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
        <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{listing.kilos} kg</span> available
        {listing.note && (
          <span style={{ display: "block", marginTop: 4, fontStyle: "italic" }}>{listing.note}</span>
        )}
      </div>

      {/* Calculator */}
      <div style={{
        borderTop: "0.5px solid var(--color-border-tertiary)",
        paddingTop: 12, display: "flex", alignItems: "center", gap: 12,
      }}>
        <label style={{ fontSize: 13, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
          Book kg:
        </label>
        <input
          type="number" min={1} max={listing.kilos} value={kg}
          onChange={e => setKg(Math.min(listing.kilos, Math.max(1, +e.target.value)))}
          style={{ width: 60, textAlign: "center" }}
        />
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)", flex: 1 }}>
          = <strong style={{ color: "var(--color-text-primary)", fontFamily: "'DM Mono', monospace" }}>${total}</strong>
        </span>
        <button onClick={() => onContact(listing, kg)} style={{
          background: "#185FA5", color: "#fff",
          border: "none", borderRadius: "var(--border-radius-md)",
          padding: "7px 16px", fontSize: 13, fontWeight: 500,
          cursor: "pointer", whiteSpace: "nowrap",
        }}>
          Contact →
        </button>
      </div>
    </div>
  );
}

function PostForm({ onPost, onClose }) {
  const [form, setForm] = useState({
    seller: "", route: "cmr-rus", city_from: "", city_to: "",
    date: "", kilos: "", price_per_kg: "", flight: "", note: "",
  });
  const [done, setDone] = useState(false);

  const route = ROUTES.find(r => r.id === form.route);
  const cities_from = CITIES[route?.from] || [];
  const cities_to   = CITIES[route?.to]   || [];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.seller || !form.city_from || !form.city_to || !form.date || !form.kilos || !form.price_per_kg) {
      alert("Please fill all required fields.");
      return;
    }
    onPost({ ...form, id: Date.now(), avatar: form.seller.slice(0,2).toUpperCase(), verified: false, currency: "USD" });
    setDone(true);
  };

  if (done) return (
    <div style={{ textAlign: "center", padding: "2rem 0" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
      <p style={{ fontWeight: 500 }}>Listing published!</p>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Buyers can now contact you.</p>
      <button onClick={onClose} style={{ marginTop: 16 }}>Close</button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Post available kilos</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Your name *</label>
          <input placeholder="e.g. Jean-Pierre K." value={form.seller} onChange={e => set("seller", e.target.value)} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Route *</label>
          <select value={form.route} onChange={e => set("route", e.target.value)} style={{ width: "100%" }}>
            {ROUTES.map(r => <option key={r.id} value={r.id}>{r.flag_from} {r.from} → {r.flag_to} {r.to}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Departure city *</label>
          <select value={form.city_from} onChange={e => set("city_from", e.target.value)} style={{ width: "100%" }}>
            <option value="">Select city</option>
            {cities_from.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Arrival city *</label>
          <select value={form.city_to} onChange={e => set("city_to", e.target.value)} style={{ width: "100%" }}>
            <option value="">Select city</option>
            {cities_to.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Travel date *</label>
          <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Flight number</label>
          <input placeholder="e.g. AF 700" value={form.flight} onChange={e => set("flight", e.target.value)} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Kilos available *</label>
          <input type="number" min={1} placeholder="e.g. 10" value={form.kilos} onChange={e => set("kilos", e.target.value)} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Price per kg (USD) *</label>
          <input type="number" min={1} placeholder="e.g. 12" value={form.price_per_kg} onChange={e => set("price_per_kg", e.target.value)} style={{ width: "100%" }} />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Note for buyers</label>
        <textarea placeholder="e.g. No fragile items. Food & documents welcome." value={form.note}
          onChange={e => set("note", e.target.value)}
          style={{ width: "100%", minHeight: 64, resize: "vertical" }} />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSubmit} style={{
          background: "#185FA5", color: "#fff", border: "none",
          borderRadius: "var(--border-radius-md)", padding: "7px 20px",
          fontWeight: 500, cursor: "pointer",
        }}>Publish listing</button>
      </div>
    </div>
  );
}

function ContactModal({ listing, kg, onClose }) {
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState(
    `Hi ${listing.seller.split(" ")[0]}, I'd like to book ${kg} kg on your ${listing.city_from} → ${listing.city_to} trip on ${listing.date}. Is this still available?`
  );

  return (
    <div style={{
      minHeight: 400, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: "var(--border-radius-lg)", padding: "1.5rem",
    }}>
      <div style={{
        background: "var(--color-background-primary)",
        borderRadius: "var(--border-radius-lg)",
        border: "0.5px solid var(--color-border-tertiary)",
        padding: "1.5rem", width: "100%", maxWidth: 440,
      }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✉️</div>
            <p style={{ fontWeight: 500 }}>Request sent!</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
              {listing.seller} will get back to you. In production this connects to messaging.
            </p>
            <button onClick={onClose} style={{ marginTop: 12 }}>Close</button>
          </div>
        ) : (
          <>
            <h2 style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 500 }}>
              Contact {listing.seller}
            </h2>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 14 }}>
              Booking <strong style={{ color: "var(--color-text-primary)" }}>{kg} kg</strong> · 
              Total <strong style={{ color: "var(--color-text-primary)", fontFamily: "'DM Mono', monospace" }}> ${kg * listing.price_per_kg}</strong>
            </div>
            <textarea value={msg} onChange={e => setMsg(e.target.value)}
              style={{ width: "100%", minHeight: 100, marginBottom: 14, resize: "vertical" }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={onClose}>Cancel</button>
              <button onClick={() => setSent(true)} style={{
                background: "#185FA5", color: "#fff", border: "none",
                borderRadius: "var(--border-radius-md)", padding: "7px 18px",
                fontWeight: 500, cursor: "pointer",
              }}>Send request</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function KiloShare() {
  const [listings, setListings] = useState(SEED_LISTINGS);
  const [filterRoute, setFilterRoute] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [minKg, setMinKg] = useState("");
  const [view, setView] = useState("browse"); // browse | post
  const [contact, setContact] = useState(null); // { listing, kg }

  const filtered = listings.filter(l => {
    if (filterRoute !== "all" && l.route !== filterRoute) return false;
    if (filterDate && l.date < filterDate) return false;
    if (minKg && l.kilos < +minKg) return false;
    return true;
  });

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", maxWidth: 720, margin: "0 auto", padding: "0 0 3rem" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.25rem 0 1rem",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        marginBottom: "1.5rem",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)", fontFamily: "'DM Mono', monospace" }}>
              KiloShare
            </span>
            <Badge type="info">🇨🇲 ↔ 🇷🇺</Badge>
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>
            Buy & sell unused luggage allowance between Cameroon and Russia
          </div>
        </div>
        <button onClick={() => setView(view === "post" ? "browse" : "post")} style={{
          background: view === "post" ? "transparent" : "#185FA5",
          color: view === "post" ? "var(--color-text-primary)" : "#fff",
          border: view === "post" ? "0.5px solid var(--color-border-secondary)" : "none",
          borderRadius: "var(--border-radius-md)",
          padding: "8px 16px", fontWeight: 500, cursor: "pointer", fontSize: 14,
        }}>
          {view === "post" ? "← Browse" : "+ Post kilos"}
        </button>
      </div>

      {/* Post form */}
      {view === "post" && (
        <div style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)", padding: "1.5rem", marginBottom: "1.5rem",
        }}>
          <PostForm
            onPost={l => { setListings(ls => [l, ...ls]); setView("browse"); }}
            onClose={() => setView("browse")}
          />
        </div>
      )}

      {/* Contact modal */}
      {contact && (
        <div style={{ marginBottom: "1.5rem" }}>
          <ContactModal listing={contact.listing} kg={contact.kg} onClose={() => setContact(null)} />
        </div>
      )}

      {/* Filters */}
      {view === "browse" && (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "1.25rem", alignItems: "center" }}>
            <select value={filterRoute} onChange={e => setFilterRoute(e.target.value)}>
              <option value="all">All routes</option>
              {ROUTES.map(r => <option key={r.id} value={r.id}>{r.flag_from} → {r.flag_to}</option>)}
            </select>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              title="From date" style={{ width: 150 }} />
            <input type="number" min={1} placeholder="Min kg" value={minKg}
              onChange={e => setMinKg(e.target.value)} style={{ width: 90 }} />
            {(filterRoute !== "all" || filterDate || minKg) && (
              <button onClick={() => { setFilterRoute("all"); setFilterDate(""); setMinKg(""); }}
                style={{ fontSize: 12 }}>Clear filters</button>
            )}
            <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--color-text-secondary)" }}>
              {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Stats bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: "1.5rem" }}>
            {[
              { label: "Active listings", value: listings.length },
              { label: "Avg price / kg", value: "$" + (listings.reduce((a, l) => a + +l.price_per_kg, 0) / listings.length).toFixed(0) },
              { label: "Total kg available", value: listings.reduce((a, l) => a + +l.kilos, 0) + " kg" },
            ].map(s => (
              <div key={s.label} style={{
                background: "var(--color-background-secondary)",
                borderRadius: "var(--border-radius-md)", padding: "12px 16px",
              }}>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 500, fontFamily: "'DM Mono', monospace", color: "var(--color-text-primary)" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Listings */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-text-secondary)", fontSize: 14 }}>
                No listings match your filters.
              </div>
            ) : (
              filtered.map(l => (
                <ListingCard key={l.id} listing={l} onContact={(listing, kg) => setContact({ listing, kg })} />
              ))
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ marginTop: "2.5rem", paddingTop: "1rem", borderTop: "0.5px solid var(--color-border-tertiary)", fontSize: 12, color: "var(--color-text-secondary)", display: "flex", justifyContent: "space-between" }}>
        <span>KiloShare MVP · Cameroon ↔ Russia</span>
        <span>All transactions at users' own agreement</span>
      </div>
    </div>
  );
}