import { FiltroData } from "../types";

export function buildFiltroData(filtro?: FiltroData): Record<string, unknown> {
    if (!filtro?.inicio && !filtro?.fim) return {};

    const timestamp: Record<string, Date> = {};
    if (filtro.inicio) timestamp.$gte = filtro.inicio;
    if (filtro.fim) timestamp.$lte = filtro.fim;

    return { timestamp };
}