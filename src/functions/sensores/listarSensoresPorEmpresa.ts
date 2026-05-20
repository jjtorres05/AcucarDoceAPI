import { app } from "@azure/functions";
import { sensorHandler } from "../../handlers/sensorHandler";

app.http("listarSensoresPorEmpresa", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "sensores",
    handler: sensorHandler.listarPorEmpresa,
});