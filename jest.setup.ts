import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

// Runs before every test file. AsyncStorage's native module isn't available
// under Jest — several stores/lib singletons persist to it transitively
// (designThemeStore, themeStore's future persistence, queryClient's
// persister), so this needs to be a global mock rather than repeated per
// test file. See:
// https://react-native-async-storage.github.io/async-storage/docs/advanced/jest
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
