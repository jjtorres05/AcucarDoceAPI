import { app } from "@azure/functions";
import { logHandler } from "../../handlers/logHandler";

app.http("obterLog", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/logs/{id}",
    handler: logHandler.obterPorId,
});