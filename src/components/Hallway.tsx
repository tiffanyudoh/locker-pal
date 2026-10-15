function Pencil({ className }: { className: string }) {
  return (
    <svg
      className={`hk-pencil ${className}`}
      viewBox="0 0 16 118"
      preserveAspectRatio="xMidYMin meet"
      aria-hidden="true"
    >
      <ellipse cx="8" cy="116" rx="5" ry="1.4" fill="rgba(40,24,12,0.22)" />
      <path
        d="M3.2 1.6 C3 0.6 13 0.6 12.8 1.6 L13.1 10.4 H2.9 Z"
        fill="#b57a7f"
      />
      <path d="M4.2 2.2 C6 1.4 10 1.5 11.6 3.1" fill="none" stroke="#e3b4b6" strokeWidth="0.55" />
      <rect x="2.4" y="9.6" width="11.2" height="9.2" fill="#c2bdb0" />
      <rect x="2.4" y="11.4" width="11.2" height="0.7" fill="#8a867c" />
      <rect x="2.4" y="14.8" width="11.2" height="0.7" fill="#8a867c" />
      <rect x="2.6" y="10.2" width="1.1" height="8" fill="#ece8de" opacity="0.55" />
      <rect x="2.6" y="18.4" width="3.6" height="67.2" fill="#8d6a0a" />
      <rect x="6.2" y="18.4" width="5.2" height="67.2" fill="#d2a31c" />
      <rect x="11.4" y="18.4" width="2.2" height="67.2" fill="#9a780e" />
      <line x1="6.2" y1="18.4" x2="6.2" y2="85.6" stroke="#6f5408" strokeWidth="0.35" />
      <line x1="11.4" y1="18.4" x2="11.4" y2="85.6" stroke="#7d6309" strokeWidth="0.35" />
      <rect x="7.2" y="22" width="0.9" height="58" fill="#f0d56a" opacity="0.28" />
      <text
        x="8"
        y="54"
        textAnchor="middle"
        fill="#6a5208"
        fontSize="5.2"
        fontFamily="Georgia, serif"
        opacity="0.55"
      >
        2
      </text>
      <rect x="2.7" y="84.8" width="10.6" height="2.2" fill="#c9a06e" />
      <polygon points="2.6,87 8,87 8,107" fill="#a67c4a" />
      <polygon points="8,87 13.4,87 8,107" fill="#e4c49a" />
      <polygon points="6.4,87 9.6,87 8,107" fill="#d2b07a" opacity="0.7" />
      <line x1="4.4" y1="88.5" x2="7.2" y2="104" stroke="#8a5a32" strokeWidth="0.28" opacity="0.45" />
      <line x1="11.2" y1="88.5" x2="8.8" y2="104" stroke="#b88958" strokeWidth="0.28" opacity="0.4" />
      <polygon points="6.6,104.2 9.4,104.2 8,116.4" fill="#2c2a26" />
      <polygon points="7.2,104.6 8.8,104.6 8,112.8" fill="#111" />
    </svg>
  );
}

