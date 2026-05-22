import { alertaRepository } from "../repositories/alertaRepository";
import { dispositivoRepository } from "../repositories/dispositvoRepository";
import { sensorRepository } from "../repositories/sensorRepository";
import { obfuscateId, deobfuscateId } from "../utils/obfuscateId";
import { NotFoundError } from "../utils/errors";
import { AuthContext, AlertaResponse } from "../types";
import { CriarAlertaInput } from "../schemas/alertaSchema";

function toResponse(a: {
    id: number;
    dispositivo_id: number;
    sensor_id: number;
    tipo: string;
    mensagem: string;
    created_at: Date;
}): AlertaResponse {
    return {
        id: obfuscateId("alerta", a.id),
        dispositivo_id: obfuscateId("dispositivo", a.dispositivo_id),
        sensor_id: obfuscateId("sensor", a.sensor_id),
        tipo: a.tipo,
        mensagem: a.mensagem,
        created_at: a.created_at,
    };
}

export const alertaService = {

    criar: async (
        auth: AuthContext,
        input: CriarAlertaInput
    ): Promise<AlertaResponse> => {
        const dispositivoId = deobfuscateId("dispositivo", input.dispositivo_id);
        const sensorId = deobfuscateId("sensor", input.sensor_id);

        const dispositivo = await dispositivoRepository.findByIdAndEmpresa(dispositivoId, auth.empresa_id);
        if (!dispositivo) {
            throw new NotFoundError("Dispositivo nao encontrado");
        }

        const sensor = await sensorRepository.findByIdAndEmpresa(sensorId, auth.empresa_id);
        if (!sensor) {
            throw new NotFoundError("Sensor nao encontrado");
        }

        const alerta = await alertaRepository.create(
            {
                dispositivo_id: dispositivoId,
                sensor_id: sensorId,
                tipo: input.tipo,
                mensagem: input.mensagem,
            },
            auth.empresa_id,
            auth.usuario_id
        );
        return toResponse(alerta);
    },

    listarPorEmpresa: async (
        auth: AuthContext
    ): Promise<AlertaResponse[]> => {
        const items = await alertaRepository.findAllByEmpresa(auth.empresa_id);
        return items.map(toResponse);
    },

    listarPorDispositivo: async (
        auth: AuthContext,
        obfuscatedDispositivoId: string
    ): Promise<AlertaResponse[]> => {
        const dispositivoId = deobfuscateId("dispositivo", obfuscatedDispositivoId);
        const dispositivo = await dispositivoRepository.findByIdAndEmpresa(dispositivoId, auth.empresa_id);
        if (!dispositivo) {
            throw new NotFoundError("Dispositivo nao encontrado");
        }
        const items = await alertaRepository.findAllByDispositivo(dispositivoId);
        return items.map(toResponse);
    },

    listarPorSensor: async (
        auth: AuthContext,
        obfuscatedSensorId: string
    ): Promise<AlertaResponse[]> => {
        const sensorId = deobfuscateId("sensor", obfuscatedSensorId);
        const sensor = await sensorRepository.findByIdAndEmpresa(sensorId, auth.empresa_id);
        if (!sensor) {
            throw new NotFoundError("Sensor nao encontrado");
        }
        const items = await alertaRepository.findAllBySensor(sensorId);
        return items.map(toResponse);
    },

    obterPorId: async (
        auth: AuthContext,
        obfuscatedId: string
    ): Promise<AlertaResponse> => {
        const id = deobfuscateId("alerta", obfuscatedId);
        const alerta = await alertaRepository.findByIdAndEmpresa(id, auth.empresa_id);
        if (!alerta) {
            throw new NotFoundError("Alerta nao encontrado");
        }
        return toResponse(alerta);
    },
};