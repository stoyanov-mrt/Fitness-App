import { useThemeStore } from "@/stores/themeStore";

describe("themeStore", () => {
  it("defaults to the system theme preference", () => {
    expect(useThemeStore.getState().preference).toBe("system");
  });

  it("updates the preference", () => {
    useThemeStore.getState().setPreference("dark");
    expect(useThemeStore.getState().preference).toBe("dark");

    // reset for other tests
    useThemeStore.getState().setPreference("system");
  });
});
