from flask import Flask, render_template, jsonify, request
from datetime import datetime
import threading
import uuid

from services.inmet import (
    listar_estacoes,
    unir_estacoes,
    unir_estacoes_extremos,
    obter_dados_atuais,
    obter_dados_diarios
)

app = Flask(__name__)

# ===============================
# CONTROLE DE PROCESSAMENTO
# ===============================

tarefas_extremos = {}

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/estacoes")
def api_estacoes():
    return jsonify(listar_estacoes())


@app.route("/api/mapa")
def api_mapa():

    data = request.args.get("data")
    hora = request.args.get("hora")

    return jsonify(unir_estacoes(data, hora))

@app.route("/api/extremos")
def api_extremos():

    data = request.args.get("data")
    parametro = request.args.get("parametro")
    periodo = request.args.get("periodo", "diario")

    # ==========================================
    # DIÁRIO
    # ==========================================
    # Mantém o comportamento atual para consultas
    # de apenas um dia.

    if periodo == "diario":

        resultado = unir_estacoes_extremos(
            data=data,
            parametro=parametro,
            periodo=periodo
        )

        return jsonify(resultado)

    # ==========================================
    # MENSAL / ANUAL
    # ==========================================

    tarefa_id = str(uuid.uuid4())

    tarefas_extremos[tarefa_id] = {

        "status": "processando",

        "progresso": 0,

        "total": 0,

        "resultado": None,

        "erro": None
    }

    def executar():

        try:

            resultado = unir_estacoes_extremos(
                data=data,
                parametro=parametro,
                periodo=periodo,
                tarefa_id=tarefa_id,
                tarefas=tarefas_extremos
            )

            tarefas_extremos[tarefa_id]["resultado"] = resultado

            tarefas_extremos[tarefa_id]["status"] = "concluido"

            tarefas_extremos[tarefa_id]["progresso"] = (
                tarefas_extremos[tarefa_id]["total"]
            )

        except Exception as erro:

            print(
                f"Erro na tarefa de extremos {tarefa_id}:",
                erro
            )

            tarefas_extremos[tarefa_id]["status"] = "erro"

            tarefas_extremos[tarefa_id]["erro"] = str(erro)

    thread = threading.Thread(
        target=executar,
        daemon=True
    )

    thread.start()

    return jsonify({
        "tarefa_id": tarefa_id
    })

# ===============================
# PROGRESSO DOS EXTREMOS
# ===============================

@app.route("/api/extremos/progresso/<tarefa_id>")
def api_extremos_progresso(tarefa_id):

    tarefa = tarefas_extremos.get(tarefa_id)

    if not tarefa:

        return jsonify({
            "erro": "Tarefa não encontrada."
        }), 404

    return jsonify({

        "status": tarefa["status"],

        "progresso": tarefa["progresso"],

        "total": tarefa["total"],

        "resultado": (
            tarefa["resultado"]
            if tarefa["status"] == "concluido"
            else None
        ),

        "erro": tarefa["erro"]
    })

@app.route("/diario/<codigo>")
def diario_estacao(codigo):

    data_param = request.args.get("data")

    if data_param:
        data = data_param.replace("-", "")
    else:
        data = datetime.now().strftime("%Y%m%d")

    registros = obter_dados_diarios(
        codigo=codigo,
        data=data
    )

    nome_estacao = "Estação não identificada"

    if registros:
        nome = registros[0].get("nome_estacao")
        uf = registros[0].get("uf")

        if nome:
            nome_estacao = nome

            if uf:
                nome_estacao += f"/{uf}"

    return render_template(
        "diario.html",
        codigo=codigo,
        data=data,
        nome_estacao=nome_estacao,
        registros=registros
    )

@app.route("/api/teste")
def api_teste():

    dados = obter_dados_atuais()

    return jsonify({
        "total": len(dados),
        "dados": dados
    })


if __name__ == "__main__":
    app.run(debug=True)