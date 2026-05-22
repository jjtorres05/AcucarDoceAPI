import { app } from "@azure/functions";
import { sensorHandler } from "../../handlers/sensorHandler";

app.http("atualizarSensor", {
    methods: ["PUT"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/sensores",
    handler: sensorHandler.atualizar,
}); 