import { getPrismaClient } from "../database/prismaClient";

const safeSelect={
    id: true,
    tabela: true,
    operacao: true,
    descricao: true,
    dispositivo_id: true,
    dispositivo_nome: true,
    empresa_id: true,
    created_at: true
}as const;

export const logRepository ={

    findByIdAndEmpresa: (id: number, empresa_id: number)=>
        getPrismaClient().log.findFirst({
            where: {id, empresa_id}, select: safeSelect,
        }),
    
    findAllByempresa: (empresa_id: number)=>
        getPrismaClient().log.findMany({
            where: {empresa_id},select: safeSelect, orderBy:{created_at:"desc"},
        }),
    
    findAllByDispositivo: (dispositivo_id: number,empresa_id: number )=>
        getPrismaClient().log.findMany({
            where: {empresa_id,dispositivo_id}, select: safeSelect, orderBy:{created_at:"desc"},
        }),
};