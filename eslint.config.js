// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // .claude/worktrees/* holds isolated git worktrees for background
    // agent tasks — each is its own checkout with its own lint run, not
    // meant to be swept into this one (e.g. a worktree's copy of
    // supabase/functions isn't covered by the supabase/* ignore above,
    // since that's a different path prefix).
    ignores: ["dist/*", ".expo/*", "supabase/*", ".claude/worktrees/*"],
  }
]);
