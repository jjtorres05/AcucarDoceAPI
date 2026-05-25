import { FiltroData } from "../types";

export function buildFiltroData(filtro?: FiltroData): Record<string, unknown> {
    if (!filtro?.inicio && !filtro?.fim) return {};

    const created_at: Record<string, Date> = {};
    if (filtro.inicio) created_at.$gte = filtro.inicio;
    if (filtro.fim) created_at.$lte = filtro.fim;

    return { created_at };
}