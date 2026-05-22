import { app } from "@azure/functions";
import { atuadorHandler } from "../../handlers/atuadorHandler";

app.http("obterAtuador", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/atuadores/{id}",
    handler: atuadorHandler.obterPorId,
});