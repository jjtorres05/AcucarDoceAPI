import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { getConectaApiUrl } from "../utils/conectaApi";

export const authHandler = {
    login: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        const body = await request.text();
        const response = await fetch(`${getConectaApiUrl()}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: body,
        });
        const data = await response.json();
        return {
            status: response.status,
            jsonBody: data,
        };
    },

    registro: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        const body = await request.json();
        const authHeader = request.headers.get("authorization");
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (authHeader) {
            headers["Authorization"] = authHeader;
        }
        const response = await fetch(`${getConectaApiUrl()}/usuarios`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return {
            status: response.status,
            jsonBody: data,
        };
    },

    listarEmpresas: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return {
                status: 401,
                jsonBody: { success: false, error: "header authorization ausente" },
            };
        }
        const response = await fetch(`${getConectaApiUrl()}/empresas`, {
            method: "GET",
            headers: {
                "Authorization": authHeader,
            },
        });
        const data = await response.json();
        return {
            status: response.status,
            jsonBody: data,
        };
    },
};