import { LogDescricao } from "../types";
import { obfuscateId, deobfuscateId, TipoId } from "./obfuscateId";

export function calcularAlteracoes<T extends Record<string, unknown>>(
    antes: T,
    depois: T,
    data: Partial<T>
    ): Record<string, { antes: unknown; depois: unknown }> {
    const alteracoes: Record<string, { antes: unknown; depois: unknown }> = {};

    for (const campo of Object.keys(data) as (keyof T)[]) {
        if (data[campo] !== undefined && antes[campo] !== depois[campo]) {
        alteracoes[campo as string] = {
            antes: antes[campo],
            depois: depois[campo],
        };
        }
    }

    return alteracoes;
}

const ID_TIPO_MAP: Record<string, TipoId> = {
    dispositivo_id: "dispositivo",
    sensor_id: "sensor",
    atuador_id: "atuador",
    alerta_id: "alerta",
};

function ofuscarValores(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (ID_TIPO_MAP[key] && typeof value === "number") {
            result[key] = obfuscateId(ID_TIPO_MAP[key], value);
        } else {
            result[key] = value;
        }
    }
    return result;
}

export function montarDescricaoLog(descricao: LogDescricao): string {
    const safe: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        acao: descricao.acao,
        entidade: descricao.entidade,
        registroId: obfuscateId(descricao.entidade as TipoId, descricao.registroId),
        executadoPor: obfuscateId("log", descricao.executadoPor),
    };

    if (descricao.dados) {
        safe.dados = ofuscarValores(descricao.dados as Record<string, unknown>);
    }

    if (descricao.alteracoes) {
        safe.alteracoes = descricao.alteracoes;
    }

    return JSON.stringify(safe);
}