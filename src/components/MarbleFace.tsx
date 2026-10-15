type MarbleVariant = 'lid' | 'inner' | 'base';

/** Navy field with teal composition-book blotches. Yellow stays on labels only. */
export function MarbleFace({ variant }: { variant: MarbleVariant }) {
  const id = `marble-${variant}`;

  return (
    <div className={`marble marble-${variant}`} aria-hidden="true">
      <svg className="marble-svg" preserveAspectRatio="none">
        <defs>
          <filter
            id={`${id}-comp`}
            x="-8%"
            y="-8%"
            width="116%"
            height="116%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="turbulence"
              baseFrequency="0.16 0.2"
              numOctaves="3"
              seed="18"
              result="grain"
            />
            <feColorMatrix in="grain" type="luminanceToAlpha" result="alpha" />
            <feComponentTransfer in="alpha" result="mask">
              <feFuncA type="discrete" tableValues="0 0 0 1 0 0 0 1 0 0 1 0 0 0 1 0" />
            </feComponentTransfer>
            <feFlood flood-color="#2bb3a6" result="teal" />
            <feComposite in="teal" in2="mask" operator="in" result="speck" />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.28 0.32"
              numOctaves="2"
              seed="6"
              result="fine"
            />
            <feColorMatrix in="fine" type="luminanceToAlpha" result="fineA" />
            <feComponentTransfer in="fineA" result="fineMask">
              <feFuncA type="discrete" tableValues="0 0 0 1 0 0 0 1 0 0" />
            </feComponentTransfer>
            <feFlood flood-color="#1a8f86" result="teal2" />
            <feComposite in="teal2" in2="fineMask" operator="in" result="dust" />
            <feFlood flood-color="#121a32" result="navy" />
            <feComposite in="speck" in2="navy" operator="over" result="base" />
            <feComposite in="dust" in2="base" operator="over" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="#121a32" />
        <rect width="100%" height="100%" filter={`url(#${id}-comp)`} />
      </svg>
    </div>
  );
}
