import { SELF } from "cloudflare:test";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Auth API Integration Tests", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe("POST /auth/token", () => {
    it("should return the token details", async () => {
      const requestBody = {
                            "username": "username",
                            "password": "password"
                          };
      const response = await SELF.fetch(`http://local.test/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(requestBody),
      });
      const body = await response.json<{ token: string; expiresAt: string; tokenType: string }>();

      const expiresAt = new Date(body.expiresAt).getTime();

      expect(response.status).toBe(200);
      expect(body.token).toHaveLength(356);
      expect(expiresAt).toBeGreaterThan(Date.now());
      expect(body.tokenType).toBe("Bearer");
    });
  });
});