function Locker({
  n,
  color,
  open = false,
  graffiti = false,
}: {
  n: number;
  color: string;
  open?: boolean;
  graffiti?: boolean;
}) {
  return (
    <div className={`hk-locker hk-${color}${open ? ' hk-open' : ''}`}>
      {open ? (
        <div className="hk-interior">
          <div className="hk-shelf" />
          <div className="hk-books">
            <span className="hk-book hk-book-pink" />
            <span className="hk-book hk-book-lime" />
            <span className="hk-book hk-book-purple" />
            <span className="hk-book hk-book-teal" />
          </div>
          <div className="hk-folder" />
          <div className="hk-spill">
            <div className="hk-paper hk-comp-nb">
              <span className="hk-nb-spine" />
              <span className="hk-nb-label">COMPOSITION</span>
            </div>
            <div className="hk-paper hk-legal">
              <span className="hk-paper-lines" />
              <span className="hk-chipboard" />
            </div>
            <div className="hk-paper hk-spiral">
              <span className="hk-coil" />
              <span className="hk-paper-lines" />
              <span className="hk-dogear" />
            </div>
            <div className="hk-paper hk-loose">
              <span className="hk-paper-lines" />
              <span className="hk-dogear" />
            </div>
            <Pencil className="hk-p1" />
            <Pencil className="hk-p2" />
          </div>
        </div>
      ) : null}
      <div className="hk-door">
        <div className="hk-vents" />
        <div className="hk-scratch" />
        {graffiti ? (
          <div className="hk-graffiti">
            <svg viewBox="0 0 90 78" aria-hidden="true">
              <path
                d="M45 72 C14 50 8 24 27 18 C38 14 45 28 45 28 C45 28 52 14 63 18 C82 24 76 50 45 72"
                fill="none"
                stroke="#5a1428"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M45 68 C18 49 14 26 29 21 C38 18 44 30 45 32 C46 30 52 18 61 21 C76 26 72 49 45 68"
                fill="none"
                stroke="#7a1c38"
                strokeWidth="1.1"
                opacity="0.55"
              />
              <text
                x="45"
                y="46"
                textAnchor="middle"
                fill="#4a1022"
                fontFamily="Permanent Marker, Comic Sans MS, cursive"
                fontSize="11"
                letterSpacing="0.4"
              >
                555-0196
              </text>
            </svg>
          </div>
        ) : null}
        <div className="hk-num">{n}</div>
        <div className="hk-hardware">
          <div className="hk-dial" />
          <div className="hk-handle" />
        </div>
        <div className="hk-slot" />
      </div>
    </div>
  );
}

export function Hallway() {
  return (
    <div className="hallway" aria-hidden="true">
      <div className="hk-ceiling">
        <div className="hk-tiles" />
        <div className="hk-lights">
          <span className="hk-fixture hk-near">
            <span className="hk-tube" />
          </span>
          <span className="hk-fixture">
            <span className="hk-tube" />
          </span>
          <span className="hk-fixture hk-far-light">
            <span className="hk-tube" />
          </span>
        </div>
      </div>

      <div className="hk-wall">
        <div className="hk-plaster" />
        <div className="hk-wainscot" />
        <div className="hk-rail" />
      </div>

      <div className="hk-hall">
        <div className="hk-hall-ceiling" />
        <div className="hk-hall-left" />
        <div className="hk-hall-right">
          <div className="hk-far-posters">
            <div className="hk-poster hk-spirit">
              <span>SPIRIT</span>
              <span>WEEK</span>
              <span className="hk-when">OCT 9–13</span>
            </div>
            <div className="hk-poster hk-yearbook">
              <span>YEARBOOK</span>
              <span className="hk-poster-year">'96</span>
              <span className="hk-when">DUE FRI 3:15</span>
            </div>
            <div className="hk-poster hk-rally">
              <span>PEP</span>
              <span>RALLY</span>
              <span className="hk-when">FRI 2:40 GYM</span>
            </div>
            <div className="hk-poster hk-dance">
              <span>FALL</span>
              <span>DANCE</span>
              <span className="hk-when">SAT 8PM</span>
            </div>
          </div>
          <div className="hk-banner">
            HOMECOMING '95
            <span className="hk-banner-when">OCT 21 · 7PM</span>
          </div>
        </div>
        <div className="hk-hall-floor" />
      </div>

      <div className="hk-closeup">
        <div className="hk-closeup-row">
          <Locker n={214} color="tan" graffiti />
          <Locker n={215} color="steel" />
          <Locker n={216} color="rust" open />
        </div>
        <div className="hk-bank-end" />
      </div>

      <div className="hk-floor">
        <div className="hk-floor-grid" />
        <div className="hk-shine" />
      </div>

      <div className="hk-glow" />
      <div className="hk-grain" />
    </div>
  );
}
