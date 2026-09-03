import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  DashboardIcon,
  MetricsIcon,
  NutritionIcon,
  SettingsIcon,
  WorkoutsIcon,
} from "@/components/icons/TabIcons";
import { TAB_BAR_BOTTOM_MARGIN, TAB_BAR_HEIGHT } from "@/constants/layout";
import { useDesignTheme } from "@/theme/useDesignTheme";

export default function TabsLayout() {
  const { tokens } = useDesignTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        // React Navigation's default tab item layout is
        // justifyContent:'flex-start' (it assumes a label sits below the
        // icon) — with the label hidden, the icon was pinned near the top
        // of the pill instead of centered. Auto margins absorb the leftover
        // space evenly above/below regardless of the parent's
        // justifyContent, which is the reliable fix (confirmed against
        // expo-router's vendored BottomTabItem/TabBarIcon source, not just
        // guessed).
        tabBarIconStyle: { marginTop: "auto", marginBottom: "auto" },
        tabBarActiveTintColor: tokens.swatch.ink,
        tabBarInactiveTintColor: tokens.swatch.inkDim,
        tabBarStyle: {
          position: "absolute",
          left: 20,
          right: 20,
          bottom: insets.bottom + TAB_BAR_BOTTOM_MARGIN,
          height: TAB_BAR_HEIGHT,
          // React Navigation's BottomTabBar always applies
          // paddingBottom: insets.bottom by default (it assumes a bar
          // docked flush to the screen edge, needing padding to clear the
          // home indicator/gesture bar). Our bar already floats clear of
          // that via the `bottom` offset above, so on any device with a
          // non-zero bottom inset (any iPhone with Face ID) that default
          // padding was invisible on web (inset 0) but on a real phone ate
          // over half the pill's height, squashing the icon toward the
          // top — the actual cause of the "icons aren't centered" report,
          // on top of (not instead of) the tabBarIconStyle fix below.
          paddingBottom: 0,
          paddingTop: 0,
          borderRadius: TAB_BAR_HEIGHT / 2,
          borderWidth: 1,
          borderColor: tokens.swatch.border,
          backgroundColor: tokens.swatch.groundRaised,
          // "Hovering" over the page rather than docked to the edge — a
          // floating pill with real elevation, not just a flat bar.
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.16,
          shadowRadius: 16,
          elevation: 8,
        },
        // A floating/absolute tabBarStyle stops React Navigation from
        // reserving space for it automatically — every top-level tab
        // screen accounts for that itself via useTabBarContentClearance()
        // (src/constants/layout.ts) in its own bottom padding.
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          // tabBarShowLabel:false only hides the *visual* label — React
          // Navigation only falls back to `title` as the accessible name
          // on iOS, so Android/web need this set explicitly or every tab
          // announces with no name at all to a screen reader.
          tabBarAccessibilityLabel: "Dashboard",
          tabBarIcon: ({ color }) => <DashboardIcon color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarAccessibilityLabel: "Workouts",
          tabBarIcon: ({ color }) => <WorkoutsIcon color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrition",
          tabBarAccessibilityLabel: "Nutrition",
          tabBarIcon: ({ color }) => <NutritionIcon color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="metrics/index"
        options={{
          title: "Metrics",
          tabBarAccessibilityLabel: "Metrics",
          tabBarIcon: ({ color }) => <MetricsIcon color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: "Settings",
          tabBarAccessibilityLabel: "Settings",
          tabBarIcon: ({ color }) => <SettingsIcon color={color as string} />,
        }}
      />
    </Tabs>
  );
}
