import requests
import time

from datetime import datetime, timedelta, timezone

from config import (
    BASE_URL,
    INMET_TOKEN,
    TIMEOUT,
    HORAS_BUSCA,
    MAX_ESTACOES,
    MAX_ATRASO_HORAS
)


URL_ESTACOES = f"{BASE_URL}/estacoes/T"

def to_float(valor):
    """
    Converte valores para float.
    Retorna None quando não for possível converter.
    """

    if valor in (None, "", "---"):
        return None

    try:
        return float(str(valor).replace(",", "."))
    except:
        return None


def listar_estacoes():

    try:

        resposta = requests.get(
            URL_ESTACOES,
            timeout=TIMEOUT
        )

        resposta.raise_for_status()

        dados = resposta.json()

        estacoes = []

        for estacao in dados:

            latitude = estacao.get("VL_LATITUDE")
            longitude = estacao.get("VL_LONGITUDE")

            if latitude and longitude:

                estacoes.append({

                    "codigo": estacao.get("CD_ESTACAO"),
                    "nome": estacao.get("DC_NOME"),
                    "uf": estacao.get("SG_ESTADO"),
                    "latitude": float(latitude),
                    "longitude": float(longitude),
                    "altitude": to_float(estacao.get("VL_ALTITUDE")),

                    "tipo": estacao.get("TP_ESTACAO"),

                    "situacao": estacao.get("CD_SITUACAO"),

                    "capital": estacao.get("FL_CAPITAL") == "S",

                    "entidade": estacao.get("SG_ENTIDADE"),

                    "inicio_operacao": estacao.get("DT_INICIO_OPERACAO"),

                    "distrito": estacao.get("CD_DISTRITO")

                })

        return estacoes

    except Exception as erro:

        print("Erro ao carregar estações:", erro)

        return []


def obter_dados_atuais(data=None, hora=None):

    agora = datetime.now(timezone.utc)

    dados = {}

    # ===============================
    # Define os horários da consulta
    # ===============================

    if data and hora:

        horarios = [(data, hora)]

    else:

        horarios = []

        for i in range(HORAS_BUSCA):

            horario = agora - timedelta(hours=i)

            horarios.append(
                (
                    horario.strftime("%Y-%m-%d"),
                    horario.strftime("%H00")
                )
            )

    # ===============================
    # Consulta a API
    # ===============================

    for data_consulta, hora_consulta in horarios:

        url = (
            f"{BASE_URL}/token/estacao/dados/"
            f"{data_consulta}/{hora_consulta}/{INMET_TOKEN}"
        )

        try:

            resposta = requests.get(
                url,
                timeout=TIMEOUT
            )

            resposta.raise_for_status()

            estacoes = resposta.json()

        except Exception:

            continue

        for e in estacoes[:MAX_ESTACOES]:

            codigo = e.get("CD_ESTACAO")

            if codigo in dados:
                continue

            lat = to_float(e.get("VL_LATITUDE"))
            lon = to_float(e.get("VL_LONGITUDE"))

            if lat is None or lon is None:
                continue

            temperatura = to_float(e.get("TEM_INS"))
            temperatura_maxima = to_float(e.get("TEM_MAX"))
            temperatura_minima = to_float(e.get("TEM_MIN"))
            umidade = to_float(e.get("UMD_INS"))
            umidade_maxima = to_float(e.get("UMD_MAX"))
            umidade_minima = to_float(e.get("UMD_MIN"))
            ponto_orvalho = to_float(e.get("PTO_INS"))
            ponto_orvalho_maximo = to_float(e.get("PTO_MAX"))
            ponto_orvalho_minimo = to_float(e.get("PTO_MIN"))
            pressao = to_float(e.get("PRE_INS"))
            pressao_maxima = to_float(e.get("PRE_MAX"))
            pressao_minima = to_float(e.get("PRE_MIN"))
            vento = to_float(e.get("VEN_VEL"))
            vento_direcao = to_float(e.get("VEN_DIR"))
            rajada = to_float(e.get("VEN_RAJ"))
            radiacao = to_float(e.get("RAD_GLO"))
            chuva = to_float(e.get("CHUVA"))

            # Ignora registros completamente vazios
            if all(
                valor is None
                for valor in (
                    temperatura,
                    umidade,
                    pressao,
                    vento,
                    rajada,
                    chuva
                )
            ):
                continue

            # ===============================
            # Status da estação
            # ===============================

            data_medicao = e.get("DT_MEDICAO")
            hora_medicao = e.get("HR_MEDICAO")

            status = "offline"
            atraso_horas = None

            try:

                data_hora = datetime.strptime(
                    f"{data_medicao} {hora_medicao}",
                    "%Y-%m-%d %H%M"
                ).replace(tzinfo=timezone.utc)

                atraso_horas = (
                    agora - data_hora
                ).total_seconds() / 3600

                if atraso_horas <= 1:
                    status = "online"

                elif atraso_horas <= 3:
                    status = "atraso"

                elif atraso_horas <= MAX_ATRASO_HORAS:
                    status = "atencao"

            except Exception:
                pass

            dados[codigo] = {

                "temperatura": temperatura,

                "temperatura_maxima": temperatura_maxima,

                "temperatura_minima": temperatura_minima,

                "umidade": umidade,

                "umidade_maxima": umidade_maxima,

                "umidade_minima": umidade_minima,

                "ponto_orvalho": ponto_orvalho,

                "ponto_orvalho_maximo": ponto_orvalho_maximo,

                "ponto_orvalho_minimo": ponto_orvalho_minimo,

                "pressao": pressao,

                "pressao_maxima": pressao_maxima,

                "pressao_minima": pressao_minima,

                "vento_velocidade": vento,

                "vento_direcao": vento_direcao,

                "rajada": rajada,

                "radiacao": radiacao,

                "chuva": chuva,

                "data": data_medicao,

                "hora": hora_medicao,

                "status": status,

                "atraso_horas": (
                    round(atraso_horas, 2)
                    if atraso_horas is not None
                    else None
                )

            }

    return dados

