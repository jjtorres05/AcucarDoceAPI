import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { getConectaApiUrl } from "../utils/conectaApi";
import { setTokenCookie } from "../utils/tokenCookies";
import { extractToken } from "../middleware/authGuard";

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
        if(response.ok && data.token){
            return{
                status: response.status,
                jsonBody: data,
                cookies: [setTokenCookie(data.token)],
            };
        }
        return {
            status: response.status,
            jsonBody: data,
        };
    },

    registro: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        const token= extractToken(request);
        const body = await request.json();
        const response= await fetch(`${getConectaApiUrl()}/usuarios`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
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
        const token = await extractToken(request)
        const response = await fetch(`${getConectaApiUrl()}/empresas`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        const data = await response.json();
        return {
            status: response.status,
            jsonBody: data,
        };
    },
};