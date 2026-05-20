import { app } from "@azure/functions";
import { atuadorHandler } from "../../handlers/atuadorHandler";

app.http("desativarAtuador", {
    methods: ["PATCH"],
    authLevel: "anonymous",
    route: "atuadores/{id}/desativar",
    handler: atuadorHandler.desativar,
});