import { app } from "@azure/functions";
import { atuadorHandler } from "../../handlers/atuadorHandler";

app.http("atualizarAtuador", {
    methods: ["PUT"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/atuadores",
    handler: atuadorHandler.atualizar,
});