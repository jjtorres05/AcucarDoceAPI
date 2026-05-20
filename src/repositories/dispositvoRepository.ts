import { getPrismaClient } from "../database/prismaClient";
import { calcularAlteracoes,montarDescricaoLog } from "../utils/logHelper";
const safeSelect ={
    id: true,
    empresa_id: true,
    nome_modelo: true,
    ativo: true,
    created_at: true,
}as const;

export const dispositivoRepository={
    findByIdAndEmpresa: (id: number, empresa_id: number)=>
        getPrismaClient().dispositivo.findFirst({
            where:{id,empresa_id}, select: safeSelect,
        }),

    findAllByEmpresa:(empresa_id:number)=>
        getPrismaClient().dispositivo.findMany({
            where: {empresa_id},
            select: safeSelect,
            orderBy: {created_at:"desc"},
        }),
    

    countByEmpresa: (empresa_id: number)=>
        getPrismaClient().dispositivo.count({
            where: {empresa_id},
        }),
    
    findWithHash: (id: number)=>
        getPrismaClient().dispositivo.findUnique({
            where:{id},
            select:{
                id:true,
                empresa_id: true,
                token_dispositivo_hash: true,
                ativo: true,
            },
        }),
    create:(
        data:{
            empresa_id: number;
            nome_modelo: string;
            token_dispositivo_hash: string;
        },
        executadoPorId: number
    )=>
        getPrismaClient().$transaction(async(tx)=>{
            const dispositivo= await tx.dispositivo.create({
                data, select: safeSelect,
            });
            await tx.log.create({
                data: {
                    tabela: "dispositivo",
                    operacao: "CREATE",
                    dispositivo_id: dispositivo.id,
                    dispositivo_nome: dispositivo.nome_modelo,
                    empresa_id: data.empresa_id,
                    descricao: montarDescricaoLog({
                        acao: "CREATE",
                        entidade: "dispositivo",
                        registroId: dispositivo.id,
                        executadoPor: executadoPorId,
                        dados: {
                            nome_modelo: dispositivo.nome_modelo,
                            empresa_id: dispositivo.empresa_id,
                        },
                    }),
                },
            });
            return dispositivo;
        }),
    update: (
        id: number,
        empresa_id: number,
        data: {nome_modelos?: string, ativo?: boolean},
        executadoPorId: number
    )=>
        getPrismaClient().$transaction(async (tx)=> {
            const antes= await tx.dispositivo.findFirst({
                where: {id, empresa_id}, select: safeSelect,
            });
            if(!antes) throw new Error("Dispositivo nao encontrado");
            const dispositivo = await tx.dispositivo.update({
                where: {id}, data, select: safeSelect,
            });

            const alteracoes = calcularAlteracoes(antes, dispositivo, data);
            await tx.log.create({
                data: {
                    tabela: "dispositivo",
                    operacao: "UPDATE",
                    dispositivo_id: dispositivo.id,
                    dispositivo_nome: dispositivo.nome_modelo,
                    empresa_id,
                    descricao: montarDescricaoLog({
                        acao: "UPDATE",
                        entidade: "dispositivo",
                        registroId: dispositivo.id,
                        executadoPor: executadoPorId,
                        alteracoes,
                    }),
                },
            });
            return dispositivo;
        }),
    deactivate: (id: number, empresa_id: number, executadoPorId: number)=>
        getPrismaClient().$transaction(async (tx)=>{
            const antes = await tx.dispositivo.findFirst({
                where: {id, empresa_id},
                select: safeSelect,
            });

            if(!antes) throw new Error("Dispositivo nao encontrado");
            const dispositivo = await tx.dispositivo.update({
                where: {id},
                data: {ativo: false},
                select: safeSelect,
            });

            const alteracoes = calcularAlteracoes(antes, dispositivo,{ativo: false});
            await tx.log.create({
                data:{
                    tabela: "dispositivo",
                    operacao: "DEACTIVATE",
                    dispositivo_id: dispositivo.id,
                    dispositivo_nome: dispositivo.nome_modelo,
                    empresa_id,
                    descricao: montarDescricaoLog({
                        acao: "DEACTIVATE",
                        entidade: "dispositivo",
                        registroId: dispositivo.id,
                        executadoPor: executadoPorId,
                        alteracoes,
                    }),
                },
            });
        }),
    
    updateTokenHash: (
        id: number,
        empresa_id: number,
        token_dispositivo_hash: string,
        executadoPorId: number
    )=>
        getPrismaClient().$transaction(async (tx)=>{
            const dispositivo = await tx.dispositivo.findFirst({
                where: {id, empresa_id}, select: safeSelect,
            });
            if(!dispositivo) throw new Error("Dispositivo nao encontrado");
            
            await tx.dispositivo.update({
                where: {id}, data: {token_dispositivo_hash},
            });

            await tx.log.create({
                data: {
                    tabela: "dispositivo",
                    operacao: "REGENERAR_TOKEN",
                    dispositivo_id: dispositivo.id,
                    dispositivo_nome: dispositivo.nome_modelo,
                    empresa_id,
                    descricao: montarDescricaoLog({
                        acao: "REGENERAR_TOKEN",
                        entidade: "dispositivo",
                        registroId: dispositivo.id,
                        executadoPor: executadoPorId,
                        alteracoes: {
                            token_dispositivo_hash:{
                                antes: "[protegido]",
                                depois: "[protegido]",
                            },
                        },
                    }),
                },
            });
        }),
};
