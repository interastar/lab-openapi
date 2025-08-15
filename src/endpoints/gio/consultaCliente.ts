import { faker } from "@faker-js/faker";
import { contentJson, OpenAPIRoute, NotFoundException } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";

export class ConsultaCliente extends OpenAPIRoute {

  public schema = {
    tags: ["GioPhone"],
    summary: "Consulta un cliente",
    operationId: "giophone-consultacliente", // This is optional
    request: {
      headers: z.object({
        'X-API-Key': z.string().length(356).describe("API token for authentication"),
      }),
      params: z.object({
        msisdn: z.string().regex(/^([1-9])(\d{7,13})$/).describe('Número de cliente'),
      }),
    },
    responses: {
      "200": {
        description: "Regresa verdadero y detalle del cliente si se encontró, de lo contrario falso y null",
        ...contentJson({
          success: z.boolean().describe("Indica si la consulta fue exitosa"),
          balance: z.number().describe("Saldo disponible en pesos mexicanos"),
          plan: z.object({
            nombre: z.string().describe("Nombre del plan activo"),
            datos: z.number().int().describe("Datos incluidos en el plan (en MB)"),
            uso_datos: z.number().int().describe("Uso actual de datos (en MB)"),
            minutos: z.number().int().describe("Minutos incluidos en el plan"),
            uso_minutos: z.number().int().describe("Uso actual de minutos"),
            sms: z.number().int().describe("SMS incluidos en el plan"),
            uso_sms: z.number().int().describe("Uso actual de SMS"),
          }).describe("Información del plan activo (nombre, datos incluidos, uso, minutos, SMS). Si no se encuentra, será null"),
        }),
      },
      "400": { description: 'Solicitud con datos inválidos',
        ...contentJson({
          success: z.literal(false),
          balance: z.null(),
          plan: z.null(),
        }),
      }, // Example error response
      "404": { description: 'Cliente no encontrado',
        ...contentJson({
          success: z.literal(false),
          balance: z.null(),
          plan: z.null(),
        }),
      }, // Example error response
    },
  };

  public async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const number = Number(data.params.msisdn); // This is the report number from the request

    if (data.params == undefined || number < 18111111 || number > 99900000000000) {
      throw new NotFoundException("Cliente no encontrado");
    }

    const failProbability = number == 525554094045 ? 1 : 0.9; // 10% chance to fail
    faker.seed(number);

    const random_success = faker.datatype.boolean(failProbability);
    const level = faker.number.int({ min: 1, max: 5 }); // Random level from 1 to 5
    const plan = {
      nombre: `Plan Max ${level} Plus`,
      datos: 500 * (2**level), // Datos en MB, incrementa con el nivel
      uso_datos: faker.number.int({ min: 0, max: 500 * (2**level) }), // Uso de datos aleatorio entre 0 y el máximo del plan
      minutos: 1000 * (2**level), // Minutos incluidos en el plan
      uso_minutos: faker.number.int({ min: 0, max: 1000 * (2**level) }), // Uso de minutos aleatorio entre 0 y el máximo del plan
      sms: 200 * (2**level), // SMS incluidos en el plan
      uso_sms: faker.number.int({ min: 0, max: 200 * (2**level) }), // Uso de sms aleatorio entre 0 y el máximo del plan
    }
    
    return {
      success: random_success,
      balance: faker.number.float({ min: 0, max: 10000, multipleOf: 0.50 }),
      plan: random_success ? plan : null,
    };
  }
}
