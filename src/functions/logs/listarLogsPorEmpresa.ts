import { app } from "@azure/functions";
import { logHandler } from "../../handlers/logHandler";

app.http("listarLogsPorEmpresa", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/logs",
    handler: logHandler.listarPorempresa,
});