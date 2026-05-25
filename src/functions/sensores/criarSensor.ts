import { app } from "@azure/functions";
import { sensorHandler } from "../../handlers/sensorHandler";

app.http("criarSensor", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/sensores", //// POST /sensores?empresaId=xx
    handler: sensorHandler.criar,
});