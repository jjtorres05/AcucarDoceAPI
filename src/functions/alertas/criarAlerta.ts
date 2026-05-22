import { app } from "@azure/functions";
import { alertaHandler } from "../../handlers/alertaHandler";
app.http("criarAlerta", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/alertas",
    handler: alertaHandler.criar,
});