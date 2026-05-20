import { app } from "@azure/functions";
import { atuadorHandler } from "../../handlers/atuadorHandler";

app.http("listarAtuadoresPorDispositivo", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "dispositivos/{dispositivoId}/atuadores",
    handler: atuadorHandler.listarPorDispositivo,
});