import { useId, useMemo } from "react";
import { StyleSheet } from "react-native";
import { Circle, Defs, Pattern, Rect, Svg } from "react-native-svg";

import { useDesignTheme } from "@/theme/useDesignTheme";

import { seededRandom } from "./seededRandom";

const TILE = 64;
const DOT_COUNT = 70;

/**
 * Full-bleed procedural grain texture — a seeded, tiled field of dots at low
 * opacity over whatever sits behind it. Dither Mono uses it heavily (the
 * "pixel-dithered" ground texture); Japanese Minimal uses a much fainter
 * pass of it for a paper-fiber feel. Pure SVG, no image assets, so it
 * renders identically on iOS/Android/web.
 */
export function GrainOverlay({ opacity }: { opacity?: number }) {
  const { theme, tokens } = useDesignTheme();
  const patternId = useId().replace(/[^a-zA-Z0-9]/g, "");

  const dots = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: DOT_COUNT }, () => ({
      x: rand() * TILE,
      y: rand() * TILE,
      r: rand() * (theme === "dither" ? 1.1 : 0.55) + 0.2,
      o: rand() * 0.6 + 0.25,
    }));
  }, [theme]);

  const baseOpacity = opacity ?? (theme === "dither" ? 0.1 : 0.035);

  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <Pattern id={patternId} patternUnits="userSpaceOnUse" width={TILE} height={TILE}>
          {dots.map((d, i) => (
            <Circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill={tokens.swatch.ink}
              opacity={d.o * baseOpacity}
            />
          ))}
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${patternId})`} />
    </Svg>
  );
}
