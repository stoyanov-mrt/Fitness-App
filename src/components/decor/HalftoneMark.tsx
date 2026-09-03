import { useMemo } from "react";
import { View, type DimensionValue } from "react-native";
import { Circle, Svg } from "react-native-svg";

import { useDesignTheme } from "@/theme/useDesignTheme";

import { seededRandom } from "./seededRandom";

const SIZE = 320;
const GRID = 22;
const CELL = SIZE / GRID;

/**
 * Dither Mono's monumental image: a halftone dot-matrix target, built by
 * modulating dot radius with concentric sine rings around the center and
 * fading out toward the edges — a processed/graphic stand-in for a
 * pulse-ring photograph, in the spirit of the dithertone-style references.
 * Pure SVG, seeded so it's stable across renders.
 */
export function HalftoneMark({ width = "100%" }: { width?: DimensionValue }) {
  const { tokens } = useDesignTheme();

  const dots = useMemo(() => {
    const rand = seededRandom(7);
    const center = SIZE / 2;
    const result: { x: number; y: number; r: number; accent: boolean }[] = [];

    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const jitterX = (rand() - 0.5) * CELL * 0.25;
        const jitterY = (rand() - 0.5) * CELL * 0.25;
        const cx = gx * CELL + CELL / 2 + jitterX;
        const cy = gy * CELL + CELL / 2 + jitterY;
        const dx = cx - center;
        const dy = cy - center;
        const dist = Math.sqrt(dx * dx + dy * dy) / center;

        const ring = Math.abs(Math.sin(dist * Math.PI * 3.4));
        const fade = Math.max(0, 1 - dist * 0.92);
        const intensity = ring * fade;
        if (intensity < 0.1) continue;

        const r = (CELL / 2) * intensity * 0.9 * (0.85 + rand() * 0.3);
        result.push({ x: cx, y: cy, r, accent: dist < 0.16 });
      }
    }
    return result;
  }, []);

  return (
    <View style={{ width, aspectRatio: 1 }}>
      <Svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height="100%">
        {dots.map((d, i) => (
          <Circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill={d.accent ? tokens.swatch.accent : tokens.swatch.ink}
          />
        ))}
      </Svg>
    </View>
  );
}
