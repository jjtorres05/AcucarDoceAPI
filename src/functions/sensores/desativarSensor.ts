import { app } from "@azure/functions";
import { sensorHandler } from "../../handlers/sensorHandler";

app.http("desativarSensor", {
    methods: ["PATCH"],
    authLevel: "anonymous",
    route: "sensores/{id}/desativar",
    handler: sensorHandler.desativar,
});