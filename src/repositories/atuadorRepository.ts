import { getPrismaClient } from "../database/prismaClient";
import { calcularAlteracoes, montarDescricaoLog } from "../utils/logHelper";
import { NotFoundError } from "../utils/errors";

const safeSelect={
    id: true,
    dispositivo_id: true,
    nome_modelo: true,
    tipo: true,
    ativo: true,
    created_at: true
}as const;

export const atuadorRepository = {

    findByIdAndEmpresa: (id: number, empresa_id: number )=>
        getPrismaClient().atuador.findFirst({
            where: {id, dispositivo:{empresa_id}}, select: safeSelect,
        }),

    findAllByDispositivo: (dispositivo_id: number)=>
        getPrismaClient().atuador.findMany({
            where: {dispositivo_id}, select: safeSelect, orderBy:{created_at: "desc"},
        }),
    
    findAllByEmpresa: (empresa_id: number)=>
        getPrismaClient().atuador.findMany({
            where: {dispositivo:{empresa_id}}, select: safeSelect, orderBy:{created_at:"desc"},
        }),

    create: (
        data: {
            dispositivo_id: number,
            nome_modelo: string,
            tipo: string,
        },
        empresa_id: number,
        executadoPorId: number,
    )=>
        getPrismaClient().$transaction(async (tx)=>{
            const atuador= await tx.atuador.create({
                data, select: safeSelect,
            });
            await tx.log.create({
                data: {
                    tabela: "atuador",
                    operacao: "CREATE",
                    dispositivo_id: data.dispositivo_id,
                    dispositivo_nome: null,
                    empresa_id,
                    descricao: montarDescricaoLog({
                        acao: "CREATE",
                        entidade: "atuador",
                        registroId: atuador.id,
                        executadoPor: executadoPorId,
                        dados:{
                            nome_modelo: atuador.nome_modelo,
                            tipo: atuador.tipo,
                            dispositivo_id: atuador.dispositivo_id,
                        },
                    }),
                },
            });
            return atuador;
        }),
    
    update: (
        id: number,
        empresa_id: number,
        data: {nome_modelo?:string, tipo?: string, ativo?: boolean},
        executadoPorId: number
    )=>
        getPrismaClient().$transaction(async (tx)=>{
            const antes= await tx.atuador.findFirst({
                where: {id, dispositivo:{empresa_id}}, select: safeSelect,
            });
            if(!antes){
                throw new NotFoundError("Atuador noa encontrado");
            }
            const atuador= await tx.atuador.update({
                where: {id}, data, select: safeSelect,
            });
            const alteracoes= calcularAlteracoes(antes,atuador,data);
            await tx.log.create({
                data: {
                    tabela: "atuador",
                    operacao: "UPDATE",
                    dispositivo_id: atuador.dispositivo_id,
                    dispositivo_nome: null,
                    empresa_id,
                    descricao: montarDescricaoLog({
                        acao: "UPDATE",
                        entidade: "atuador",
                        registroId: atuador.id,
                        executadoPor:executadoPorId,
                        alteracoes,
                    }),
                },
            });
            return atuador;
        }),
    
    deactivate: (id: number, empresa_id: number, executadoPorId: number)=>
        getPrismaClient().$transaction(async(tx)=>{
            const antes = await tx.atuador.findFirst({
                where: {id, dispositivo:{empresa_id}},select: safeSelect,
            });
            if(!antes) throw new NotFoundError("Atuador nao encontrado");
            const atuador = await tx.atuador.update({
                where:{id}, data: {ativo: false}, select: safeSelect,
            });
            const alteracoes= calcularAlteracoes(antes, atuador, {ativo: false});
            await tx.log.create({
                data: {
                    tabela: "atuador",
                    operacao: "DEACTIVATE",
                    dispositivo_id: atuador.dispositivo_id,
                    dispositivo_nome: null,
                    empresa_id,
                    descricao: montarDescricaoLog({
                        acao: "DEACTIVATE",
                        entidade: "atuador",
                        registroId: atuador.id,
                        executadoPor: executadoPorId,
                        alteracoes,
                    }),
                },
            });
        }),
};