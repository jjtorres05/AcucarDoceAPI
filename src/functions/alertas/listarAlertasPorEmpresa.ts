import { app } from "@azure/functions";
import { alertaHandler } from "../../handlers/alertaHandler";

app.http("listarAlertasPorEmpresa", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/alertas",
    handler: alertaHandler.listarPorEmpresa,
});