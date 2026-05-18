//singleton para o prismacliente para nao acabar criando tantas conexoes
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | undefined;
export function getPrismaClient(): PrismaClient{
    if(!prisma){
        prisma= new PrismaClient();
    }
    return prisma;
}