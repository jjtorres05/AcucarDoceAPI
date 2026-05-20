import { app } from "@azure/functions";
import { sensorHandler } from "../../handlers/sensorHandler";

app.http("obterSensor", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "sensores/{id}",
    handler: sensorHandler.obterPorId,
});