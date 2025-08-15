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

describe("Frigos API Integration Tests", () => {
  beforeEach(async () => {
    // This is a good place to clear any test data if your test runner doesn't do it automatically.
    // Since the prompt mentions rows are deleted after each test, we can rely on that.
    vi.clearAllMocks();
  });

  // Tests for POST /levantarReporte
  describe("POST /frigos/reporte", () => {
    it("should create a new report successfully", async () => {
      const testData = {
        motivo: "Motivo",
        nombre: "Test",
        direccion: "Direccion",
        numeroContacto: "525512345678",
      };
      const response = await SELF.fetch(`http://local.test/frigos/reporte`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": await getToken() },
        body: JSON.stringify(testData),
      });

      const body = await response.json<{ success: boolean; reporte: string }>();

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.reporte).toHaveLength(5);
      expect(Number.isInteger(parseInt(body.reporte))).toBe(true);
    });

    it("should return a 400 error for invalid input", async () => {
      const invalidTaskData = {
        // Missing required fields 'name', 'slug', etc.
        description: "This is an invalid report",
      };
      const response = await SELF.fetch(`http://local.test/frigos/reporte`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidTaskData),
      });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.reporte).toBeFalsy();
    });
  });

  // Tests for GET /frigos/reporte/{report}
  describe("GET /frigos/reporte/{report}", () => {
    it("should get a report status by its number", async () => {

      const report = "99999"; // Example report number
      const response = await SELF.fetch(`http://local.test/frigos/reporte/${report}`,{
        headers: { "Content-Type": "application/json", "X-API-Key": await getToken() },
      });
      const body = await response.json<{ success: boolean; estado: string }>();

      const values = ['abierto', 'cerrado', 'en revisión', 'en espera de respuesta', 'en proceso', 'resuelto', 'cancelado', 'pendiente de revisión', 'pendiente de respuesta', 'pendiente de resolución', 'pendiente de cierre'];

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(values).toContain(body.estado);
    });

    it("should return a 404 error if report is not found", async () => {
      const nonExistentId = 9999999;
      const response = await SELF.fetch(
        `http://local.test/frigos/reporte/${nonExistentId}`, {
          headers: { "Content-Type": "application/json", "X-API-Key": await getToken() },
        }
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.estado).toBeFalsy();
    });
  });

});
