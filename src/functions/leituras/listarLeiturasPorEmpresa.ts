import { app } from "@azure/functions";
import { leituraHandler } from "../../handlers/leituraHandler";

app.http("listarLeiturasPorEmpresa", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/leituras",
    handler: leituraHandler.listarPorEmpresa,
});