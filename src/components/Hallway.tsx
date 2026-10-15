const LOCKER_COLORS = [
  'orange',
  'orange',
  'teal',
  'orange',
  'mustard',
  'orange',
  'teal',
  'orange',
  'orange',
  'mustard',
  'teal',
  'orange',
  'orange',
  'teal',
];

function Locker({ n, color }: { n: number; color: string }) {
  return (
    <div className={`hk-locker hk-${color}`}>
      <div className="hk-vents" />
      <div className="hk-num">{n}</div>
      <div className="hk-dial" />
      <div className="hk-slot" />
    </div>
  );
}

export function Hallway() {
  return (
    <div className="hallway" aria-hidden="true">
      <div className="hk-ceiling">
        <span className="hk-tube" />
        <span className="hk-tube" />
        <span className="hk-tube" />
        <span className="hk-tube" />
      </div>

      <div className="hk-wall">
        <div className="hk-banner">HOMECOMING '95 · GO WILDCATS · YOU GOTTA BE THERE</div>

        <div className="hk-art">
          <div className="hk-squiggle" />
          <div className="hk-tri hk-tri-pink" />
          <div className="hk-tri hk-tri-teal" />
          <div className="hk-dots" />
        </div>

        <div className="hk-posters">
          <div className="hk-poster hk-smiley">
            <span className="hk-face">☺</span>
            <span>HAVE A NICE DAY</span>
          </div>
          <div className="hk-poster hk-mix">
            <span className="hk-tape" />
            <span>MIXTAPE</span>
            <span>VOL. 4</span>
          </div>
          <div className="hk-poster hk-pass">
            <span>HALL</span>
            <span>PASS</span>
          </div>
          <div className="hk-poster hk-class">
            <span>CLASS</span>
            <span>OF 96</span>
          </div>
        </div>
      </div>

      <div className="hk-lockers">
        {LOCKER_COLORS.map((color, i) => (
          <Locker key={i} n={214 + i} color={color} />
        ))}
      </div>

      <div className="hk-floor">
        <div className="hk-shine" />
      </div>
    </div>
  );
}
