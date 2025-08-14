import { faker } from "@faker-js/faker";
import { contentJson, OpenAPIRoute } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";

export class LevantarReporte extends OpenAPIRoute {
  public schema = {
    tags: ["frigos"],
    summary: "Levanta un reporte",
    operationId: "frigos-levantarReporte", // This is optional
    request: {
      headers: z.object({
        'X-API-Key': z.string().length(356).describe("API token for authentication"),
      }),
      body: contentJson(
        z.object({
          motivo: z.string(),
          nombre: z.string(),
          direccion: z.string(),
          numeroContacto: z.string(),
        }),
      ),
    },
    responses: {
      "201": {
        description: "Regresa verdadero y el número de reporte si se pudo levantar un reporte, de lo contrario falso y null",
        ...contentJson({
          success: z.boolean(),
          reporte: z.string(),
        }),
      },
      "400": { description: 'Solicitud con datos inválidos',
        ...contentJson({
          success: z.literal(false),
          reporte: z.null(),
        }),
      }, // Example error response
    },
  };

  public async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const failProbability = data.body?.nombre == "Test" ? 1 : 0.9; // 10% chance to fail
    const random_success = faker.datatype.boolean(failProbability);

    c.status(201);
    return c.json({
      success: random_success,
      reporte: random_success ? faker.string.numeric(5): null,
    });
  }
}
