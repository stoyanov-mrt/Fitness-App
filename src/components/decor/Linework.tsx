import { View, type DimensionValue } from "react-native";
import { Circle, Line, Path, Svg } from "react-native-svg";

import { useDesignTheme } from "@/theme/useDesignTheme";

const SIZE_W = 400;
const SIZE_H = 260;

/**
 * Japanese Minimal's monumental image: an original, single-weight line-art
 * mountain ridge (three overlapping contours for depth) over a horizon rule
 * and a single accent mark — an abstract, processed stand-in for a
 * landscape photograph, not a reproduction of any real artwork.
 */
export function Linework({ width = "100%" }: { width?: DimensionValue }) {
  const { tokens } = useDesignTheme();

  return (
    <View style={{ width, aspectRatio: SIZE_W / SIZE_H }}>
      <Svg viewBox={`0 0 ${SIZE_W} ${SIZE_H}`} width="100%" height="100%">
        {/* far ridge */}
        <Path
          d="M0,150 C50,120 90,138 130,110 C170,82 200,100 235,88 C270,76 300,96 340,80 C365,70 385,78 400,72"
          stroke={tokens.swatch.ink}
          strokeOpacity={0.32}
          strokeWidth={1.5}
          fill="none"
        />
        {/* mid ridge */}
        <Path
          d="M0,185 C45,160 80,175 115,150 C150,125 185,168 225,140 C260,116 300,150 345,124 C368,111 385,120 400,112"
          stroke={tokens.swatch.ink}
          strokeOpacity={0.55}
          strokeWidth={1.5}
          fill="none"
        />
        {/* near ridge */}
        <Path
          d="M0,220 C55,190 95,214 140,182 C180,153 210,200 255,168 C295,140 330,178 370,150 C382,142 392,146 400,140"
          stroke={tokens.swatch.ink}
          strokeWidth={2}
          fill="none"
        />
        {/* horizon */}
        <Line
          x1={0}
          y1={230}
          x2={SIZE_W}
          y2={230}
          stroke={tokens.swatch.ink}
          strokeOpacity={0.25}
          strokeWidth={1}
        />
        {/* sun mark — the single warm accent */}
        <Circle cx={330} cy={64} r={14} stroke={tokens.swatch.accent} strokeWidth={2} fill="none" />
      </Svg>
    </View>
  );
}
