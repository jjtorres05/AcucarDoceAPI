import { app } from "@azure/functions";
import { atuadorHandler } from "../../handlers/atuadorHandler";

app.http("listarAtuadoresPorEmpresa", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "atuadores",
    handler: atuadorHandler.listarPorEmpresa,
});