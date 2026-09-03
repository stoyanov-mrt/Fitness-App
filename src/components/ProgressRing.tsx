import { Circle, Svg } from "react-native-svg";
import { View, type ViewStyle } from "react-native";

import { useDesignTheme } from "@/theme/useDesignTheme";

type ProgressRingProps = {
  progress: number; // 0-1, values outside are clamped
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
};

// Feature-agnostic UI primitive (used on the Dashboard for calories, could
// be reused anywhere else a "progress toward a target" ring is useful).
// Defaults to the active design theme's accent — this is one of the few
// places the accent is meant to show up.
export function ProgressRing({
  progress,
  size = 140,
  strokeWidth = 3,
  color,
  trackColor,
  children,
}: ProgressRingProps) {
  const { tokens } = useDesignTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clamped);

  const rotatedStyle: ViewStyle = { transform: [{ rotate: "-90deg" }] };

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <View style={[{ position: "absolute", width: size, height: size }, rotatedStyle]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor ?? tokens.progressRing.track}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color ?? tokens.progressRing.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
          />
        </Svg>
      </View>
      <View className="items-center justify-center">{children}</View>
    </View>
  );
}
