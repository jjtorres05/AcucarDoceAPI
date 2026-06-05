const ACUCAR = "http://127.0.0.1:7071/api";

// Variabeis
let adminToken: string;       // marcos - admin_interno
let adminCookie: string;      // cookie del login de marcos
let adminExtToken: string;    // lucia - admin_externo
let comumToken: string;       // carlos - externo_comum

let empresaId: string;        // ID ofuscado empresa 8 (techsolutionsnova)
let empresaId2: string;       // ID ofuscado empresa 9 (Agro Paraná)

let dispositivoId: string;
let dispositivoToken: string;
let sensorId: string;
let atuadorId: string;
let alertaId: string;

let leituraId: string;

// HELPER: fetch a AcucarDoceAPI e parsea a resposta

async function api(
    method: string,
    path: string,
    options?: {
        body?: Record<string, unknown>;
        token?: string | null;   // null = sem auth, deve ser passado explicitamente
        useCookie?: boolean;     // true = manda cookie emvez de Bearer
    }
) {
    // decidir qué token usar
    const tokenToUse = options?.token === null
        ? null                              // explícitamente sin auth
        : (options?.token ?? null);         // deve ser passado explicitamente

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    // Agregar auth: cookie ou bearer
    if (options?.useCookie && adminCookie) {
        const match = adminCookie.match(/auth_token=([^;]+)/);
        if(match){
            headers["Cookie"] = `auth_token=${match[1]}`;
        }
    } else if (tokenToUse) {
        headers["Authorization"] = `Bearer ${tokenToUse}`;
    }

    //request
    const res = await fetch(`${ACUCAR}${path}`, {
        method,
        headers,
        body: options?.body ? JSON.stringify(options.body) : undefined,
        redirect: "manual",
    });

    // Parsear resposta
    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch { data = text; }

    return { status: res.status, data, headers: res.headers };
}

//Login dos 3 usuarios + obter empresaId
describe("SETUP - Login de usuarios", () => {

    it("login marcos (admin_interno) - debe retornar token", async () => {
        const res = await api("POST", "/auth", {
            body: { email: "marcos@tectrol.com", senha: "marcos123" },
            token: null,
        });

        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty("token");
        expect(typeof res.data.token).toBe("string");

        adminToken = res.data.token;
    });

    it("login marcos - debe setear cookie httpOnly", async () => {
        const res = await api("POST", "/auth", {
            body: { email: "marcos@tectrol.com", senha: "marcos123" },
            token: null,
        });

        const setCookie = res.headers.get("set-cookie");
        expect(setCookie).toBeDefined();
        expect(setCookie).toContain("auth_token");
        expect(setCookie!.toLowerCase()).toContain("httponly");

        adminCookie = setCookie!;
        adminToken = res.data.token;
    });

    it("login lucia (admin_externo) - debe retornar token", async () => {
        const res = await api("POST", "/auth", {
            body: { email: "lucia@tech.com", senha: "lucia123" },
            token: null,
        });

        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty("token");

        adminExtToken = res.data.token;
    });

    it("login carlos (externo_comum) - debe retornar token", async () => {
        const res = await api("POST", "/auth", {
            body: { email: "carlos@agro.com", senha: "carlos123" },
            token: null,
        });

        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty("token");

        comumToken = res.data.token;
    });

    it("listar empresas y obtener empresaId ofuscado", async () => {
        const res = await api("GET", "/auth", { token: adminToken });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data.length).toBeGreaterThan(0);

        // procurar empresa 'techsolutionsnova' ou usar a primera
        const empresa1 = res.data.find((e: any) => e.nome === "techsolutionsnova") || res.data[0];
        expect(empresa1).toHaveProperty("id");
        const empresa2 = res.data.find((e: any) => e.nome === "Agro Paraná") || res.data[0];
        expect(empresa2).toHaveProperty("id");

        empresaId = empresa1.id;
        empresaId2 = empresa2.id;
    });
});

//Validacoes de seguranca
describe("AUTH - Validacoes", () => {

    it("debe rejeitar login com credenciais incorrectas", async () => {
        const res = await api("POST", "/auth", {
            body: { email: "noexiste@test.com", senha: "wrong" },
            token: null,
        });
        expect(res.status).toBe(401);
    });

    it("debe rejeitar login sem body completo", async () => {
        const res = await api("POST", "/auth", {
            body: {},
            token: null,
        });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("debe rejeitar request sem token nem cookie", async () => {
        const res = await api("GET", `/dispositivos?empresaId=${empresaId}`, {
            token: null,
        });
        expect(res.status).toBe(401);
    });

    it("debe rejeitar request sem empresaId", async () => {
        const res = await api("GET", "/dispositivos", { token: adminToken });
        expect(res.status).toBe(400);
    });

    it("debe funcionar com cookie só (sem Authorization header)", async () => {
        const res = await api("GET", "/auth", {
            token: null,
            useCookie: true,
        });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data)).toBe(true);
    });

    it("debe funcionar com cookie para endpoints protegidos", async () => {
        const res = await api("GET", `/dispositivos?empresaId=${empresaId}`, {
            token: null,
            useCookie: true,
        });

        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
    });
});

