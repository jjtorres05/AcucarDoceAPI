import { app } from "@azure/functions";
import { logHandler } from "../../handlers/logHandler";

app.http("listarLogsPorDispositivo", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/dispositivos/{dispositivoId}/logs",
    handler: logHandler.listarPorDispositivo,
});