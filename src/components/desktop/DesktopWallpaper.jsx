import { memo, useId } from 'react';

const DesktopWallpaper = () => {
  const id = useId();
  const paint = (name) => `url(#${id}-${name})`;

  return (
    <svg
      className="desktop-wallpaper"
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x2="0.8" y2="1">
          <stop stopColor="var(--wallpaper-shadow)" />
          <stop offset="0.52" stopColor="var(--wallpaper-primary)" />
          <stop offset="1" stopColor="var(--wallpaper-secondary)" />
        </linearGradient>
        <radialGradient id={`${id}-aura`} cx="0.5" cy="0.55" r="0.62">
          <stop stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.22" stopColor="var(--wallpaper-primary)" stopOpacity="0.3" />
          <stop offset="1" stopColor="var(--wallpaper-primary)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-bloom`} cx="0.22" cy="0.88" r="0.65">
          <stop stopColor="#f4fff5" stopOpacity="0.9" />
          <stop offset="0.2" stopColor="var(--wallpaper-secondary)" stopOpacity="0.7" />
          <stop offset="1" stopColor="var(--wallpaper-secondary)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-shade`} cx="0.49" cy="0.58" r="0.74">
          <stop offset="0.2" stopColor="#020c1c" stopOpacity="0" />
          <stop offset="0.72" stopColor="#020c1c" stopOpacity="0.28" />
          <stop offset="1" stopColor="#020c1c" stopOpacity="0.86" />
        </radialGradient>
        <linearGradient id={`${id}-ribbon`} x1="0" y1="1" x2="0.9" y2="0">
          <stop stopColor="var(--wallpaper-secondary)" stopOpacity="0.05" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.62" stopColor="var(--wallpaper-secondary)" stopOpacity="0.42" />
          <stop offset="1" stopColor="var(--wallpaper-primary)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-filament`} x1="0" y1="1" x2="1" y2="0">
          <stop stopColor="#fff" stopOpacity="0" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0.68" />
          <stop offset="0.64" stopColor="var(--wallpaper-secondary)" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-halo`}>
          <stop stopColor="#fff" stopOpacity="0.38" />
          <stop offset="0.35" stopColor="var(--wallpaper-secondary)" stopOpacity="0.18" />
          <stop offset="1" stopColor="var(--wallpaper-primary)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-primary-pane`} x1="0" y1="0" x2="0.85" y2="1">
          <stop stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.26" stopColor="var(--wallpaper-primary)" />
          <stop offset="0.74" stopColor="var(--wallpaper-primary)" stopOpacity="0.72" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${id}-secondary-pane`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff" stopOpacity="0.85" />
          <stop offset="0.35" stopColor="var(--wallpaper-secondary)" />
          <stop offset="0.8" stopColor="var(--wallpaper-secondary)" stopOpacity="0.78" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.72" />
        </linearGradient>
      </defs>

      <path fill={paint('sky')} d="M0 0h1600v1000H0z" />
      <path fill={paint('aura')} d="M0 0h1600v1000H0z" />
      <path fill={paint('bloom')} d="M0 0h1600v1000H0z" />
      <path className="desktop-wallpaper-shade" fill={paint('shade')} d="M0 0h1600v1000H0z" />

      {/* Broad translucent ribbons and fine edges evoke the Aero light trails. */}
      <g fill={paint('ribbon')}>
        <path d="M-180 1030C270 960 595 797 831 558S1170 140 1450-110C1178 265 1038 554 808 742S285 1036-180 1110Z" />
        <path d="M-100 880C287 974 643 898 960 740S1454 411 1720 489C1390 524 1209 790 910 874S310 1014-100 923Z" opacity="0.68" />
        <path d="M1700 180C1347 219 1144 421 1003 616S657 914 247 1000C640 963 888 848 1046 654S1370 304 1700 283Z" opacity="0.38" />
      </g>
      <g fill="none" stroke={paint('filament')} strokeLinecap="round">
        <path d="M-160 1040C299 947 617 777 850 546S1179 132 1470-100" strokeWidth="2" />
        <path d="M-90 886C304 970 669 882 980 726S1457 416 1700 491" strokeWidth="1.4" />
        <path d="M130 1040C557 931 815 802 1018 574S1371 223 1670 216" strokeWidth="1" opacity="0.52" />
        <path d="M-80 949C313 902 497 756 616 600S717 309 873 145" strokeWidth="1" opacity="0.4" />
      </g>

      {/* The four glass panes use the same two live colors as the picker. */}
      <ellipse cx="790" cy="476" rx="305" ry="285" fill={paint('halo')} />
      <g transform="rotate(-7 790 470)" stroke="#fff" strokeOpacity="0.42" strokeWidth="1.2">
        <path fill={paint('primary-pane')} d="M687 366C723 347 761 350 798 365L782 455C747 440 712 436 675 454Z" />
        <path fill={paint('secondary-pane')} d="M812 371C848 386 881 390 916 371L901 459C866 478 833 474 797 460Z" />
        <path fill={paint('secondary-pane')} d="M672 469C707 451 744 454 780 470L764 561C728 545 693 542 656 560Z" />
        <path fill={paint('primary-pane')} d="M795 475C830 489 865 493 899 475L883 566C848 584 814 580 779 566Z" />
      </g>

      <g fill="#fff">
        <circle cx="339" cy="814" r="2.4" opacity="0.68" />
        <circle cx="458" cy="775" r="1.5" opacity="0.55" />
        <circle cx="548" cy="837" r="2" opacity="0.5" />
        <circle cx="609" cy="719" r="1.4" opacity="0.7" />
        <circle cx="1090" cy="385" r="1.6" opacity="0.5" />
        <circle cx="1159" cy="284" r="1.1" opacity="0.42" />
        <path d="m414 842 2-12 2 12 12 2-12 2-2 12-2-12-12-2Z" opacity="0.62" />
        <path d="m997 610 1.3-9 1.3 9 9 1.3-9 1.3-1.3 9-1.3-9-9-1.3Z" opacity="0.48" />
      </g>
    </svg>
  );
};

export default memo(DesktopWallpaper);
