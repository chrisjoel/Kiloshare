import { useState, useEffect, useCallback } from "react";

const CITIES = {
  Cameroon: ["Douala", "Yaoundé", "Bafoussam", "Garoua", "Bamenda"],
  Russia: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan"],
};
const ROUTES = {
  "cmr-rus": { from: "Cameroon", to: "Russia", ff: "🇨🇲", ft: "🇷🇺", label: "Cameroon → Russia" },
  "rus-cmr": { from: "Russia", to: "Cameroon", ff: "🇷🇺", ft: "🇨🇲", label: "Russia → Cameroon" },
};
const AVATAR_THEMES = [
  { bg: "#3b2a1a", color: "#ff9500" },
  { bg: "#1a3b2f", color: "#34d399" },
  { bg: "#1a2a3b", color: "#60a5fa" },
  { bg: "#2a1a3b", color: "#c084fc" },
  { bg: "#3b1a1a", color: "#f87171" },
];
const SEED = [
  { id: 1, seller: "Amara K.", av: "AK", route: "cmr-rus", cf: "Douala", ct: "Moscow", date: "2025-06-15", kilos: 8, ppkg: 12, flight: "AF 700 → SU 123", verified: true, note: "Direct via Paris. Food & personal items OK." },
  { id: 2, seller: "Nikolai V.", av: "NV", route: "rus-cmr", cf: "Moscow", ct: "Yaoundé", date: "2025-06-20", kilos: 15, ppkg: 10, flight: "SU 265 → AF 702", verified: true, note: "Electronics & documents OK. No liquids." },
  { id: 3, seller: "Fatou N.", av: "FN", route: "cmr-rus", cf: "Yaoundé", ct: "Saint Petersburg", date: "2025-07-02", kilos: 5, ppkg: 14, flight: "ET 512 → SU 050", verified: false, note: "Small parcels preferred. Contact me first." },
  { id: 4, seller: "Ivan M.", av: "IM", route: "rus-cmr", cf: "Saint Petersburg", ct: "Douala", date: "2025-07-10", kilos: 20, ppkg: 9, flight: "SU 034 → KQ 201", verified: true, note: "Flexible on content. Regular traveller." },
];

const LIMITS = { name: 80, flight: 40, note: 500, kilos: 100, price: 9999 };

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function sanitizeText(value, maxLen) {
  return String(value ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

function parseBoundedInt(value, min, max) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="9" fill="var(--ks-accent)" />
      <path d="M9 17L14 11L18 15L23 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Avatar({ initials, id, size = 46 }) {
  const t = AVATAR_THEMES[id % AVATAR_THEMES.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size > 40 ? 14 : "50%",
        background: t.bg,
        color: t.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size > 40 ? 14 : 11,
        flexShrink: 0,
        fontFamily: "var(--ks-mono)",
      }}
    >
      {initials}
    </div>
  );
}

