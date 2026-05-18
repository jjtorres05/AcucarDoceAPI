import { LogDescricao } from "../types";

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

export function montarDescricaoLog(descricao: LogDescricao): string {
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        ...descricao,
    });
}