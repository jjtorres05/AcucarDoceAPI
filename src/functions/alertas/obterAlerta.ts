import { app } from "@azure/functions";
import { alertaHandler } from "../../handlers/alertaHandler";

app.http("obterAlerta", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/alertas/{id}",
    handler: alertaHandler.obterPorId,
});