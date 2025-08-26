import { Hono } from "hono";
import { fromHono } from "chanfana";
import { ConsultaCliente, BloqueaCliente, ReactivaCliente, FacturacionCliente } from "./consultaCliente";


export const GioPhoneRouter = fromHono(new Hono());

GioPhoneRouter.get("/cliente/:msisdn", ConsultaCliente);
GioPhoneRouter.put("/bloquear/:msisdn", BloqueaCliente);
GioPhoneRouter.post("/reactivar/:msisdn", ReactivaCliente);
GioPhoneRouter.get("/facturacion/:msisdn", FacturacionCliente);
