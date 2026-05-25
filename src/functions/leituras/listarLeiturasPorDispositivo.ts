import { app } from "@azure/functions";
import { leituraHandler } from "../../handlers/leituraHandler";

app.http("listarLeiturasPorDispositivo", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/dispositivos/{dispositivoId}/leituras",
    handler: leituraHandler.listarPorDispositivo,
});