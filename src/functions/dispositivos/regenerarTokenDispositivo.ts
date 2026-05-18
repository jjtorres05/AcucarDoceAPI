import {app} from "@azure/functions"
import { dispositivoHandler } from "../../handlers/dispositivoHandler"

app.http("regenerarTokenDispositivo",{
    methods: ["POST"],
    authLevel: "anonymous",
    route: "dispositivos/{id}/regenerar-token",
    handler: dispositivoHandler.regenerarToken,
});