import { app } from "@azure/functions";
import { alertaHandler } from "../../handlers/alertaHandler";

app.http("listarAlertasPorSensor", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/sensores/{sensorId}/alertas",
    handler: alertaHandler.listarPorSensor,
});