import { app } from "@azure/functions";
import { dispositivoHandler } from "../../handlers/dispositivoHandler";
app.http("criarDispositivo", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "dispositivos",
    handler: dispositivoHandler.criar,
});

app.http("listarDispositivos", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "dispositivos",
    handler: dispositivoHandler.listar,
});

app.http("atualizarDispositivo", {
    methods: ["PUT"],
    authLevel: "anonymous",
    route: "dispositivos",
    handler: dispositivoHandler.atualizar,
});

app.http("desativarDispositivo", {
    methods: ["PATCH"],
    authLevel: "anonymous",
    route: "dispositivos/desativar",
    handler: dispositivoHandler.desativar,
});

app.http("regenerarTokenDispositivo", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "dispositivos/regenerar-token",
    handler: dispositivoHandler.regenerarToken,
});