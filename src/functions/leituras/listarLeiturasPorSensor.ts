import { app } from "@azure/functions";
import { leituraHandler } from "../../handlers/leituraHandler";

app.http("listarLeiturasPorSensor", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/sensores/{sensorId}/leituras",
    handler: leituraHandler.listarPorSensor,
});