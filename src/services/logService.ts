import { logRepository } from "../repositories/logRespository";
import { obfuscateId, deobfuscateId } from "../utils/obfuscateId";
import { NotFoundError } from "../utils/errors";
import { AuthContext, LogResponse } from "../types";

function toResponse(l: {
    id: number;
    tabela: string;
    operacao: string;
    descricao: string;
    dispositivo_id: number | null;
    dispositivo_nome: string | null;
    empresa_id: number;
    created_at: Date;
}): LogResponse {
    return {
        id: obfuscateId("log", l.id),
        tabela: l.tabela,
        operacao: l.operacao,
        descricao: l.descricao,
        dispositivo_id: l.dispositivo_id ? obfuscateId("dispositivo", l.dispositivo_id) : null,
        dispositivo_nome: l.dispositivo_nome,
        empresa_id: l.empresa_id,
        created_at: l.created_at,
    };
}

export const logService = {
    listarPorEmpresa: async (
        auth: AuthContext
    ): Promise<LogResponse[]> => {
        const items = await logRepository.findAllByempresa(auth.empresa_id);
        return items.map(toResponse);
    },

    listarPorDispositivo: async (
        auth: AuthContext,
        obfuscatedDispositivoId: string
    ): Promise<LogResponse[]> => {
        const dispositivoId = deobfuscateId("dispositivo", obfuscatedDispositivoId);
        const items = await logRepository.findAllByDispositivo(dispositivoId, auth.empresa_id);
        return items.map(toResponse);
    },

    obterPorId: async (
        auth: AuthContext,
        obfuscatedId: string
    ): Promise<LogResponse> => {
        const id = deobfuscateId("log", obfuscatedId);
        const log = await logRepository.findByIdAndEmpresa(id, auth.empresa_id);
        if (!log) {
            throw new NotFoundError("Log nao encontrado");
        }
        return toResponse(log);
    },
};