import { app } from "@azure/functions";
import { leituraHandler } from "../../handlers/leituraHandler";

app.http("obterLeitura", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/leituras/{id}",
    handler: leituraHandler.obterPorId,
});