import { Hono } from "hono";
import { fromHono } from "chanfana";
import { ConsultaCliente } from "./consultaCliente";


export const GioPhoneRouter = fromHono(new Hono());

GioPhoneRouter.get("/cliente/:msisdn", ConsultaCliente);
