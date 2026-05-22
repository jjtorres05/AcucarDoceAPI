import {app} from "@azure/functions"
import { dispositivoHandler } from "../../handlers/dispositivoHandler"

app.http("obterDispositivo",{
    methods: ["GET"],
    authLevel: "anonymous",
    route: "empresa/{empresaId}/dispositivos/{id}",
    handler: dispositivoHandler.obterPorId,
});