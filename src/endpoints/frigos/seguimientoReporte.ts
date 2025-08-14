import { faker } from "@faker-js/faker";
import { contentJson, OpenAPIRoute, NotFoundException } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";

export class SeguimientoReporte extends OpenAPIRoute {

  public schema = {
    tags: ["frigos"],
    summary: "Consulta un reporte",
    operationId: "frigos-seguimientoReporte", // This is optional
    request: {
      headers: z.object({
        'X-API-Key': z.string().length(356).describe("API token for authentication"),
      }),
      params: z.object({
        report: z.number().int().describe('Número de reporte'),
      }),
    },
    responses: {
      "200": {
        description: "Regresa verdadero y el último estado del reporte si se encontró reporte, de lo contrario falso y null",
        ...contentJson({
          success: z.boolean(),
          estado: z.string(),
        }),
      },
      "400": { description: 'Solicitud con datos inválidos',
        ...contentJson({
          success: z.literal(false),
          estado: z.null(),
        }),
      }, // Example error response
      "404": { description: 'Reporte no encontrado',
        ...contentJson({
          success: z.literal(false),
          estado: z.null(),
        }),
      }, // Example error response
    },
  };

  public async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    if (data.params == undefined || data.params.report < 1 || data.params.report > 99999) {
      throw new NotFoundException("Reporte no encontrado");
    }

    const seedFromReport = data.params.report; // This is the report number from the request
    const failProbability = seedFromReport == "99999" ? 1 : 0.9; // 10% chance to fail
    faker.seed(seedFromReport);

    const random_success = faker.datatype.boolean(failProbability);
    const status = faker.helpers.arrayElement(['abierto', 'cerrado', 'en revisión', 'en espera de respuesta', 'en proceso', 'resuelto', 'cancelado', 'pendiente de revisión', 'pendiente de respuesta', 'pendiente de resolución', 'pendiente de cierre']);

    return {
      success: random_success,
      estado: random_success ? status: null,
    };
  }
}
