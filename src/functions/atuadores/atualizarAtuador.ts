import { app } from "@azure/functions";
import { atuadorHandler } from "../../handlers/atuadorHandler";

app.http("atualizarAtuador", {
    methods: ["PUT"],
    authLevel: "anonymous",
    route: "atuadores/{id}",
    handler: atuadorHandler.atualizar,
});