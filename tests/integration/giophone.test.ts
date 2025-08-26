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

  // Tests for GET /giophone/cliente/{msisdn}
  describe("PUT /giophone/bloquear/{msisdn}", () => {
    it("should block a customer by its number", async () => {

      const msisdn = "525554094045"; // Example report number
      const response = await SELF.fetch(`http://local.test/giophone/bloquear/${msisdn}`,{
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-API-Key": await getToken() },
      });
      const body = await response.json<{ success: boolean; folio: string; }>();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);

      const convertedNumber = parseInt(body.folio, 10); 

      expect(convertedNumber).toBeGreaterThan(100000);
      expect(convertedNumber).toBeLessThan(900000);
    });

    it("should return a 404 error if number is not found", async () => {
      const nonExistentPhone = 11111111;
      const response = await SELF.fetch(
        `http://local.test/giophone/bloquear/${nonExistentPhone}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "X-API-Key": await getToken() },
        }
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.folio).toBeFalsy();
    });
  });

  describe("POST /giophone/reactivar/{msisdn}", () => {
    it("should reactivate a customer by its number", async () => {

      const msisdn = "525554094045"; // Example report number
      const testData = {
        folio: "222222",
      };
      const response = await SELF.fetch(`http://local.test/giophone/reactivar/${msisdn}`,{
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": await getToken() },
        body: JSON.stringify(testData),
      });
      const body = await response.json<{ success: boolean; folio: string; }>();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);

      const convertedNumber = parseInt(body.folio, 10); 

      expect(convertedNumber).toBeGreaterThan(100000);
      expect(convertedNumber).toBeLessThan(900000);
    });

    it("should return a 404 error if number is not found", async () => {
      const nonExistentPhone = 11111111;
      const testData = {
        folio: "222222",
      };
      const response = await SELF.fetch(
        `http://local.test/giophone/reactivar/${nonExistentPhone}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-Key": await getToken() },
          body: JSON.stringify(testData),
        }
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.folio).toBeFalsy();
    });
  });

  // Tests for GET /giophone/cliente/{msisdn}
  describe("GET /giophone/facturacion/{msisdn}", () => {
    function isValidDateString(str: string): boolean {
      const date = new Date(str);
      return !isNaN(date.getTime());
    }

    it("should get a customer plan by its number", async () => {

      const msisdn = "525554094045"; // Example report number
      const response = await SELF.fetch(`http://local.test/giophone/facturacion/${msisdn}`,{
        headers: { "Content-Type": "application/json", "X-API-Key": await getToken() },
      });
      const body = await response.json<{ success: boolean; facturacion: { nombre: string; saldo: number; fecha_corte: string; fecha_vencimiento: string; direccion: string } }>();

      console.log(body);

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.facturacion.saldo).toBeGreaterThan(0);
      expect(isValidDateString(body.facturacion.fecha_corte)).toBe(true);
      expect(isValidDateString(body.facturacion.fecha_vencimiento)).toBe(true);
      expect(body.facturacion.nombre.length).toBeGreaterThan(0);
      expect(body.facturacion.direccion.length).toBeGreaterThan(0);
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
