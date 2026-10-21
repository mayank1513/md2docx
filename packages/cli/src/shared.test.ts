/** biome-ignore-all lint/suspicious/noExplicitAny: Use of any is ok for test files */

import { describe, test } from "vitest";
import { DEFAULT_CONFIG, shared } from "./shared";

describe("shared", () => {
  test("should work with default config", async ({ expect }) => {
    // Basic connectivity test
    await expect(shared(DEFAULT_CONFIG)).resolves.not.toThrow();
  });
});
