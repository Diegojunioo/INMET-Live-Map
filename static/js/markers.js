function formatarValor(estacao) {

    const valor = estacao[parametroAtual];

    if (valor === null || valor === undefined) {
        return "--";
    }

    switch (parametroAtual) {

        case "temperatura":
            return + valor.toFixed(1) + "°C";

        case "temperatura_maxima":
            return + valor.toFixed(1) + "°C";

        case "temperatura_minima":
            return + valor.toFixed(1) + "°C";

        case "umidade":
            return + valor.toFixed(0) + "%";

        case "umidade_maxima":
            return + valor.toFixed(0) + "%";

        case "umidade_minima":
            return + valor.toFixed(0) + "%";

        case "vento":
            return + valor.toFixed(1) + " m/s";

        case "vento_direcao":
            return + valor.toFixed(0) + "°";

        case "rajada":
            return + valor.toFixed(1) + " m/s";

        case "pressao":
            return + valor.toFixed(1) + " hPa";

        case "pressao_maxima":
            return + valor.toFixed(1) + " hPa";

        case "pressao_minima":
            return + valor.toFixed(1) + " hPa";

        case "ponto_orvalho":
            return + valor.toFixed(1) + "°C";

        case "ponto_orvalho_maximo":
            return + valor.toFixed(1) + "°C";

        case "ponto_orvalho_minimo":
            return + valor.toFixed(1) + "°C";

        case "radiacao":
            return + valor.toFixed(1) + " kJ/m²";

        case "chuva":
            return + valor.toFixed(1) + " mm";

        default:
            return valor;

    }

}


function iconeParametro() {

    switch (parametroAtual) {

        case "temperatura":
            return "🌡️";

        case "temperatura_maxima":
            return "🔥";

        case "temperatura_minima":
            return "❄️";

        case "umidade":
            return "💧";

        case "umidade_maxima":
            return "💧";

        case "umidade_minima":
            return "💧";

        case "vento":
            return "💨";

        case "rajada":
            return "🌪️";

        case "chuva":
            return "🌧️";

        case "pressao":
            return "📈";

        case "radiacao":
            return "☀️";

        default:
            return "📍";

    }

}


// ======================================================
// DEFINE OS 10 VALORES MAIS EXTREMOS
// ======================================================

function definirExtremos(estacoes) {

    // Limpa qualquer classificação anterior
    estacoes.forEach(estacao => {
        estacao.posicaoExtrema = null;
    });

    // Direção do vento não participa dos extremos
    if (parametroAtual === "vento_direcao") {
        return;
    }

    // Somente estações que possuem valor numérico
    const validas = estacoes.filter(estacao => {

        const valor = estacao[parametroAtual];

        return (
            valor !== null &&
            valor !== undefined &&
            !isNaN(Number(valor))
        );

    });

    // Não há dados suficientes
    if (validas.length === 0) {
        return;
    }

    // ==================================================
    // Define se o extremo é MAIOR ou MENOR
    // ==================================================

    let menoresPrimeiro = false;

    switch (parametroAtual) {

        case "temperatura_minima":
        case "umidade_minima":
        case "pressao_minima":
        case "ponto_orvalho_minimo":
            menoresPrimeiro = true;
            break;

        default:
            menoresPrimeiro = false;
            break;
    }

    // ==================================================
    // Ordenação
    // ==================================================

    validas.sort((a, b) => {

        const valorA = Number(a[parametroAtual]);
        const valorB = Number(b[parametroAtual]);

        if (menoresPrimeiro) {
            return valorA - valorB;
        }

        return valorB - valorA;

    });

    // ==================================================
    // Marca somente os 10 primeiros
    // ==================================================

    const limite = Math.min(10, validas.length);

    for (let i = 0; i < limite; i++) {

        validas[i].posicaoExtrema = i + 1;

    }

}


function adicionarEstacoes(estacoes){

    definirExtremos(estacoes);

    // Remove marcadores antigos
    marcadores.forEach(item => {
        map.removeLayer(item.marker);
    });

    marcadores.length = 0;

    let total = estacoes.length;
    let onlineCount = 0;
    let atrasoCount = 0;
    let offlineCount = 0;

    estacoes.forEach(estacao => {

        // ==========================
        // Contadores
        // ==========================

        if(estacao.modo !== "extremo"){

            switch(estacao.status){

                case "online":
                    onlineCount++;
                    break;

                case "atraso":
                case "atencao":
                    atrasoCount++;
                    break;

                default:
                    offlineCount++;
                    break;

            }

        }

        // ==========================
        // Filtros de status
        // ==========================

        if(estacao.modo !== "extremo"){

            if (
                filtroStatus === "online" &&
                estacao.status !== "online"
            ){
                return;
            }

            if (
                filtroStatus === "atraso" &&
                estacao.status !== "atraso" &&
                estacao.status !== "atencao"
            ){
                return;
            }

            if (
                filtroStatus === "offline" &&
                estacao.status !== "offline"
            ){
                return;
            }

        }

        // ==========================
        // Marcador
        // ==========================

        const marcador = L.marker(
            [estacao.latitude, estacao.longitude],
            {
                icon: criarIcone(estacao)
            }
        );

        marcador.bindPopup(
            criarPopup(estacao)
        );

        marcador.bindTooltip(
            `${estacao.nome} (${estacao.codigo})`,
            {
                direction: "top",
                offset: [0, -10],
                opacity: 0.95,
                sticky: true
            }
        );

        marcador.addTo(map);

        marcadores.push({
            marker: marcador,
            dados: estacao
        });

    });

    atualizarContador(
        total,
        onlineCount,
        atrasoCount,
        offlineCount
    );

}


function atualizarMarcadores(){

    definirExtremos(
        marcadores.map(item => item.dados)
    );

    marcadores.forEach(item => {

        item.marker.setIcon(
            criarIcone(item.dados)
        );

    });

}