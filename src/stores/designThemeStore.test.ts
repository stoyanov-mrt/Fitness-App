import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

import { useDesignThemeStore } from "@/stores/designThemeStore";

// The store persists to AsyncStorage (see designThemeStore.ts); its native
// module isn't available under Jest, so swap in the package's own mock —
// same fix documented at https://react-native-async-storage.github.io/async-storage/docs/advanced/jest
// (jest.mock calls are hoisted above imports by babel-jest, so this runs
// before designThemeStore.ts's own import of the real module resolves).
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

describe("designThemeStore", () => {
  it("defaults to the dither theme", () => {
    expect(useDesignThemeStore.getState().theme).toBe("dither");
  });

  it("updates the theme", () => {
    useDesignThemeStore.getState().setTheme("japanese");
    expect(useDesignThemeStore.getState().theme).toBe("japanese");

    // reset for other tests
    useDesignThemeStore.getState().setTheme("dither");
  });
});
