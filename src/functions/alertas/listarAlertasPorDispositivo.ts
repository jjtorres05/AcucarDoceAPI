import { app } from "@azure/functions";
import { alertaHandler } from "../../handlers/alertaHandler";

app.http("listarAlertasPorDispositivo", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/dispositivos/{dispositivoId}/alertas",
    handler: alertaHandler.listarPorDispositivo,
});