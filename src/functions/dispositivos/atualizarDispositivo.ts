import {app} from "@azure/functions"
import { dispositivoHandler } from "../../handlers/dispositivoHandler"

app.http("atualizarDispositivo",{
    methods: ["PUT"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/dispositivos",
    handler: dispositivoHandler.atualizar,
});