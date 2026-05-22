import { app } from "@azure/functions";
import { sensorHandler } from "../../handlers/sensorHandler";

app.http("listarSensoresPorEmpresa", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/sensores",
    handler: sensorHandler.listarPorEmpresa,
});