def unir_estacoes(data=None, hora=None):

    estacoes = listar_estacoes()

    dados = obter_dados_atuais(data, hora)

    resultado = []

    for estacao in estacoes:

        codigo = estacao["codigo"]

        clima = dados.get(codigo, {})

        resultado.append({

    # ===== Identificação =====
    "codigo": codigo,
    "nome": estacao["nome"],
    "uf": estacao["uf"],

    "tipo": estacao.get("tipo"),
    "situacao": estacao.get("situacao"),
    "capital": estacao.get("capital"),
    "entidade": estacao.get("entidade"),
    "inicio_operacao": estacao.get("inicio_operacao"),
    "distrito": estacao.get("distrito"),

    # ===== Localização =====
    "latitude": estacao["latitude"],
    "longitude": estacao["longitude"],
    "altitude": estacao.get("altitude"),

    # ===== Temperatura =====
    "temperatura": clima.get("temperatura"),
    "temperatura_maxima": clima.get("temperatura_maxima"),
    "temperatura_minima": clima.get("temperatura_minima"),

    # ===== Umidade =====
    "umidade": clima.get("umidade"),
    "umidade_maxima": clima.get("umidade_maxima"),
    "umidade_minima": clima.get("umidade_minima"),

    # ===== Ponto de Orvalho =====
    "ponto_orvalho": clima.get("ponto_orvalho"),
    "ponto_orvalho_maximo": clima.get("ponto_orvalho_maximo"),
    "ponto_orvalho_minimo": clima.get("ponto_orvalho_minimo"),

    # ===== Pressão =====
    "pressao": clima.get("pressao"),
    "pressao_maxima": clima.get("pressao_maxima"),
    "pressao_minima": clima.get("pressao_minima"),

    # ===== Vento =====
    "vento": clima.get("vento_velocidade"),
    "vento_direcao": clima.get("vento_direcao"),
    "rajada": clima.get("rajada"),

    # ===== Radiação =====
    "radiacao": clima.get("radiacao"),

    # ===== Chuva =====
    "chuva": clima.get("chuva"),

    # ===== Data/Hora =====
    "data": clima.get("data"),
    "hora": clima.get("hora"),
    "tempo_utc": f"{clima.get('data', '')} {clima.get('hora', '')}".strip(),

    # ===== Status =====
    "status": clima.get("status", "offline"),
    "online": clima.get("status") == "online",
    "atraso_horas": clima.get("atraso_horas")

    })

    return resultado

