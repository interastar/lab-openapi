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
        msisdn: z.string().regex(/^([1-9])(\d{7,13})$/).describe('Número telefónico del cliente'),
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
      balance: random_success ? faker.number.float({ min: 0, max: 10000, multipleOf: 0.50 }) : null,
      plan: random_success ? plan : null,
    };
  }
}

export class BloqueaCliente extends OpenAPIRoute {

  public schema = {
    tags: ["GioPhone"],
    summary: "Bloquea un cliente",
    operationId: "giophone-bloqueacliente", // This is optional
    request: {
      headers: z.object({
        'X-API-Key': z.string().length(356).describe("API token for authentication"),
      }),
      params: z.object({
        msisdn: z.string().regex(/^([1-9])(\d{7,13})$/).describe('Número telefónico del cliente'),
      }),
    },
    responses: {
      "200": {
        description: "Regresa verdadero y folio de bloqueo si el número se encontró y fue bloqueado, de lo contrario falso y null",
        ...contentJson({
          success: z.boolean().describe("Indica si el bloqueo fue exitoso"),
          folio: z.string().length(6).describe("Folio de bloqueo asignado"),
        }),
      },
      "400": { description: 'Solicitud con datos inválidos',
        ...contentJson({
          success: z.literal(false),
          folio: z.null(),
        }),
      }, // Example error response
      "404": { description: 'Número no encontrado',
        ...contentJson({
          success: z.literal(false),
          folio: z.null(),
        }),
      }, // Example error response
    },
  };

  public async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const number = Number(data.params.msisdn); // This is the report number from the request

    if (data.params == undefined || number < 18111111 || number > 99900000000000) {
      throw new NotFoundException("Número no encontrado");
    }

    const failProbability = number == 525554094045 ? 1 : 0.9; // 10% chance to fail
    faker.seed(number);

    const random_success = faker.datatype.boolean(failProbability);
    
    return {
      success: random_success,
      folio: random_success ? faker.number.float({ min: 100000, max: 900000, multipleOf: 1 }).toString().padStart(6, '0') : null,
    };
  }
}

export class ReactivaCliente extends OpenAPIRoute {

  public schema = {
    tags: ["GioPhone"],
    summary: "Reactiva un cliente",
    operationId: "giophone-reactivacliente", // This is optional
    request: {
      headers: z.object({
        'X-API-Key': z.string().length(356).describe("API token for authentication"),
      }),
      params: z.object({
        msisdn: z.string().regex(/^([1-9])(\d{7,13})$/).describe('Número telefónico del cliente'),
      }),
      body: contentJson(
        z.object({
          folio: z.string().length(6).describe('Folio de bloqueo'),
        }),
      ),
    },
    responses: {
      "200": {
        description: "Regresa verdadero con el folio de reactivación si número se encontró y fue reactivado, de lo contrario falso y null",
        ...contentJson({
          success: z.boolean().describe("Indica si la reactivación fue exitosa"),
          folio: z.string().length(6).describe("Folio de reactivación asignado"),
        }),
      },
      "400": { description: 'Solicitud con datos inválidos',
        ...contentJson({
          success: z.literal(false),
          folio: z.null(),
        }),
      }, // Example error response
      "404": { description: 'Número o folio no encontrado',
        ...contentJson({
          success: z.literal(false),
          folio: z.null(),
        }),
      }, // Example error response
    },
  };

  public async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const number = Number(data.params.msisdn);
    const folio = Number(data.body.folio);

    if (data.params == undefined || number < 18111111 || number > 99900000000000) {
      throw new NotFoundException("Teléfono no encontrado");
    }

    const failProbability = number == 525554094045 ? 1 : 0.9; // 10% chance to fail
    faker.seed(number);

    if (folio < 100000 || folio > 900000) {
      throw new NotFoundException("Folio de bloqueo no encontrado");
    }

    const random_success = faker.datatype.boolean(failProbability);
    
    return {
      success: random_success,
      folio: random_success ? faker.number.float({ min: 100000, max: 900000, multipleOf: 1 }).toString().padStart(6, '0') : null,
    };
  }
}

export class FacturacionCliente extends OpenAPIRoute {

  public schema = {
    tags: ["GioPhone"],
    summary: "Obtiene facturación de un cliente",
    operationId: "giophone-facturacioncliente", // This is optional
    request: {
      headers: z.object({
        'X-API-Key': z.string().length(356).describe("API token for authentication"),
      }),
      params: z.object({
        msisdn: z.string().regex(/^([1-9])(\d{7,13})$/).describe('Número de teléfono del cliente'),
      }),
    },
    responses: {
      "200": {
        description: "Regresa verdadero y detalle de facturació cliente si se encontró, de lo contrario falso y null",
        ...contentJson({
          success: z.boolean().describe("Indica si la consulta fue exitosa"),
          facturacion: z.object({
            nombre: z.string().describe("Nombre del cliente"),
            saldo: z.number().describe("Saldo del cliente"),
            fecha_corte: z.string().date().describe("Fecha de corte"),
            fecha_vencimiento: z.string().date().describe("Última fecha de pago"),
            direccion: z.string().describe("Dirección del cliente"),
          }).describe("Información de facturación del cliente (nombre, saldo, dirección, fechas de corte y vencimiento). Si no se encuentra, será null"),
        }),
      },
      "400": { description: 'Solicitud con datos inválidos',
        ...contentJson({
          success: z.literal(false),
          balance: z.null(),
          plan: z.null(),
        }),
      }, // Example error response
      "404": { description: 'Número de cliente no encontrado',
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
    const corte = faker.date.recent({ days: 15 }); // Random date in the past
    const vencimiento = new Date();
    vencimiento.setDate(corte.getDate() + 30)

    const facturacion = {
      nombre: faker.person.fullName(),
      saldo: faker.number.float({ min: 0, max: 10000, multipleOf: 0.50 }),
      fecha_corte: corte.toISOString().split('T')[0],
      fecha_vencimiento: vencimiento.toISOString().split('T')[0],
      direccion: `${faker.location.streetAddress({ useFullAddress: true })}, ${faker.location.city()}, ${faker.location.zipCode()} ${faker.location.state({ abbreviated: true })}, ${faker.location.country()}`,
    }
    
    return {
      success: random_success,
      facturacion: random_success ? facturacion : null,
    };
  }
}