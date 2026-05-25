import { app } from "@azure/functions";
import { leituraHandler } from "../../handlers/leituraHandler";

app.http("criarLeitura", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/dispositivos/{dispositivoId}/leituras",
    handler: leituraHandler.criar,
});