import { Circle, Svg } from "react-native-svg";
import { View, type ViewStyle } from "react-native";

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
export function ProgressRing({
  progress,
  size = 140,
  strokeWidth = 12,
  color = "#171717",
  trackColor = "#e5e5e5",
  children,
}: ProgressRingProps) {
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
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
      </View>
      <View className="items-center justify-center">{children}</View>
    </View>
  );
}
