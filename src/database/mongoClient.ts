import { MongoClient, Db } from "mongodb";

let client: MongoClient | undefined;
let db: Db | undefined;

export async function getMongoDb(): Promise<Db>{
    if(!db){
        const url= process.env.MONGODB_URL;
        if(!url){
            throw new Error("MONGODB_URL nao esta definida");
        }
        client = new MongoClient(url);
        await client.connect();
        db= client.db("acucar_doce");
    }
    return db;
}

export async function closeMongoConnection():Promise<void>{
    if (client){
        await client.close();
        client= undefined;
        db= undefined;
    }
}