def unir_estacoes_extremos(
    data=None,
    parametro="temperatura_maxima",
    periodo="diario",
    tarefa_id=None,
    tarefas=None
):

    if not data:
        return []

    periodo = (periodo or "diario").lower()

    # ==========================================================
    # DEFINIR INTERVALO DO PERÍODO
    # ==========================================================

    hoje = datetime.now().date()

    try:

        if periodo == "diario":

            inicio = datetime.strptime(
                data,
                "%Y-%m-%d"
            ).date()

            fim = inicio

        elif periodo == "mensal":

            inicio = datetime.strptime(
                data,
                "%Y-%m"
            ).date().replace(day=1)

            if inicio.month == 12:

                proximo_mes = inicio.replace(
                    year=inicio.year + 1,
                    month=1,
                    day=1
                )

            else:

                proximo_mes = inicio.replace(
                    month=inicio.month + 1,
                    day=1
                )

            ultimo_dia = proximo_mes - timedelta(days=1)

            # Se for o mês atual, não consulta o futuro
            if (
                inicio.year == hoje.year
                and inicio.month == hoje.month
            ):

                fim = hoje

            else:

                fim = ultimo_dia

        elif periodo == "anual":

            ano = datetime.strptime(
                data,
                "%Y"
            ).year

            inicio = datetime(
                ano,
                1,
                1
            ).date()

            fim = datetime(
                ano,
                12,
                31
            ).date()

            # Se for o ano atual, não consulta o futuro
            if ano == hoje.year:

                fim = hoje

        else:

            print(
                f"Período inválido: {periodo}"
            )

            return []

    except ValueError as erro:

        print(
            f"Data inválida para período "
            f"{periodo}: {erro}"
        )

        return []

    # ==========================================================
    # IMPEDIR CONSULTA DE DATAS FUTURAS
    # ==========================================================

    if inicio > hoje:

        print(
            f"Período futuro: {data}"
        )

        return []

    if fim > hoje:

        fim = hoje

    # ==========================================================
    # PARÂMETROS
    # ==========================================================

    parametros_maior = {

        "temperatura_maxima": "TEM_MAX",

        "umidade_maxima": "UMD_MAX",

        "chuva": "CHUVA",

        "rajada": "VEN_RAJ",

        "vento": "VEN_VEL",

        "radiacao": "RAD_GLO"

    }

    parametros_menor = {

        "temperatura_minima": "TEM_MIN",

        "umidade_minima": "UMD_MIN"

    }

    if parametro in parametros_maior:

        campo = parametros_maior[parametro]

        procurar_maior = True

    elif parametro in parametros_menor:

        campo = parametros_menor[parametro]

        procurar_maior = False

    else:

        print(
            f"Parâmetro inválido: {parametro}"
        )

        return []

    # ==========================================================
    # ESTRUTURAS DOS EXTREMOS
    # ==========================================================

    extremos = {}

    # ==========================================================
    # DADOS DAS ESTAÇÕES
    #
    # Guardamos os dados cadastrais diretamente dos registros
    # retornados pela API horária.
    #
    # Isso evita uma nova chamada para /estacoes/T no final.
    # ==========================================================

    estacoes_dados = {}

    # ==========================================================
    # SESSION
    # ==========================================================

    session = requests.Session()

    # ==========================================================
    # CONTROLE DO PERÍODO
    # ==========================================================

    data_atual = inicio

    total_dias = (
        fim - inicio
    ).days + 1

    dias_processados = 0

    if tarefas is not None and tarefa_id:
        tarefas[tarefa_id]["total"] = total_dias
        tarefas[tarefa_id]["progresso"] = 0

    print(
        f"Calculando extremos: "
        f"{periodo} | {data} | {parametro}"
    )

    print(
        f"Período: {inicio} até {fim}"
    )

    print(
        f"Total de dias: {total_dias}"
    )

    # ==========================================================
    # LOOP DOS DIAS
    # ==========================================================

    while data_atual <= fim:

        data_consulta = data_atual.strftime(
            "%Y-%m-%d"
        )

        # ======================================================
        # LOOP DAS 24 HORAS
        # ======================================================

        for hora in range(24):

            hora_formatada = f"{hora:02d}00"

            url = (
                f"{BASE_URL}/token/estacao/dados/"
                f"{data_consulta}/"
                f"{hora_formatada}/"
                f"{INMET_TOKEN}"
            )

            try:

                resposta = session.get(
                    url,
                    timeout=TIMEOUT
                )

                # ==================================================
                # SEM DADOS
                # ==================================================

                if resposta.status_code == 204:

                    continue

                # ==================================================
                # OUTRO ERRO HTTP
                # ==================================================

                if resposta.status_code != 200:

                    print(
                        f"Erro HTTP "
                        f"{resposta.status_code}: "
                        f"{data_consulta} "
                        f"{hora_formatada}"
                    )

                    continue

                # ==================================================
                # RESPOSTA VAZIA
                # ==================================================

                if not resposta.text.strip():

                    continue

                # ==================================================
                # CONVERTER PARA JSON
                # ==================================================

                try:

                    registros = resposta.json()

                except ValueError:

                    print(
                        f"Aviso: sem resposta para "
                        f"{data_consulta} "
                        f"{hora_formatada}"
                    )

                    continue

                # ==================================================
                # GARANTIR QUE É UMA LISTA
                # ==================================================

                if not isinstance(
                    registros,
                    list
                ):

                    continue

                # ==================================================
                # PROCESSAR ESTAÇÕES
                # ==================================================

                for registro in registros:

                    codigo = registro.get(
                        "CD_ESTACAO"
                    )

                    if not codigo:
                        continue

                    # ==================================================
                    # GUARDAR DADOS DA ESTAÇÃO
                    # ==================================================

                    if codigo not in estacoes_dados:

                        latitude = to_float(
                            registro.get(
                                "VL_LATITUDE"
                            )
                        )

                        longitude = to_float(
                            registro.get(
                                "VL_LONGITUDE"
                            )
                        )

                        # Sem coordenadas não conseguimos
                        # colocar a estação no mapa.

                        if (
                            latitude is None
                            or longitude is None
                        ):

                            continue

                        estacoes_dados[codigo] = {

                            "codigo": codigo,

                            "nome": registro.get(
                                "DC_NOME"
                            ),

                            "uf": registro.get(
                                "SG_ESTADO"
                            ),

                            "latitude": latitude,

                            "longitude": longitude,

                            "altitude": to_float(
                                registro.get(
                                    "VL_ALTITUDE"
                                )
                            ),

                            "tipo": registro.get(
                                "TP_ESTACAO"
                            ),

                            "situacao": registro.get(
                                "CD_SITUACAO"
                            ),

                            "capital": (
                                registro.get(
                                    "FL_CAPITAL"
                                ) == "S"
                            ),

                            "entidade": registro.get(
                                "SG_ENTIDADE"
                            ),

                            "inicio_operacao": registro.get(
                                "DT_INICIO_OPERACAO"
                            ),

                            "distrito": registro.get(
                                "CD_DISTRITO"
                            )

                        }

                    # ==================================================
                    # VALOR DO PARÂMETRO
                    # ==================================================

                    valor = to_float(
                        registro.get(campo)
                    )

                    if valor is None:
                        continue

                    # ==================================================
                    # PRIMEIRO VALOR DA ESTAÇÃO
                    # ==================================================

                    if codigo not in extremos:

                        extremos[codigo] = {

                            "valor": valor,

                            "data": data_consulta,

                            "hora": hora_formatada

                        }

                    # ==================================================
                    # MAIOR VALOR
                    # ==================================================

                    elif procurar_maior:

                        if valor > extremos[codigo]["valor"]:

                            extremos[codigo] = {

                                "valor": valor,

                                "data": data_consulta,

                                "hora": hora_formatada

                            }

                    # ==================================================
                    # MENOR VALOR
                    # ==================================================

                    else:

                        if valor < extremos[codigo]["valor"]:

                            extremos[codigo] = {

                                "valor": valor,

                                "data": data_consulta,

                                "hora": hora_formatada

                            }

            except Exception as erro:

                print(
                    f"Erro ao consultar "
                    f"{data_consulta} "
                    f"{hora_formatada}: "
                    f"{erro}"
                )

                continue

        # ======================================================
        # AVANÇAR UM DIA
        # ======================================================

        dias_processados += 1

        if tarefas is not None and tarefa_id:

            tarefas[tarefa_id]["progresso"] = dias_processados
            tarefas[tarefa_id]["total"] = total_dias

        if (
            periodo != "diario"
            and (
                dias_processados % 5 == 0
                or dias_processados == total_dias
            )
        ):

            print(
                f"Progresso: "
                f"{dias_processados}/{total_dias} dias"
            )

        data_atual += timedelta(
            days=1
        )

    # ==========================================================
    # FECHAR SESSION
    # ==========================================================

    session.close()

    # ==========================================================
    # ESTAÇÕES
    #
    # NÃO usamos mais listar_estacoes() aqui.
    #
    # Os dados foram coletados durante o processamento
    # das respostas horárias.
    # ==========================================================

    mapa_estacoes = estacoes_dados

    resultado = []

    # ==========================================================
    # MONTAR RESULTADO FINAL
    # ==========================================================

    for codigo, extremo in extremos.items():

        estacao = mapa_estacoes.get(
            codigo
        )

        if not estacao:
            continue

        resultado.append({

            **estacao,

            parametro: extremo["valor"],

            "data": extremo["data"],

            "hora": extremo["hora"],

            "modo": "extremo",

            "status": "extremo",

            "online": False,

            "atraso_horas": None

        })

    print(
        f"Estações com dados extremos: "
        f"{len(resultado)}"
    )

    return resultado

