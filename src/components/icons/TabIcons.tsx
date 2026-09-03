import { Circle, Line, Path, Rect, Svg } from "react-native-svg";

// Minimal, hand-drawn stroke icons for the floating tab bar (app/(tabs)/_layout.tsx)
// — deliberately not a generic icon-font set (@expo/vector-icons etc.):
// this app's whole visual identity is bespoke line/shape work (see
// GrainOverlay, MonumentalImage), so the tab icons follow the same
// approach instead of pulling in an off-the-shelf glyph style. Every icon
// shares the same 24x24 viewBox, ~1.8 stroke weight, and round caps/joins
// so they read as one consistent set regardless of the active design theme
// (they're always just tinted via `color`, never themed individually).

export type TabIconProps = { color: string; size?: number };

const STROKE_WIDTH = 1.8;

export function DashboardIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5 12 3l9 7.5"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function WorkoutsIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="4.5" y1="12" x2="19.5" y2="12" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
      <Rect x="1.5" y="9" width="3" height="6" rx="1" stroke={color} strokeWidth={STROKE_WIDTH} />
      <Rect x="19.5" y="9" width="3" height="6" rx="1" stroke={color} strokeWidth={STROKE_WIDTH} />
      <Rect x="5.5" y="6.5" width="2.5" height="11" rx="1" stroke={color} strokeWidth={STROKE_WIDTH} />
      <Rect x="16" y="6.5" width="2.5" height="11" rx="1" stroke={color} strokeWidth={STROKE_WIDTH} />
    </Svg>
  );
}

export function NutritionIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* fork */}
      <Path
        d="M6.5 3v6a1.5 1.5 0 0 0 3 0V3M8 3v6M9.5 3v6M8 9v12"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* knife */}
      <Path
        d="M16.5 3c-1.4 0-2.5 1.6-2.5 4.5S15.1 12 16.5 12V21"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MetricsIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.5" y="13.5" width="4" height="7" rx="1" stroke={color} strokeWidth={STROKE_WIDTH} />
      <Rect x="10" y="8.5" width="4" height="12" rx="1" stroke={color} strokeWidth={STROKE_WIDTH} />
      <Rect x="16.5" y="3.5" width="4" height="17" rx="1" stroke={color} strokeWidth={STROKE_WIDTH} />
    </Svg>
  );
}

export function SettingsIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="4" y1="6" x2="20" y2="6" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
      <Circle cx="9" cy="6" r="2" stroke={color} strokeWidth={STROKE_WIDTH} fill="none" />
      <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
      <Circle cx="15" cy="12" r="2" stroke={color} strokeWidth={STROKE_WIDTH} fill="none" />
      <Line x1="4" y1="18" x2="20" y2="18" stroke={color} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
      <Circle cx="11" cy="18" r="2" stroke={color} strokeWidth={STROKE_WIDTH} fill="none" />
    </Svg>
  );
}
