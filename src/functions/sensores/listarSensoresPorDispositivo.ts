import { app } from "@azure/functions";
import { sensorHandler } from "../../handlers/sensorHandler";

app.http("listarSensoresPorDispositivo", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "dispositivos/{dispositivoId}/sensores",
    handler: sensorHandler.listarPorDispositivo,
});