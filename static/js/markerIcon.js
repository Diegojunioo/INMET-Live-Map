function iconeParametro() {

    switch (parametroAtual) {

        case "temperatura":
            return "🌡️";

        case "temperatura_minima":
            return "❄️";

        case "temperatura_maxima":
            return "🔥";

        case "umidade":
            return "💧";

        case "vento":
            return "💨";

        case "rajada":
            return "🌪️";

        case "chuva":
            return "🌧️";

        case "pressao":
            return "📈";

        default:
            return "📍";
    }
}


function corMarcador(estacao){

    switch(parametroAtual){

        case "temperatura":
            return corTemperatura(estacao.temperatura);

        case "temperatura_maxima":
            return corTemperatura(estacao.temperatura_maxima);

        case "temperatura_minima":
            return corTemperatura(estacao.temperatura_minima);

        case "umidade":
            return corUmidade(estacao.umidade);

        case "umidade_maxima":
            return corUmidade(estacao.umidade_maxima);

        case "umidade_minima":
            return corUmidade(estacao.umidade_minima);

        case "ponto_orvalho":
            return corPontoOrvalho(estacao.ponto_orvalho);

        case "ponto_orvalho_maximo":
            return corPontoOrvalho(estacao.ponto_orvalho_maximo);

        case "ponto_orvalho_minimo":
            return corPontoOrvalho(estacao.ponto_orvalho_minimo);

        case "vento":
        case "rajada":
            return corVento(estacao[parametroAtual]);

        case "chuva":
            return corChuva(estacao.chuva);

        case "pressao":
            return corPressao(estacao.pressao);

        case "pressao_maxima":
            return corPressao(estacao.pressao_maxima);

        case "pressao_minima":
            return corPressao(estacao.pressao_minima);

        case "radiacao":
            return corRadiacao(estacao.radiacao);

        default:
            return "#1976D2";

    }

}


function criarHTMLMarcador(estacao){

    const cor = corMarcador(estacao);

    let conteudo = formatarValor(estacao);

    // ===============================
    // Dados Extremos
    // ===============================

    if(estacao.modo === "extremo"){

        conteudo = `
            ${iconeParametro()}
            ${formatarValor(estacao)}
        `;

    }

    // ===============================
    // Número do extremo
    // ===============================

    let numeroExtremo = "";

if (
    estacao.posicaoExtrema !== null &&
    estacao.posicaoExtrema !== undefined
) {

    numeroExtremo = `
        <div class="numero-extremo">
            ${estacao.posicaoExtrema}º
        </div>
    `;

}

    return `

        <div class="marcador-container">

            ${numeroExtremo}

            <div
                class="placa-estacao"
                style="
                    border-color:${cor};
                    color:${cor};
                ">

                ${conteudo}

            </div>

        </div>

    `;

}


function criarIcone(estacao){

    return L.divIcon({

        className: "icone-estacao",

        html: criarHTMLMarcador(estacao),

        popupAnchor: [0,-10]

    });

}


function tipoMarcador() {

    const zoom = map.getZoom();

    if (zoom <= 5)
        return "ponto";

    if (zoom <= 7)
        return "texto";

    return "completo";

}