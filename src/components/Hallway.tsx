function Locker({
  tone,
  plate,
  ajar = false,
}: {
  tone: 'cream' | 'teal' | 'steel';
  plate?: string;
  ajar?: boolean;
}) {
  return (
    <div className={`lk-bay${ajar ? ' lk-ajar' : ''}`}>
      {ajar ? <div className="lk-cavity" /> : null}
      <div className={`lk-door lk-${tone}`}>
        <div className="lk-vents lk-vents-top">
          <span />
          <span />
          <span />
        </div>
        {plate ? <div className="lk-plate">{plate}</div> : null}
        <div className="lk-wear" />
        <div className="lk-recess">
          <div className="lk-well">
            <span className="lk-latch" />
            <span className="lk-pit" />
          </div>
        </div>
        <div className="lk-vents lk-vents-bot">
          <span />
          <span />
          <span />
        </div>
        <div className="lk-hinge" />
      </div>
    </div>
  );
}

export function Hallway() {
  return (
    <div className="hallway" aria-hidden="true">
      <div className="lk-backdrop">
        <div className="lk-bank">
          <Locker tone="cream" ajar />
          <Locker tone="teal" plate="115" />
          <Locker tone="steel" plate="117" />
        </div>
      </div>
    </div>
  );
}