function Nav({ onPost, view, theme, onToggleTheme, onBrowse }) {
  return (
    <header className="ks-nav">
      <div className="ks-nav-inner">
        <button type="button" className="ks-logo" onClick={() => scrollToId("top")} aria-label="KiloShare home">
          <LogoMark />
          <span className="ks-logo-text">
            Kilo<span>Share</span>
          </span>
        </button>
        <div className="ks-nav-links">
          <button type="button" className="ks-nav-link" onClick={() => scrollToId("how-it-works")}>
            How it works
          </button>
          <button type="button" className="ks-nav-link" onClick={() => scrollToId("testimonials")}>
            Testimonials
          </button>
          <button type="button" className="ks-nav-link" onClick={onBrowse}>
            Browse trips
          </button>
        </div>
        <div className="ks-nav-actions">
          <button type="button" className="ks-icon-btn" onClick={onToggleTheme} aria-label="Toggle light or dark theme">
            {theme === "dark" ? "☀" : "☾"}
          </button>
          {view === "post" ? (
            <button type="button" className="ks-btn-ghost" onClick={onPost}>
              Back to listings
            </button>
          ) : (
            <button type="button" className="ks-btn-gradient" onClick={onPost}>
              Get started
              <span className="ks-btn-gradient-icon">→</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function HeroStage({ onBrowse, onGetStarted, listings }) {
  const featured = listings[0];
  const userCount = Math.max(240, listings.length * 62);

  return (
    <section className="ks-hero-stage" id="top">
      <div className="ks-hero-glow" aria-hidden />
      <div className="ks-hero-inner">
        <h1 className="ks-hero-title">
          A Traveler’s <em>Extra Space</em> Filled with Love
        </h1>
        <p className="ks-hero-sub">
          Cameroon–Russia&apos;s trusted luggage-sharing network where verified travellers help move your parcels
          safely, quickly, and affordably.
        </p>
        <div className="ks-hero-cta">
          <button type="button" className="ks-btn-gradient" onClick={onGetStarted}>
            Get started
            <span className="ks-btn-gradient-icon">→</span>
          </button>
          <button type="button" className="ks-btn-ghost" onClick={onBrowse}>
            Browse trips
          </button>
        </div>
        <div className="ks-social-proof">
          <div className="ks-avatars" aria-hidden>
            {listings.slice(0, 4).map((l, i) => (
              <div key={l.id} className="ks-avatar-pile" style={{ zIndex: 4 - i, background: AVATAR_THEMES[l.id % 5].bg, color: AVATAR_THEMES[l.id % 5].color }}>
                {l.av}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 14, color: "var(--ks-muted)", fontWeight: 500 }}>
            Join <strong style={{ color: "var(--ks-ink)" }}>{userCount}+</strong> travellers on KiloShare
          </span>
        </div>
      </div>
      {featured && (
        <div className="ks-float-card" aria-hidden>
          <div className="ks-float-card-placeholder">📦</div>
          <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: "var(--ks-ink)" }}>
            {featured.cf} → {featured.ct}
          </div>
          <div style={{ fontSize: 11, color: "var(--ks-muted)", marginTop: 4 }}>
            {featured.kilos} kg · ${featured.ppkg}/kg
          </div>
          <div style={{ fontSize: 11, color: "var(--ks-accent)", marginTop: 8, fontWeight: 600 }}>Book space →</div>
        </div>
      )}
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { title: "List or search", body: "Travellers post spare kilos; senders filter by route, date, and capacity." },
    { title: "Match & message", body: "Contact verified flyers directly. Agree on contents, handoff, and price." },
    { title: "Fly & deliver", body: "Meet at the airport or city handoff. Track trust via reviews (coming soon)." },
  ];
  return (
    <section className="ks-section" id="how-it-works">
      <h2 className="ks-section-title">How it works</h2>
      <p className="ks-section-sub">Three steps from unused allowance to delivered parcel — no middleman required.</p>
      <div className="ks-steps">
        {steps.map((s, i) => (
          <div key={s.title} className="ks-step">
            <div className="ks-step-num">{i + 1}</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700 }}>{s.title}</h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--ks-muted)", lineHeight: 1.6 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    { name: "Amara K.", text: "Sold 8 kg on my Douala–Moscow trip. Paid for my airport transfer and then some." },
    { name: "Nikolai V.", text: "Regular on this route — KiloShare makes it easy to find serious senders, not random DMs." },
    { name: "Fatou N.", text: "Small parcels only for me, but the booking flow is clear and I set my own rules." },
  ];
  return (
    <section className="ks-section" id="testimonials" style={{ paddingTop: 0 }}>
      <h2 className="ks-section-title">Testimonials</h2>
      <p className="ks-section-sub">Early travellers on the Cameroon ↔ Russia corridor.</p>
      <div className="ks-testimonials">
        {quotes.map((q) => (
          <blockquote key={q.name} className="ks-quote">
            &ldquo;{q.text}&rdquo;
            <footer style={{ marginTop: 12, fontWeight: 700, color: "var(--ks-ink)", fontSize: 13 }}>— {q.name}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

function SearchDock({ filters, onChange, resultCount }) {
  const hasFilters = filters.route !== "all" || filters.date || filters.kg;
  return (
    <div className="ks-search-dock-wrap">
      <div className="ks-search-dock">
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="ks-label">ROUTE</span>
          <select className="ks-field" value={filters.route} onChange={(e) => onChange("route", e.target.value)}>
            <option value="all">All routes</option>
            <option value="cmr-rus">🇨🇲 → 🇷🇺 Cameroon to Russia</option>
            <option value="rus-cmr">🇷🇺 → 🇨🇲 Russia to Cameroon</option>
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="ks-label">FROM DATE</span>
          <input className="ks-field" type="date" value={filters.date} onChange={(e) => onChange("date", e.target.value)} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="ks-label">MIN CAPACITY</span>
          <input
            className="ks-field"
            type="number"
            min={1}
            max={LIMITS.kilos}
            placeholder="Any kg"
            value={filters.kg}
            onChange={(e) => onChange("kg", e.target.value)}
          />
        </label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {hasFilters && (
            <button
              type="button"
              className="ks-btn-ghost"
              style={{ flex: 1, padding: "10px 12px", borderRadius: "var(--ks-radius-sm)" }}
              onClick={() => {
                onChange("route", "all");
                onChange("date", "");
                onChange("kg", "");
              }}
            >
              Reset
            </button>
          )}
          <div
            style={{
              flex: hasFilters ? 1 : 2,
              textAlign: "center",
              padding: "10px 12px",
              borderRadius: "var(--ks-radius-sm)",
              background: "var(--ks-accent-soft)",
              color: "var(--ks-accent)",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {resultCount} trip{resultCount !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteLine({ listing }) {
  const r = ROUTES[listing.route];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        background: "var(--ks-bg-soft)",
        borderRadius: "var(--ks-radius-sm)",
        border: "1px solid var(--ks-border)",
      }}
    >
      <div>
        <div style={{ fontSize: 11, color: "var(--ks-muted-light)", fontWeight: 600, marginBottom: 2 }}>From</div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>
          {r.ff} {listing.cf}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 72 }}>
        <div
          style={{
            width: "100%",
            height: 2,
            background: "var(--ks-gradient)",
            borderRadius: 99,
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--ks-surface-solid)",
              border: "1px solid var(--ks-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
            }}
          >
            ✈
          </span>
        </div>
        <span style={{ fontSize: 10, color: "var(--ks-muted)", fontFamily: "var(--ks-mono)" }}>{listing.flight}</span>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 11, color: "var(--ks-muted-light)", fontWeight: 600, marginBottom: 2 }}>To</div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>
          {listing.ct} {r.ft}
        </div>
      </div>
    </div>
  );
}

function ListingCard({ listing: l, onContact }) {
  const [kg, setKg] = useState(1);

  return (
    <article className="ks-listing-card">
      <div style={{ padding: "1.35rem 1.35rem 1rem" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: "1rem" }}>
          <Avatar initials={l.av} id={l.id} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>{l.seller}</h3>
              {l.verified && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--ks-trust)",
                    background: "var(--ks-trust-soft)",
                    padding: "3px 8px",
                    borderRadius: 99,
                  }}
                >
                  Verified
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: "var(--ks-muted)" }}>
              {fmtDate(l.date)} · {ROUTES[l.route].label}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--ks-mono)", fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1 }}>
              ${l.ppkg}
            </div>
            <div style={{ fontSize: 11, color: "var(--ks-muted)", marginTop: 4, fontWeight: 600 }}>per kg</div>
          </div>
        </div>
        <RouteLine listing={l} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "1rem" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--ks-accent)",
              background: "var(--ks-accent-soft)",
              padding: "5px 10px",
              borderRadius: 99,
            }}
          >
            {l.kilos} kg available
          </span>
        </div>
        {l.note && (
          <p
            style={{
              margin: "0.75rem 0 0",
              fontSize: 13,
              lineHeight: 1.5,
              color: "var(--ks-muted)",
              borderLeft: "3px solid var(--ks-border-strong)",
              paddingLeft: 10,
            }}
          >
            {l.note}
          </p>
        )}
      </div>
      <div
        style={{
          borderTop: "1px solid var(--ks-border)",
          padding: "1rem 1.35rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
          background: "var(--ks-bg-soft)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ks-muted)" }}>Book</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StepBtn label="−" onClick={() => setKg((k) => Math.max(1, k - 1))} />
          <span style={{ minWidth: 32, textAlign: "center", fontFamily: "var(--ks-mono)", fontWeight: 600, fontSize: 15 }}>{kg}</span>
          <StepBtn label="+" onClick={() => setKg((k) => Math.min(l.kilos, k + 1))} />
        </div>
        <span style={{ flex: 1, textAlign: "center", fontSize: 14, color: "var(--ks-muted)", minWidth: 120 }}>
          Total <strong style={{ color: "var(--ks-ink)", fontFamily: "var(--ks-mono)" }}>${kg * l.ppkg}</strong>
        </span>
        <button
          type="button"
          className="ks-btn-gradient"
          style={{ marginLeft: "auto", padding: "10px 18px", fontSize: 13 }}
          onClick={() => onContact(l, kg)}
        >
          Contact
          <span className="ks-btn-gradient-icon" style={{ width: 24, height: 24, fontSize: 12 }}>
            →
          </span>
        </button>
      </div>
    </article>
  );
}

