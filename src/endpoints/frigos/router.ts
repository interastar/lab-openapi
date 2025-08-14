import { Hono } from "hono";
import { fromHono } from "chanfana";
import { LevantarReporte } from "./levantarReporte";
import { SeguimientoReporte } from "./seguimientoReporte";


export const FrigosRouter = fromHono(new Hono());

FrigosRouter.post("/reporte", LevantarReporte);
FrigosRouter.get("/reporte/:report", SeguimientoReporte);
