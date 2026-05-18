import {app} from "@azure/functions"
import { dispositivoHandler } from "../../handlers/dispositivoHandler"

app.http("atualizarDispositivo",{
    methods: ["PUT"],
    authLevel: "anonymous",
    route: "dispositivos/{id}",
    handler: dispositivoHandler.atualizar,
});