import { faker } from "@faker-js/faker";
import { contentJson, OpenAPIRoute } from "chanfana";
import { AppContext } from "../types";
import { z } from "zod";

export class TokenEndpoint extends OpenAPIRoute {
  public schema = {
    tags: ["auth"],
    summary: "Obtiene tiket de autenticación para usar el API",
    operationId: "auth-token", // This is optional
    request: {
      body: contentJson(
        z.object({
          username: z.string().min(5).describe('NOmbre de usuario para autenticación'),
          password: z.string().min(5).describe('Contraseña para autenticación'),
        }),
      ),
    },
    responses: {
      "200": {
        description: "Returns the auth token",
        ...contentJson({
          token: z.string(),
          expiresAt: z.string().datetime(),
          tokenType: z.literal("Bearer"),
        }),
      },
    },
  };

  public async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    return {
      "token": faker.string.alphanumeric(356),
      "expiresAt": faker.date.soon().toISOString(),
      "tokenType": "Bearer"
    };
  }
}