def obter_dados_diarios(codigo, data):

    registros = []

    for hora in range(24):

        hora_formatada = f"{hora:02d}00"

        url = (
            f"{BASE_URL}/token/estacao/dados/"
            f"{data}/{hora_formatada}/{INMET_TOKEN}"
        )

        dados = None

        # -------------------------------------------------
        # TENTA CONSULTAR A API ATÉ 3 VEZES
        # -------------------------------------------------

        for tentativa in range(3):

            try:

                resposta = requests.get(
                    url,
                    timeout=TIMEOUT
                )

                # Se a API respondeu com erro HTTP
                if resposta.status_code != 200:

                    print(
                        f"{data} {hora_formatada} "
                        f"-> HTTP {resposta.status_code}"
                    )

                    time.sleep(0.5)

                    continue

                # Verifica se existe conteúdo
                if not resposta.text.strip():

                    print(
                        f"{data} {hora_formatada} "
                        f"-> resposta vazia "
                        f"(tentativa {tentativa + 1}/3)"
                    )

                    time.sleep(0.5)

                    continue

                # Tenta interpretar como JSON
                dados = resposta.json()

                break

            except Exception as erro:

                print(
                    f"{data} {hora_formatada} "
                    f"-> tentativa {tentativa + 1}/3: {erro}"
                )

                time.sleep(0.5)


        # -------------------------------------------------
        # SE NÃO CONSEGUIU DADOS
        # -------------------------------------------------

        registro_encontrado = None

        if dados:

            for e in dados:

                if e.get("CD_ESTACAO") == codigo:

                    registro_encontrado = e

                    break


        # -------------------------------------------------
        # MONTA O REGISTRO
        # -------------------------------------------------

        if registro_encontrado:

            e = registro_encontrado

            registros.append({

                # Identificação
                "nome_estacao": e.get("DC_NOME"),
                "uf": e.get("UF"),

                # Data / hora
                "data": e.get("DT_MEDICAO") or data,
                "hora": e.get("HR_MEDICAO") or hora_formatada,

                # Temperatura
                "temperatura": to_float(
                    e.get("TEM_INS")
                ),

                "temperatura_maxima": to_float(
                    e.get("TEM_MAX")
                ),

                "temperatura_minima": to_float(
                    e.get("TEM_MIN")
                ),

                # Umidade
                "umidade": to_float(
                    e.get("UMD_INS")
                ),

                "umidade_maxima": to_float(
                    e.get("UMD_MAX")
                ),

                "umidade_minima": to_float(
                    e.get("UMD_MIN")
                ),

                # Orvalho
                "ponto_orvalho": to_float(
                    e.get("PTO_INS")
                ),

                "ponto_orvalho_maximo": to_float(
                    e.get("PTO_MAX")
                ),

                "ponto_orvalho_minimo": to_float(
                    e.get("PTO_MIN")
                ),

                # Pressão
                "pressao": to_float(
                    e.get("PRE_INS")
                ),

                "pressao_maxima": to_float(
                    e.get("PRE_MAX")
                ),

                "pressao_minima": to_float(
                    e.get("PRE_MIN")
                ),

                # Vento
                "vento": to_float(
                    e.get("VEN_VEL")
                ),

                "vento_direcao": e.get(
                    "VEN_DIR"
                ),

                "rajada": to_float(
                    e.get("VEN_RAJ")
                ),

                # Radiação
                "radiacao": to_float(
                    e.get("RAD_GLO")
                ),

                # Chuva
                "chuva": to_float(
                    e.get("CHUVA")
                )
            })

        else:

            # -------------------------------------------------
            # MANTÉM O HORÁRIO MESMO SEM DADOS
            # -------------------------------------------------

            registros.append({

                "nome_estacao": None,

                "uf": None,

                "data": data,

                "hora": hora_formatada,

                "temperatura": None,
                "temperatura_maxima": None,
                "temperatura_minima": None,

                "umidade": None,
                "umidade_maxima": None,
                "umidade_minima": None,

                "ponto_orvalho": None,
                "ponto_orvalho_maximo": None,
                "ponto_orvalho_minimo": None,

                "pressao": None,
                "pressao_maxima": None,
                "pressao_minima": None,

                "vento": None,
                "vento_direcao": None,
                "rajada": None,

                "radiacao": None,

                "chuva": None
            })


        # Pequena pausa antes da próxima hora
        time.sleep(0.2)


    return registros