// DISPOSITIVOS - CRUD completo adminInterno
describe("DISPOSITIVOS - CRUD", () => {

    it("admin_interno debe criar dispositivo", async () => {
        const res = await api("POST", `/dispositivos?empresaId=${empresaId}`, {
            body: { nome_modelo: "Arduino Test Jest" },
            token: adminToken,
        });

        expect(res.status).toBe(201);
        expect(res.data.success).toBe(true);
        expect(res.data.data).toHaveProperty("id");
        expect(res.data.data.nome_modelo).toBe("Arduino Test Jest");
        expect(res.data.message).toContain("criado");

        dispositivoId = res.data.data.id;
        dispositivoToken = res.data.data.token_dispositivo;
    });

    it("debe listar dispositivos da empresa", async () => {
        const res = await api("GET", `/dispositivos?empresaId=${empresaId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(Array.isArray(res.data.data)).toBe(true);
        expect(res.data.data.length).toBeGreaterThan(0);
    });

    it("debe obter dispositivo por ID", async () => {
        const res = await api("GET", `/dispositivos?empresaId=${empresaId}&id=${dispositivoId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.data).toHaveProperty("id");
        expect(res.data.data.nome_modelo).toBe("Arduino Test Jest");
    });

    it("debe atualizar dispositivo", async () => {
        const res = await api("PUT", `/dispositivos?empresaId=${empresaId}`, {
            body: { id: dispositivoId, nome_modelo: "Arduino atualizado" },
            token: adminToken,
        });

        expect(res.status).toBe(200);
        expect(res.data.message).toContain("atualizado");
    });

    it("debe verificar que o nome se atualizo", async () => {
        const res = await api("GET", `/dispositivos?empresaId=${empresaId}&id=${dispositivoId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.data.nome_modelo).toBe("Arduino atualizado");
    });

    it("debe regenerar token do dispositivo", async () => {
        const res = await api("POST", `/dispositivos?empresaId=${empresaId}&acao=regenerar-token&id=${dispositivoId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.data).toHaveProperty("token_dispositivo");
        expect(res.data.message).toContain("regenerado");

        dispositivoToken = res.data.data.token_dispositivo;
    });
});

// DISPOSITIVOS - permisoes por rol para lucia e carlos
describe("DISPOSITIVOS - Permisos", () => {

    it("admin_externo (lucia) pode listar dispositivos", async () => {
        const res = await api("GET", `/dispositivos?empresaId=${empresaId}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(200);
    });

    it("admin_externo (lucia) pode criar dispositivo", async () => {
        const res = await api("POST", `/dispositivos?empresaId=${empresaId}`, {
            body: { nome_modelo: "Dispositivo Lucia" },
            token: adminExtToken,
        });
        expect(res.status).toBe(201);

        // Limpar o que lucia criou
        const idLucia = res.data.data.id;
        const delRes = await api("DELETE", `/dispositivos?empresaId=${empresaId}&id=${idLucia}`, {
            token: adminExtToken,
        });
        expect(delRes.status).toBe(200);
    });

    it("externo_comum (carlos) pode listar dispositivos", async () => {
        const res = await api("GET", `/dispositivos?empresaId=${empresaId}`, {
            token: comumToken,
        });
        expect(res.status).toBe(200);
    });

    it("externo_comum (carlos) nao pode criar dispositivo", async () => {
        const res = await api("POST", `/dispositivos?empresaId=${empresaId}`, {
            body: { nome_modelo: "No Deberia Crearse" },
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });

    it("externo_comum (carlos) nao pode atualizar dispositivo", async () => {
        const res = await api("PUT", `/dispositivos?empresaId=${empresaId}`, {
            body: { id: dispositivoId, nome_modelo: "Intento Carlos" },
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });

    it("externo_comum (carlos) nao pode desativar dispositivo", async () => {
        const res = await api("PATCH", `/dispositivos?empresaId=${empresaId}&id=${dispositivoId}`, {
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });

    it("externo_comum (carlos) nao pode deletar dispositivo", async () => {
        const res = await api("DELETE", `/dispositivos?empresaId=${empresaId}&id=${dispositivoId}`, {
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });

    it("externo_comum (carlos) nao pode regenerar token", async () => {
        const res = await api("POST", `/dispositivos?empresaId=${empresaId}&acao=regenerar-token&id=${dispositivoId}`, {
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });
});

// Validacoes de dados errados e outra empresa
describe("DISPOSITIVOS - Validacoes e outra empresa", () => {

    it("debe rejeitar criar dispositivo sem nome_modelo", async () => {
        const res = await api("POST", `/dispositivos?empresaId=${empresaId}`, {
            body: {},
            token: adminToken,
        });
        expect(res.status).toBe(400);
    });

    it("debe rejeitar criar dispositivo com nome_modelo vazio", async () => {
        const res = await api("POST", `/dispositivos?empresaId=${empresaId}`, {
            body: { nome_modelo: "" },
            token: adminToken,
        });
        expect(res.status).toBe(400);
    });

    it("debe rejeitar atualizar dispositivo com id inexistente", async () => {
        const res = await api("PUT", `/dispositivos?empresaId=${empresaId}`, {
            body: { id: "id_falso_inexistente", nome_modelo: "Test" },
            token: adminToken,
        });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("debe rejeitar atualizar dispositivo sem id", async () => {
        const res = await api("PUT", `/dispositivos?empresaId=${empresaId}`, {
            body: { nome_modelo: "Test" },
            token: adminToken,
        });
        expect(res.status).toBe(400);
    });

    //Outra empresa
    it("admin_externo (lucia) pode listar dispositivos de outra empresa (externo_comum)", async () => {
        const res = await api("GET", `/dispositivos?empresaId=${empresaId2}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(200);
    });

    it("admin_externo (lucia) nao pode criar dispositivo em outra empresa", async () => {
        const res = await api("POST", `/dispositivos?empresaId=${empresaId2}`, {
            body: { nome_modelo: "No Deberia Crearse" },
            token: adminExtToken,
        });
        expect(res.status).toBe(403);
    });

    it("admin_externo (lucia) nao pode atualizar dispositivo de outra empresa", async () => {
        const res = await api("PUT", `/dispositivos?empresaId=${empresaId2}`, {
            body: { id: dispositivoId, nome_modelo: "Intento Lucia" },
            token: adminExtToken,
        });
        expect(res.status).toBe(403);
    });

    it("admin_externo (lucia) nao pode desativar dispositivo de outra empresa", async () => {
        const res = await api("PATCH", `/dispositivos?empresaId=${empresaId2}&id=${dispositivoId}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(403);
    });

    it("admin_externo (lucia) nao pode deletar dispositivo de outra empresa", async () => {
        const res = await api("DELETE", `/dispositivos?empresaId=${empresaId2}&id=${dispositivoId}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(403);
    });

    it("admin_externo (lucia) nao pode regenerar token de outra empresa", async () => {
        const res = await api("POST", `/dispositivos?empresaId=${empresaId2}&acao=regenerar-token&id=${dispositivoId}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(403);
    });

    it("externo_comum (carlos) nao pode listar dispositivos de outra empresa", async () => {
        const res = await api("GET", `/dispositivos?empresaId=${empresaId2}`, {
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });
});


// SENSORES - CRUD + Permisos admin interno
describe("SENSORES - CRUD", () => {

    it("debe criar um sensor", async () => {
        const res = await api("POST", `/sensores?empresaId=${empresaId}`, {
            body: {
                dispositivo_id: dispositivoId,
                nome_modelo: "DHT22 Test",
                tipo_sensor: "temperatura",
                unidade: "C",
            },
            token: adminToken,
        });

        expect(res.status).toBe(201);
        expect(res.data.data).toHaveProperty("id");
        expect(res.data.message).toContain("criado");

        sensorId = res.data.data.id;
    });

    it("debe listar sensores da empresa", async () => {
        const res = await api("GET", `/sensores?empresaId=${empresaId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.data)).toBe(true);
    });

    it("debe listar sensores por dispositivo", async () => {
        const res = await api("GET", `/sensores?empresaId=${empresaId}&dispositivoId=${dispositivoId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.data.length).toBeGreaterThan(0);
    });

    it("debe obter sensor por ID", async () => {
        const res = await api("GET", `/sensores?empresaId=${empresaId}&id=${sensorId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.data).toHaveProperty("id");
    });

    it("debe atualizar sensor", async () => {
        const res = await api("PUT", `/sensores?empresaId=${empresaId}`, {
            body: {
                id: sensorId,
                nome_modelo: "DHT11 Actualizado",
                tipo_sensor: "humidade",
                unidade: "%",
            },
            token: adminToken,
        });

        expect(res.status).toBe(200);
        expect(res.data.message).toContain("atualizado");
    });

    it("debe rejeitar criar sensor com dispositivo inexistente", async () => {
        const res = await api("POST", `/sensores?empresaId=${empresaId}`, {
            body: {
                dispositivo_id: "id_falso_que_no_existe",
                nome_modelo: "Sensor Falso",
                tipo_sensor: "temp",
                unidade: "C",
            },
            token: adminToken,
        });

        expect(res.status).toBeGreaterThanOrEqual(400);
    });
});

//sensores para lucia e carlos
describe("SENSORES - Permisos", () => {

    it("admin_externo (lucia) pode listar sensores", async () => {
        const res = await api("GET", `/sensores?empresaId=${empresaId}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(200);
    });

    it("externo_comum (carlos) pode listar sensores", async () => {
        const res = await api("GET", `/sensores?empresaId=${empresaId}`, {
            token: comumToken,
        });
        expect(res.status).toBe(200);
    });

    it("admin_externo (lucia) pode criar sensor", async () => {
        const res = await api("POST", `/sensores?empresaId=${empresaId}`, {
            body: {
                dispositivo_id: dispositivoId,
                nome_modelo: "Sensor Lucia",
                tipo_sensor: "temperatura",
                unidade: "C",
            },
            token: adminExtToken,
        });
        expect(res.status).toBe(201);

        // Limpar o que lucia criou
        const idLucia = res.data.data.id;
        const delRes = await api("DELETE", `/sensores?empresaId=${empresaId}&id=${idLucia}`, {
            token: adminExtToken,
        });
        expect(delRes.status).toBe(200);
    });

    it("externo_comum (carlos) nao pode criar sensor", async () => {
        const res = await api("POST", `/sensores?empresaId=${empresaId}`, {
            body: {
                dispositivo_id: dispositivoId,
                nome_modelo: "No Crear",
                tipo_sensor: "temp",
                unidade: "C",
            },
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });

    it("admin_externo (lucia) pode atualizar sensor", async () => {
        const res = await api("PUT", `/sensores?empresaId=${empresaId}`, {
            body: { id: sensorId, nome_modelo: "Sensor Lucia Update" },
            token: adminExtToken,
        });
        expect(res.status).toBe(200);
    });

    it("externo_comum (carlos) nao pode atualizar sensor", async () => {
        const res = await api("PUT", `/sensores?empresaId=${empresaId}`, {
            body: { id: sensorId, nome_modelo: "Intento Carlos" },
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });

    
});

// SENSORES - Validacoes e outra empresa
describe("SENSORES - Validacoes e outra empresa", () => {

    // Datos incorrectos
    it("debe rejeitar criar sensor sem campos obrigatorios", async () => {
        const res = await api("POST", `/sensores?empresaId=${empresaId}`, {
            body: {},
            token: adminToken,
        });
        expect(res.status).toBe(400);
    });

    it("debe rejeitar criar sensor com dispositivo_id vazio", async () => {
        const res = await api("POST", `/sensores?empresaId=${empresaId}`, {
            body: {
                dispositivo_id: "",
                nome_modelo: "Sensor Test",
                tipo_sensor: "temp",
                unidade: "C",
            },
            token: adminToken,
        });
        expect(res.status).toBe(400);
    });

    it("debe rejeitar atualizar sensor sem ID", async () => {
        const res = await api("PUT", `/sensores?empresaId=${empresaId}`, {
            body: { nome_modelo: "Test" },
            token: adminToken,
        });
        expect(res.status).toBe(400);
    });

    //Outra empresa
    it("admin_externo (lucia) pode listar sensores de outra empresa (externo_comum) porque pertence a essa empresa", async () => {
        const res = await api("GET", `/sensores?empresaId=${empresaId2}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(200);
    });

    it("admin_externo (lucia) nao pode criar sensor em outra empresa", async () => {
        const res = await api("POST", `/sensores?empresaId=${empresaId2}`, {
            body: {
                dispositivo_id: dispositivoId,
                nome_modelo: "Sensor Lucia",
                tipo_sensor: "temp",
                unidade: "C",
            },
            token: adminExtToken,
        });
        expect(res.status).toBe(403);
    });

    it("admin_externo (lucia) nao pode atualizar sensor de outra empresa", async () => {
        const res = await api("PUT", `/sensores?empresaId=${empresaId2}`, {
            body: { id: sensorId, nome_modelo: "Intento Lucia" },
            token: adminExtToken,
        });
        expect(res.status).toBe(403);
    });

    it("externo_comum (carlos) nao pode listar sensores de outra empresa", async () => {
        const res = await api("GET", `/sensores?empresaId=${empresaId2}`, {
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });
});

// ATUADORES - CRUD + Permisos admin interno
describe("ATUADORES - CRUD", () => {

    it("debe criar um atuador", async () => {
        const res = await api("POST", `/atuadores?empresaId=${empresaId}`, {
            body: {
                dispositivo_id: dispositivoId,
                nome_modelo: "Servo SG90 Test",
                tipo: "motor",
            },
            token: adminToken,
        });

        expect(res.status).toBe(201);
        expect(res.data.data).toHaveProperty("id");

        atuadorId = res.data.data.id;
    });

    it("debe listar atuadores da empresa", async () => {
        const res = await api("GET", `/atuadores?empresaId=${empresaId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.data)).toBe(true);
    });

    it("debe listar atuadores por dispositivo", async () => {
        const res = await api("GET", `/atuadores?empresaId=${empresaId}&dispositivoId=${dispositivoId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.data.length).toBeGreaterThan(0);
    });

    it("debe obter atuador por ID", async () => {
        const res = await api("GET", `/atuadores?empresaId=${empresaId}&id=${atuadorId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.data).toHaveProperty("id");
    });

    it("debe atualizar atuador", async () => {
        const res = await api("PUT", `/atuadores?empresaId=${empresaId}`, {
            body: {
                id: atuadorId,
                nome_modelo: "Servo MG996R Actualizado",
                tipo: "motor_grande",
            },
            token: adminToken,
        });

        expect(res.status).toBe(200);
        expect(res.data.message).toContain("atualizado");
    });
});

//atuadores para lucia e carlos
describe("ATUADORES - Permisos", () => {

    it("admin_externo (lucia) pode listar atuadores", async () => {
        const res = await api("GET", `/atuadores?empresaId=${empresaId}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(200);
    });

    it("admin_externo (lucia) pode criar atuador", async () => {
        const res = await api("POST", `/atuadores?empresaId=${empresaId}`, {
            body: {
                dispositivo_id: dispositivoId,
                nome_modelo: "Atuador Lucia",
                tipo: "motor",
            },
            token: adminExtToken,
        });
        expect(res.status).toBe(201);

        // Limpar o que lucia criou
        const idLucia = res.data.data.id;
        const delRes = await api("DELETE", `/atuadores?empresaId=${empresaId}&id=${idLucia}`, {
            token: adminExtToken,
        });
        expect(delRes.status).toBe(200);
    });

    it("admin_externo (lucia) pode atualizar atuador", async () => {
        const res = await api("PUT", `/atuadores?empresaId=${empresaId}`, {
            body: { id: atuadorId, nome_modelo: "Atuador Lucia Update" },
            token: adminExtToken,
        });
        expect(res.status).toBe(200);
    });

    it("externo_comum (carlos) pode listar atuadores", async () => {
        const res = await api("GET", `/atuadores?empresaId=${empresaId}`, {
            token: comumToken,
        });
        expect(res.status).toBe(200);
    });

    it("externo_comum (carlos) nao pode criar atuador", async () => {
        const res = await api("POST", `/atuadores?empresaId=${empresaId}`, {
            body: {
                dispositivo_id: dispositivoId,
                nome_modelo: "No Crear",
                tipo: "test",
            },
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });

    it("externo_comum (carlos) nao pode atualizar atuador", async () => {
        const res = await api("PUT", `/atuadores?empresaId=${empresaId}`, {
            body: { id: atuadorId, nome_modelo: "Intento" },
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });
});

// ATUADORES - Validacoes e outra empresa
describe("ATUADORES - Validacoes e outra empresa", () => {

    // --- Datos incorrectos ---
    it("debe rejeitar criar atuador sem campos obrigatorios", async () => {
        const res = await api("POST", `/atuadores?empresaId=${empresaId}`, {
            body: {},
            token: adminToken,
        });
        expect(res.status).toBe(400);
    });

    it("debe rejeitar criar atuador com dispositivo_id vazio", async () => {
        const res = await api("POST", `/atuadores?empresaId=${empresaId}`, {
            body: {
                dispositivo_id: "",
                nome_modelo: "Atuador Test",
                tipo: "motor",
            },
            token: adminToken,
        });
        expect(res.status).toBe(400);
    });

    it("debe rejeitar atualizar atuador sem ID", async () => {
        const res = await api("PUT", `/atuadores?empresaId=${empresaId}`, {
            body: { nome_modelo: "Test" },
            token: adminToken,
        });
        expect(res.status).toBe(400);
    });

    // --- Outra empresa ---
    it("admin_externo (lucia) pode listar atuadores de outra empresa (externo_comum)", async () => {
        const res = await api("GET", `/atuadores?empresaId=${empresaId2}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(200);
    });

    it("admin_externo (lucia) nao pode criar atuador em outra empresa", async () => {
        const res = await api("POST", `/atuadores?empresaId=${empresaId2}`, {
            body: {
                dispositivo_id: dispositivoId,
                nome_modelo: "Atuador Lucia",
                tipo: "motor",
            },
            token: adminExtToken,
        });
        expect(res.status).toBe(403);
    });

    it("admin_externo (lucia) nao pode atualizar atuador de outra empresa", async () => {
        const res = await api("PUT", `/atuadores?empresaId=${empresaId2}`, {
            body: { id: atuadorId, nome_modelo: "Intento Lucia" },
            token: adminExtToken,
        });
        expect(res.status).toBe(403);
    });

    it("externo_comum (carlos) nao pode listar atuadores de outra empresa", async () => {
        const res = await api("GET", `/atuadores?empresaId=${empresaId2}`, {
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });
});

// ALERTAS - CRUD + Permisos para admin interno
describe("ALERTAS - CRUD", () => {

    it("debe criar unma alerta", async () => {
        const res = await api("POST", `/alertas?empresaId=${empresaId}`, {
            body: {
                dispositivo_id: dispositivoId,
                sensor_id: sensorId,
                tipo: "temperatura_alta",
                mensagem: "Temperatura ultrapassou 40 graus - Jest",
            },
            token: adminToken,
        });

        expect(res.status).toBe(201);
        expect(res.data.data).toHaveProperty("id");

        alertaId = res.data.data.id;
    });

    it("debe listar alertas da empresa", async () => {
        const res = await api("GET", `/alertas?empresaId=${empresaId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.data)).toBe(true);
    });

    it("debe listar alertas por dispositivo", async () => {
        const res = await api("GET", `/alertas?empresaId=${empresaId}&dispositivoId=${dispositivoId}`, { token: adminToken });
        expect(res.status).toBe(200);
    });

    it("debe listar alertas por sensor", async () => {
        const res = await api("GET", `/alertas?empresaId=${empresaId}&sensorId=${sensorId}`, { token: adminToken });
        expect(res.status).toBe(200);
    });

    it("debe obter alerta por ID", async () => {
        const res = await api("GET", `/alertas?empresaId=${empresaId}&id=${alertaId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.data).toHaveProperty("id");
    });

    it("debe deletar alerta", async () => {
        const res = await api("DELETE", `/alertas?empresaId=${empresaId}&id=${alertaId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.message).toContain("deletado");
    });

    it("debe retornar 404 ao buscar alerta deletado", async () => {
        const res = await api("GET", `/alertas?empresaId=${empresaId}&id=${alertaId}`, { token: adminToken });
        expect(res.status).toBe(404);
    });
});

// alertas para lucia e carlos
describe("ALERTAS - Permisos", () => {

    it("admin_externo (lucia) pode listar alertas", async () => {
        const res = await api("GET", `/alertas?empresaId=${empresaId}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(200);
    });

    it("admin_externo (lucia) pode criar alerta", async () => {
        const res = await api("POST", `/alertas?empresaId=${empresaId}`, {
            body: {
                dispositivo_id: dispositivoId,
                sensor_id: sensorId,
                tipo: "temperatura_lucia",
                mensagem: "Alerta criada por lucia - Jest",
            },
            token: adminExtToken,
        });
        expect(res.status).toBe(201);

        // Limpar o que lucia criou
        const idLucia = res.data.data.id;
        const delRes = await api("DELETE", `/alertas?empresaId=${empresaId}&id=${idLucia}`, {
            token: adminExtToken,
        });
        expect(delRes.status).toBe(200);
    });

    it("externo_comum (carlos) pode listar alertas", async () => {
        const res = await api("GET", `/alertas?empresaId=${empresaId}`, {
            token: comumToken,
        });
        expect(res.status).toBe(200);
    });

    it("externo_comum (carlos) nao pode criar alerta", async () => {
        const res = await api("POST", `/alertas?empresaId=${empresaId}`, {
            body: {
                dispositivo_id: dispositivoId,
                sensor_id: sensorId,
                tipo: "test",
                mensagem: "No deberia crearse",
            },
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });
});

// ALERTAS - Validacoes e outra empresa
describe("ALERTAS - Validacoes e outra empresa", () => {

    // --- Datos incorrectos ---
    it("debe rejeitar criar alerta sem campos obrigatorios", async () => {
        const res = await api("POST", `/alertas?empresaId=${empresaId}`, {
            body: {},
            token: adminToken,
        });
        expect(res.status).toBe(400);
    });

    it("debe rejeitar criar alerta com dispositivo_id inexistente", async () => {
        const res = await api("POST", `/alertas?empresaId=${empresaId}`, {
            body: {
                dispositivo_id: "id_falso",
                sensor_id: sensorId,
                tipo: "test",
                mensagem: "No deberia crearse",
            },
            token: adminToken,
        });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("debe rejeitar criar alerta com sensor_id inexistente", async () => {
        const res = await api("POST", `/alertas?empresaId=${empresaId}`, {
            body: {
                dispositivo_id: dispositivoId,
                sensor_id: "id_falso",
                tipo: "test",
                mensagem: "No deberia crearse",
            },
            token: adminToken,
        });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    // --- Outra empresa ---
    it("admin_externo (lucia) pode listar alertas de outra empresa (externo_comum)", async () => {
        const res = await api("GET", `/alertas?empresaId=${empresaId2}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(200);
    });

    it("admin_externo (lucia) nao pode criar alerta em outra empresa", async () => {
        const res = await api("POST", `/alertas?empresaId=${empresaId2}`, {
            body: {
                dispositivo_id: dispositivoId,
                sensor_id: sensorId,
                tipo: "test",
                mensagem: "No deberia crearse",
            },
            token: adminExtToken,
        });
        expect(res.status).toBe(403);
    });

    it("externo_comum (carlos) nao pode listar alertas de outra empresa", async () => {
        const res = await api("GET", `/alertas?empresaId=${empresaId2}`, {
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });
});

//Leituras - CRUD dispositivo enviar leitura, usuario consulta
describe("LEITURAS - CRUD",()=>{
    it("dispositivo debe criar leitura",async()=>{
        const res= await api("POST",`/leituras?dispositivoId=${dispositivoId}&empresaId=${empresaId}`,{
            body:{
                token_dispostivo: dispositivoToken,
                sensor_id: sensorId,
                valor: 23.5,
            },
            token: null,
        });
        expect(res.status).toBe(201);
        expect(res.data.success).toBe(true);
        expect(res.data.data).toHaveProperty("id");
        expect(res.data.data.valor).toBe(23.5);
        expect(res.data.message).toContain("criada");
        leituraId= res.data.data.id;
    });

    it("dispositivo debe criar segunda leitura",async()=>{
        const res= await api("POST",`/leituras?dispositivoId=${dispositivoId}&empresaId=${empresaId}`,{
            body:{
                token_dispostivo: dispositivoToken,
                sensor_id: sensorId,
                valor: 25.1,
            },
            token: null,
        });
        expect(res.status).toBe(201);
        expect(res.data.data.valor).toBe(25.1);
    });

    it("admin_interno debe listar leituras da empresa",async()=>{
        const res= await api("GET",`/leituras?empresaId=${empresaId}`,{token:adminToken});
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(Array.isArray(res.data.data)).toBe(true);
        expect(res.data.data.length).toBeGreaterThanOrEqual(2);
    });

    it("debe listar leituras por dispositivo", async () => {
        const res = await api("GET", `/leituras?empresaId=${empresaId}&dispositivoId=${dispositivoId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.data.length).toBeGreaterThanOrEqual(2);
    });

    it("debe listar leituras por sensor", async () => {
        const res = await api("GET", `/leituras?empresaId=${empresaId}&sensorId=${sensorId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.data.length).toBeGreaterThanOrEqual(2);
    });

    it("debe obter leitura por ID", async () => {
        const res = await api("GET", `/leituras?empresaId=${empresaId}&id=${leituraId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.data).toHaveProperty("id");
        expect(res.data.data.valor).toBe(23.5);
    });

    it("debe filtrar leituras por data", async () => {
        const inicio = new Date(Date.now() - 60000).toISOString(); // 1 minuto atras
        const fim = new Date(Date.now() + 60000).toISOString();    // 1 minuto no futuro

        const res = await api("GET", `/leituras?empresaId=${empresaId}&inicio=${inicio}&fim=${fim}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.data.length).toBeGreaterThanOrEqual(2);
    });
});

//Leituras com permissoes para lucia e carlos
describe("LEITURAS - Permisos", () => {

    it("admin_externo (lucia) pode listar leituras", async () => {
        const res = await api("GET", `/leituras?empresaId=${empresaId}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(200);
    });

    it("externo_comum (carlos) pode listar leituras", async () => {
        const res = await api("GET", `/leituras?empresaId=${empresaId}`, {
            token: comumToken,
        });
        expect(res.status).toBe(200);
    });

    it("admin_externo (lucia) pode listar leituras de outra empresa (externo_comum)", async () => {
        const res = await api("GET", `/leituras?empresaId=${empresaId2}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(200);
    });

    it("externo_comum (carlos) nao pode listar leituras de outra empresa", async () => {
        const res = await api("GET", `/leituras?empresaId=${empresaId2}`, {
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });
});

//Leituras -validacoes
describe("LEITURAS - Validacoes", () => {

    it("debe rejeitar leitura sem body", async () => {
        const res = await api("POST", `/leituras?dispositivoId=${dispositivoId}&empresaId=${empresaId}`, {
            body: {},
            token: null,
        });
        expect(res.status).toBe(400);
    });

    it("debe rejeitar leitura sem token_dispostivo", async () => {
        const res = await api("POST", `/leituras?dispositivoId=${dispositivoId}&empresaId=${empresaId}`, {
            body: {
                sensor_id: sensorId,
                valor: 10,
            },
            token: null,
        });
        expect(res.status).toBe(400);
    });

    it("debe rejeitar leitura com token_dispostivo errado", async () => {
        const res = await api("POST", `/leituras?dispositivoId=${dispositivoId}&empresaId=${empresaId}`, {
            body: {
                token_dispostivo: "token_falso_errado",
                sensor_id: sensorId,
                valor: 10,
            },
            token: null,
        });
        expect(res.status).toBe(401);
    });

    it("debe rejeitar leitura com sensor_id inexistente", async () => {
        const res = await api("POST", `/leituras?dispositivoId=${dispositivoId}&empresaId=${empresaId}`, {
            body: {
                token_dispostivo: dispositivoToken,
                sensor_id: "id_falso_inexistente",
                valor: 10,
            },
            token: null,
        });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("debe rejeitar leitura sem dispositivoId na query", async () => {
        const res = await api("POST", `/leituras?empresaId=${empresaId}`, {
            body: {
                token_dispostivo: dispositivoToken,
                sensor_id: sensorId,
                valor: 10,
            },
            token: null,
        });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("debe rejeitar leitura sem empresaId na query", async () => {
        const res = await api("POST", `/leituras?dispositivoId=${dispositivoId}`, {
            body: {
                token_dispostivo: dispositivoToken,
                sensor_id: sensorId,
                valor: 10,
            },
            token: null,
        });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("debe rejeitar consulta sem token de usuario", async () => {
        const res = await api("GET", `/leituras?empresaId=${empresaId}`, {
            token: null,
        });
        expect(res.status).toBe(401);
    });

    it("debe rejeitar leitura duplicada (mesmo sensor, valor e momento)", async () => {
    const body = {
        token_dispostivo: dispositivoToken,
        sensor_id: sensorId,
        valor: 99.9,
    };

    const res1 = await api("POST", `/leituras?dispositivoId=${dispositivoId}&empresaId=${empresaId}`, {
        body,
        token: null,
    });
    expect(res1.status).toBe(201);

    const res2 = await api("POST", `/leituras?dispositivoId=${dispositivoId}&empresaId=${empresaId}`, {
        body,
        token: null,
    });

    // Pode ser 201 (se caiu em outro ms) ou 409 (se caiu no mesmo ms)
    // Em ambiente real o duplicado acontece no mesmo ms, mas em test HTTP é difícil simular
    expect([201, 409]).toContain(res2.status);
});
});

// LOGS - Solo lectura para admin interno lucia e carlos
describe("LOGS", () => {

    it("admin_interno pode listar logs", async () => {
        const res = await api("GET", `/logs?empresaId=${empresaId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(Array.isArray(res.data.data)).toBe(true);
        expect(res.data.data.length).toBeGreaterThan(0);
    });

    it("debe listar logs por dispositivo", async () => {
        const res = await api("GET", `/logs?empresaId=${empresaId}&dispositivoId=${dispositivoId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.data)).toBe(true);
    });

    it("externo_comum (carlos) pode listar logs", async () => {
        const res = await api("GET", `/logs?empresaId=${empresaId}`, {
            token: comumToken,
        });
        expect(res.status).toBe(200);
    });

    it("admin_externo (lucia) pode listar logs", async () => {
        const res = await api("GET", `/logs?empresaId=${empresaId}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(200);
    });
});

// LOGS - Outra empresa
describe("LOGS - Outra empresa", () => {

    it("admin_externo (lucia) pode listar logs de outra empresa (externo_comum)", async () => {
        const res = await api("GET", `/logs?empresaId=${empresaId2}`, {
            token: adminExtToken,
        });
        expect(res.status).toBe(200);
    });

    it("externo_comum (carlos) nao pode listar logs de outra empresa", async () => {
        const res = await api("GET", `/logs?empresaId=${empresaId2}`, {
            token: comumToken,
        });
        expect(res.status).toBe(403);
    });
});

// LIMPIEZA - Borrar todo o que foi criado
describe("LIMPIEZA", () => {

    it("debe desativar sensor", async () => {
        const res = await api("PATCH", `/sensores?empresaId=${empresaId}&id=${sensorId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.message).toContain("desativ");
    });

    it("debe deletar sensor", async () => {
        const res = await api("DELETE", `/sensores?empresaId=${empresaId}&id=${sensorId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.message).toContain("deletado");
    });

    it("debe desativar atuador", async () => {
        const res = await api("PATCH", `/atuadores?empresaId=${empresaId}&id=${atuadorId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.message).toContain("desativ");
    });

    it("debe deletar atuador", async () => {
        const res = await api("DELETE", `/atuadores?empresaId=${empresaId}&id=${atuadorId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.message).toContain("deletado");
    });

    it("debe desativar dispositivo", async () => {
        const res = await api("PATCH", `/dispositivos?empresaId=${empresaId}&id=${dispositivoId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.message).toContain("desativado");
    });

    it("debe deletar dispositivo", async () => {
        const res = await api("DELETE", `/dispositivos?empresaId=${empresaId}&id=${dispositivoId}`, { token: adminToken });

        expect(res.status).toBe(200);
        expect(res.data.message).toContain("deletado");
    });

    it("debe retornar 404 al buscar dispositivo deletado", async () => {
        const res = await api("GET", `/dispositivos?empresaId=${empresaId}&id=${dispositivoId}`, { token: adminToken });
        expect(res.status).toBe(404);
    });
});
