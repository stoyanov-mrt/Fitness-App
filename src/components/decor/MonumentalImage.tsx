import type { DimensionValue } from "react-native";

import { useDesignTheme } from "@/theme/useDesignTheme";

import { HalftoneMark } from "./HalftoneMark";
import { Linework } from "./Linework";

/** The theme-appropriate monumental image — swap point used by any screen
 * that wants "the" anchor image rather than picking a mark by hand. */
export function MonumentalImage({ width = "100%" }: { width?: DimensionValue }) {
  const { theme } = useDesignTheme();
  return theme === "dither" ? <HalftoneMark width={width} /> : <Linework width={width} />;
}
