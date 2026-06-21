import { useMemo } from 'react';
import DualClock from '../DualClock';
import ColorSwitcher from '../ColorSwitcher';
import SystemStats from '../SystemStats';

const useDesktopWidgets = ({
  handleStatsExpandedChange,
  isStatsExpanded,
  setThemeColors,
  theme,
  themeColors,
}) => useMemo(() => [
  {
    id: 'clock',
    className: 'widget-clock',
    info: 'Dual clock showing your local time and a second timezone. Times update every 30 seconds using your browser\'s locale settings.',
    content: <DualClock />,
  },
  {
    id: 'stats',
    className: 'widget-stats',
    info: 'Live system monitor. FPS is measured via requestAnimationFrame, heap memory uses the Chrome Performance API, CPU cores from navigator.hardwareConcurrency, and network speed fluctuates around your browser\'s reported downlink.',
    content: (
      <SystemStats
        isExpanded={isStatsExpanded}
        onExpandedChange={handleStatsExpandedChange}
      />
    ),
  },
  {
    id: 'colors',
    className: 'widget-colors',
    info: 'Theme color customizer. Pick any accent color using the color wheel - your selection is saved to localStorage and persists across visits.',
    content: (
      <ColorSwitcher
        theme={theme}
        colors={themeColors}
        onColorsChange={setThemeColors}
        wheelSize={72}
      />
    ),
  },
], [handleStatsExpandedChange, isStatsExpanded, setThemeColors, theme, themeColors]);

export default useDesktopWidgets;
