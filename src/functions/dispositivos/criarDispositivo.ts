import {app} from "@azure/functions"
import { dispositivoHandler } from "../../handlers/dispositivoHandler"

app.http("criarDispositivo",{
    methods: ["POST"],
    authLevel: "anonymous",
    route: "dispositivos",
    handler: dispositivoHandler.criar,
});