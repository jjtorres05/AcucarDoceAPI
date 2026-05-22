import { app } from "@azure/functions";
import { atuadorHandler } from "../../handlers/atuadorHandler";

app.http("listarAtuadoresPorEmpresa", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/atuadores",
    handler: atuadorHandler.listarPorEmpresa,
});