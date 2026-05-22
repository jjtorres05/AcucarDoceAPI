import { app } from "@azure/functions";
import { sensorHandler } from "../../handlers/sensorHandler";

app.http("desativarSensor", {
    methods: ["PATCH"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/sensores/{id}/desativar",
    handler: sensorHandler.desativar,
});