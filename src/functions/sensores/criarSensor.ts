import { app } from "@azure/functions";
import { sensorHandler } from "../../handlers/sensorHandler";

app.http("criarSensor", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "sensores",
    handler: sensorHandler.criar,
});