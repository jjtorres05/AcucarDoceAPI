import {app} from "@azure/functions"
import { dispositivoHandler } from "../../handlers/dispositivoHandler"

app.http("listarDispositivos",{
    methods: ["GET"],
    authLevel: "anonymous",
    route: "dispositivos",
    handler: dispositivoHandler.listar,
});