function StepBtn({ label, onClick }) {
  const [active, setActive] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onMouseLeave={() => setActive(false)}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: `1px solid ${active ? "var(--ks-accent)" : "var(--ks-border-strong)"}`,
        background: active ? "var(--ks-accent)" : "var(--ks-surface-solid)",
        color: active ? "#fff" : "var(--ks-ink)",
        cursor: "pointer",
        fontSize: 18,
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {label}
    </button>
  );
}

function PostForm({ onPost, onClose }) {
  const [form, setForm] = useState({
    name: "",
    route: "cmr-rus",
    cf: "",
    ct: "",
    date: "",
    kg: "",
    price: "",
    flight: "",
    note: "",
  });
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const r = ROUTES[form.route];

  const submit = () => {
    const name = sanitizeText(form.name, LIMITS.name);
    const cf = sanitizeText(form.cf, 60);
    const ct = sanitizeText(form.ct, 60);
    const kilos = parseBoundedInt(form.kg, 1, LIMITS.kilos);
    const price = parseBoundedInt(form.price, 1, LIMITS.price);
    const flight = sanitizeText(form.flight, LIMITS.flight);
    const note = sanitizeText(form.note, LIMITS.note);
    const date = sanitizeText(form.date, 10);

    if (!name || !cf || !ct || !date || kilos === null || price === null) {
      alert("Please fill all required fields with valid values.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      alert("Please enter a valid travel date.");
      return;
    }

    onPost({
      id: Date.now(),
      seller: name,
      av: name.slice(0, 2).toUpperCase(),
      route: form.route === "rus-cmr" ? "rus-cmr" : "cmr-rus",
      cf,
      ct,
      date,
      kilos,
      ppkg: price,
      flight,
      note,
      verified: false,
    });
    setDone(true);
  };

  return (
    <div className="ks-listing-card" style={{ marginBottom: "1.5rem" }}>
      <div style={{ padding: "1.35rem 1.5rem", borderBottom: "1px solid var(--ks-border)", display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em" }}>List your kilos</h2>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--ks-muted)" }}>About 2 minutes — buyers reach out directly.</p>
        </div>
        <button type="button" className="ks-icon-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div style={{ padding: "1.5rem" }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ width: 56, height: 56, margin: "0 auto 1rem", borderRadius: "50%", background: "var(--ks-trust-soft)", color: "var(--ks-trust)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700 }}>
              ✓
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Listing published</div>
            <button type="button" className="ks-btn-gradient" onClick={onClose}>
              View listings
              <span className="ks-btn-gradient-icon">→</span>
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 14 }}>
              {[
                ["Your name *", "name", "text", "e.g. Jean-Pierre K.", LIMITS.name],
                ["Route *", "route", "select"],
                ["From city *", "cf", "city-from"],
                ["To city *", "ct", "city-to"],
                ["Travel date *", "date", "date"],
                ["Flight number", "flight", "text", "e.g. AF 700", LIMITS.flight],
                ["Kilos available *", "kg", "number", "10", LIMITS.kilos],
                ["Price per kg (USD) *", "price", "number", "12", LIMITS.price],
              ].map(([label, key, type, placeholder, maxLen]) => (
                <label key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className="ks-label">{label.toUpperCase()}</span>
                  {type === "select" ? (
                    <select className="ks-field" value={form.route} onChange={(e) => set("route", e.target.value)}>
                      <option value="cmr-rus">🇨🇲 Cameroon → 🇷🇺 Russia</option>
                      <option value="rus-cmr">🇷🇺 Russia → 🇨🇲 Cameroon</option>
                    </select>
                  ) : type === "city-from" ? (
                    <select className="ks-field" value={form.cf} onChange={(e) => set("cf", e.target.value)}>
                      <option value="">Select city</option>
                      {(CITIES[r.from] || []).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : type === "city-to" ? (
                    <select className="ks-field" value={form.ct} onChange={(e) => set("ct", e.target.value)}>
                      <option value="">Select city</option>
                      {(CITIES[r.to] || []).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="ks-field"
                      type={type === "number" || type === "date" ? type : "text"}
                      placeholder={placeholder}
                      value={form[key]}
                      maxLength={type === "text" ? maxLen : undefined}
                      onChange={(e) => set(key, e.target.value)}
                      min={type === "number" ? 1 : undefined}
                      max={type === "number" ? maxLen : undefined}
                    />
                  )}
                </label>
              ))}
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
              <span className="ks-label">NOTE FOR BUYERS</span>
              <textarea
                className="ks-field"
                style={{ minHeight: 80, resize: "vertical" }}
                placeholder="What you accept, handoff details, restrictions…"
                value={form.note}
                maxLength={LIMITS.note}
                onChange={(e) => set("note", e.target.value)}
              />
            </label>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button type="button" className="ks-btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="ks-btn-gradient" onClick={submit}>
                Publish listing
                <span className="ks-btn-gradient-icon">→</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ContactModal({ listing: l, kg, onClose }) {
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState(
    `Hi ${l.seller.split(" ")[0]}, I'd like to book ${kg} kg on your ${l.cf} → ${l.ct} trip on ${fmtDate(l.date)}. Is this still available?`
  );

  return (
    <div className="ks-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="ks-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "1.25rem 1.35rem", background: "var(--ks-hero)", color: "#fff", display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>Contact {l.seller}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 6 }}>
              {kg} kg · ${kg * l.ppkg} · {l.cf} → {l.ct}
            </div>
          </div>
          <button type="button" className="ks-icon-btn" style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff" }} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div style={{ padding: "1.35rem" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "0.5rem 0 0.25rem" }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Request sent</div>
              <p style={{ fontSize: 14, color: "var(--ks-muted)", marginBottom: 20 }}>{l.seller} will reply when they can.</p>
              <button type="button" className="ks-btn-gradient" onClick={onClose}>
                Done
                <span className="ks-btn-gradient-icon">→</span>
              </button>
            </div>
          ) : (
            <>
              <textarea
                className="ks-field"
                value={msg}
                maxLength={2000}
                onChange={(e) => setMsg(sanitizeText(e.target.value, 2000))}
                style={{ minHeight: 120, resize: "vertical", marginBottom: 14 }}
              />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="ks-btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="ks-btn-gradient" onClick={() => setSent(true)}>
                  Send request
                  <span className="ks-btn-gradient-icon">→</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const THEME_KEY = "kiloshare-theme";

export default function KiloShare() {
  const [listings, setListings] = useState(SEED);
  const [view, setView] = useState("browse");
  const [filters, setFilters] = useState({ route: "all", date: "", kg: "" });
  const [contact, setContact] = useState(null);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  const filtered = listings.filter((l) => {
    if (filters.route !== "all" && l.route !== filters.route) return false;
    if (filters.date && l.date < filters.date) return false;
    if (filters.kg && l.kilos < +filters.kg) return false;
    return true;
  });

  const goMarketplace = useCallback(() => {
    setView("browse");
    setTimeout(() => scrollToId("marketplace"), 50);
  }, []);

  const getStarted = useCallback(() => {
    setView("post");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const togglePost = () => setView((v) => (v === "post" ? "browse" : "post"));

  return (
    <div className="ks-page">
      <Nav
        onPost={togglePost}
        view={view}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        onBrowse={goMarketplace}
      />

      {view === "browse" && (
        <>
          <HeroStage listings={listings} onBrowse={goMarketplace} onGetStarted={getStarted} />
          <HowItWorks />
          <Testimonials />
          <SearchDock filters={filters} onChange={setFilter} resultCount={filtered.length} />
        </>
      )}

      <main className="ks-section" id="marketplace" style={{ paddingTop: view === "browse" ? "2rem" : "2rem", maxWidth: 1140 }}>
        {view === "post" && (
          <PostForm
            onPost={(l) => {
              setListings((ls) => [l, ...ls]);
              setView("browse");
              setTimeout(() => scrollToId("marketplace"), 50);
            }}
            onClose={() => setView("browse")}
          />
        )}

        {view === "browse" && (
          <>
            <h2 className="ks-section-title" style={{ textAlign: "left", fontSize: "1.35rem", marginBottom: "1.25rem" }}>
              Available trips
            </h2>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3.5rem 1rem", background: "var(--ks-surface)", borderRadius: "var(--ks-radius-lg)", border: "1px solid var(--ks-border)", color: "var(--ks-muted)" }}>
                <p style={{ margin: 0, fontSize: 15 }}>No trips match these filters. Try resetting or list your own kilos.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {filtered.map((l) => (
                  <ListingCard key={l.id} listing={l} onContact={(listing, kg) => setContact({ listing, kg })} />
                ))}
              </div>
            )}
          </>
        )}

        <footer
          style={{
            marginTop: "2.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--ks-border-strong)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 8,
            fontSize: 12,
            color: "var(--ks-muted)",
          }}
        >
          <span>KiloShare · Cameroon ↔ Russia</span>
          <span>Peer-to-peer — agree terms directly with your traveller</span>
        </footer>
      </main>

      {contact && <ContactModal listing={contact.listing} kg={contact.kg} onClose={() => setContact(null)} />}
    </div>
  );
}
