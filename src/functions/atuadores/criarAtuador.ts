import { app } from "@azure/functions";
import { atuadorHandler } from "../../handlers/atuadorHandler";

app.http("criarAtuador", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/atuadores",
    handler: atuadorHandler.criar,
});
