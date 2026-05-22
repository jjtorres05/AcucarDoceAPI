import { app } from "@azure/functions";
import { sensorHandler } from "../../handlers/sensorHandler";

app.http("criarSensor", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/sensores",
    handler: sensorHandler.criar,
});