import { app } from "@azure/functions";
import { sensorHandler } from "../../handlers/sensorHandler";

app.http("obterSensor", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/sensores/{id}",
    handler: sensorHandler.obterPorId,
});