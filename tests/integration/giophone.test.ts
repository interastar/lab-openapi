import { SELF } from "cloudflare:test";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Helper function to create a token
async function getToken() {
  const requestBody = {
                      "username": "username",
                      "password": "password"
                    };
  const response = await SELF.fetch(`http://local.test/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  const body = await response.json<{ token: string; expiresAt: Date; tokenType: string }>();
  return body.token;
}

describe("GioPhone API Integration Tests", () => {
  beforeEach(async () => {
    // This is a good place to clear any test data if your test runner doesn't do it automatically.
    // Since the prompt mentions rows are deleted after each test, we can rely on that.
    vi.clearAllMocks();
  });

  // Tests for GET /giophone/cliente/{msisdn}
  describe("GET /giophone/cliente/{msisdn}", () => {
    it("should get a customer plan by its number", async () => {

      const msisdn = "525554094045"; // Example report number
      const response = await SELF.fetch(`http://local.test/giophone/cliente/${msisdn}`,{
        headers: { "Content-Type": "application/json", "X-API-Key": await getToken() },
      });
      const body = await response.json<{ success: boolean; balance: number; plan: { name: string; datos: number; minutos: number; sms: number } }>();

      console.log("Response body:", body); // Log the response body for debugging

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.balance).toBeGreaterThan(0);
      expect(body.plan.nombre).toMatch(/Plan Max [1-5] Plus/);
      expect(body.plan.datos).toBeGreaterThanOrEqual(0);
      expect(body.plan.minutos).toBeGreaterThanOrEqual(0);
      expect(body.plan.sms).toBeGreaterThanOrEqual(0);
      expect(body.plan.datos).toBeLessThanOrEqual(16000); // Max datos for level 5
      expect(body.plan.minutos).toBeLessThanOrEqual(32000); // Max minutos for level 5
      expect(body.plan.sms).toBeLessThanOrEqual(6400); // Max sms for level 5
    });

    it("should return a 404 error if report is not found", async () => {
      const nonExistentPhone = 11111111;
      const response = await SELF.fetch(
        `http://local.test/giophone/cliente/${nonExistentPhone}`, {
          headers: { "Content-Type": "application/json", "X-API-Key": await getToken() },
        }
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.plan).toBeFalsy();
    });
  });

});
