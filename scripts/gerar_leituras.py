"""
Script para gerar leituras masivas na AcucarDoce API.
Simula um sensor IoT enviando leituras a cada segundo.

Uso:
    python gerar_leituras.py

Antes de rodar, preencha as variaveis abaixo com os valores reais.
"""

import requests
import random
import time
from datetime import datetime, timedelta

# ============================================================
# CONFIGURACAO - Preencha com os valores da sua API
# ============================================================

BASE_URL = "http://localhost:7071/api"

# IDs ofuscados (copie da resposta da API ao criar cada recurso)
DISPOSITIVO_ID = "nVKmURatx_rGfZP_NdKxae4lJ6zPQ4UKYU_lezhRDS2F1Gr7u6oPMKuoeMerb842B-qRTRgq0jznOATz"
EMPRESA_ID = "BdWa6raJZ7nMuznVmcWDDv69LlRlcxR6wPK1I9_rvfrlMsgiG-ibMrXuZgYLVBBxzexHThA"
SENSOR_ID = "Tgi4kmcd7cTAdPRlWDMNTH46Kgx4DBQmulFqQE98LNqyT5bsC92_lVCZpiNoLZh7k1BBS97ySQ"
TOKEN_DISPOSITIVO = "a2ccc417fcf2a65ac30516fabfbab752e13c6ce83b1790aa8c169d9d601a4a95"

# Configuracao da geracao
QUANTIDADE_LEITURAS = 1000          # Quantas leituras gerar
INTERVALO_ENTRE_LEITURAS = 1        # Segundos entre cada leitura (simulado)
VALOR_MINIMO = 18.0                 # Valor minimo do sensor (ex: temperatura)
VALOR_MAXIMO = 35.0                 # Valor maximo do sensor (ex: temperatura)
DATA_INICIO = "2026-06-01T00:00:00Z"  # Quando comecam as leituras

# ============================================================

def gerar_leituras():
    url = f"{BASE_URL}/leituras?dispositivoId={DISPOSITIVO_ID}&empresaId={EMPRESA_ID}"

    inicio = datetime.fromisoformat(DATA_INICIO.replace("Z", "+00:00"))
    sucesso = 0
    erros = 0
    duplicadas = 0

    print(f"Gerando {QUANTIDADE_LEITURAS} leituras...")
    print(f"Sensor: {SENSOR_ID}")
    print(f"Dispositivo: {DISPOSITIVO_ID}")
    print(f"Inicio: {DATA_INICIO}")
    print(f"Intervalo: {INTERVALO_ENTRE_LEITURAS}s")
    print("-" * 50)

    tempo_inicio = time.time()

    for i in range(QUANTIDADE_LEITURAS):
        # Calcular timestamp simulado (cada leitura é 1 segundo depois)
        timestamp = inicio + timedelta(seconds=i * INTERVALO_ENTRE_LEITURAS)

        # Gerar valor aleatorio com 1 casa decimal
        valor = round(random.uniform(VALOR_MINIMO, VALOR_MAXIMO), 1)

        body = {
            "token_dispostivo": TOKEN_DISPOSITIVO,
            "sensor_id": SENSOR_ID,
            "valor": valor,
            "timestamp": timestamp.isoformat(),
        }

        try:
            response = requests.post(url, json=body, timeout=10)

            if response.status_code == 201:
                sucesso += 1
            elif response.status_code == 409:
                duplicadas += 1
            else:
                erros += 1
                if erros <= 5:  # Mostrar apenas os primeiros 5 erros
                    print(f"  Erro [{response.status_code}]: {response.text[:100]}")

        except requests.exceptions.RequestException as e:
            erros += 1
            if erros <= 5:
                print(f"  Erro de conexao: {e}")

        # Progresso a cada 100 leituras
        if (i + 1) % 100 == 0:
            print(f"  Progresso: {i + 1}/{QUANTIDADE_LEITURAS} ({sucesso} ok, {erros} erros, {duplicadas} duplicadas)")

    tempo_total = time.time() - tempo_inicio

    print("-" * 50)
    print(f"Finalizado em {tempo_total:.1f}s")
    print(f"  Sucesso:    {sucesso}")
    print(f"  Duplicadas: {duplicadas}")
    print(f"  Erros:      {erros}")
    print(f"  Velocidade: {QUANTIDADE_LEITURAS / tempo_total:.0f} leituras/s")


if __name__ == "__main__":
    # Verificar se as variaveis foram preenchidas
    if "COLE_AQUI" in DISPOSITIVO_ID:
        print("=" * 50)
        print("ATENCAO: Preencha as variaveis no inicio do script!")
        print()
        print("Voce precisa dos seguintes valores:")
        print("  1. DISPOSITIVO_ID  - ID ofuscado do dispositivo")
        print("  2. EMPRESA_ID      - ID ofuscado da empresa")
        print("  3. SENSOR_ID       - ID ofuscado do sensor")
        print("  4. TOKEN_DISPOSITIVO - Token do dispositivo")
        print()
        print("Como obter:")
        print("  1. Faca login: POST /auth")
        print("  2. Liste empresas: GET /auth")
        print("  3. Crie um dispositivo: POST /dispositivos")
        print("  4. Crie um sensor: POST /sensores")
        print("  5. Copie os IDs e o token para este script")
        print("=" * 50)
    else:
        gerar_leituras()
