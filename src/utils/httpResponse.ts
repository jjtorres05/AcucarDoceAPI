import { HttpResponseInit } from "@azure/functions";
import { AppError } from "./errors";
import { ApiResponse } from "../types";

export function createResponse <T> (
    statusCode: number,
    body: ApiResponse<T>
): HttpResponseInit{
    return{
        status: statusCode,
        headers: { "Content-Type":"application/json"},
        body: JSON.stringify(body),
    }
}

export function ok<T> (data: T, message?: string):
HttpResponseInit{
    return createResponse(200,{success: true, data, message});
}

export function created<T>(data: T, message?: string):
HttpResponseInit{
    return createResponse(201, { success: true, data, message});
}

export function noContent(): HttpResponseInit{
    return {status: 204};
}

export function handleError(error: unknown): HttpResponseInit{
    if (error instanceof AppError){
        return createResponse(error.statusCode,{
            success: false, error: error.message,
        });
    }
    console.error("Erro nao tratado:",error);
    return createResponse(500,{
        success: false,
        error: "Erro interno servidor",
    });
}

