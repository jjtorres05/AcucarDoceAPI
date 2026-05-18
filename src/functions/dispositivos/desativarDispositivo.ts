import {app} from "@azure/functions"
import { dispositivoHandler } from "../../handlers/dispositivoHandler"

app.http("desativarDispositivo",{
    methods: ["PATCH"],
    authLevel: "anonymous",
    route: "dispositivos/{id}/desativar",
    handler: dispositivoHandler.desativar,
});