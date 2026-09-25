function formatar(valor, casas = 1, unidade = "") {

    if (valor === null || valor === undefined) {
        return "--";
    }

    return `${Number(valor).toFixed(casas)}${unidade}`;
}

function getCorCabecalho(temperatura){

    if(temperatura == null) return "#607D8B";

    if(temperatura <= 10) return "#1565C0";

    if(temperatura <= 20) return "#43A047";

    if(temperatura <= 30) return "#FDD835";

    if(temperatura <= 35) return "#FB8C00";

    return "#D32F2F";

}

function formatarTempoDecorrido(atrasoHoras) {

    if (atrasoHoras === null || atrasoHoras === undefined) {
        return "Sem dados recentes";
    }

    const minutos = Math.round(atrasoHoras * 60);

    if (minutos < 1) {
        return "Atualizado agora";
    }

    if (minutos < 60) {
        return `Atualizado há ${minutos} min`;
    }

    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;

    if (resto === 0) {
        return horas === 1
            ? "Atualizado há 1 hora"
            : `Atualizado há ${horas} horas`;
    }

    return `Atualizado há ${horas} h ${resto} min`;

}

function formatarData(data) {

    if (!data) {
        return "--";
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

function linhaPopup(icone, titulo, valor){

    return `

        <div class="popup-linha">

            <span>${icone} ${titulo}</span>

            <strong>${valor}</strong>

        </div>

    `;

}

function criarPopup(estacao) {

    console.log("Data recebida:", estacao.data);

    const infoStatus =
    estacao.status === "online"
        ? {
            classe: "online",
            icone: "🟢",
            texto: "Online"
        }
        : estacao.status === "atraso"
        ? {
            classe: "atraso",
            icone: "🟠",
            texto: "Atrasada"
        }
        : {
            classe: "offline",
            icone: "🔴",
            texto: "Offline"
        };

    return `

<div class="popup-card">

    <div class="popup-header">

        <div>

            <h3>📡 ${estacao.nome}</h3>

            <small>Código: ${estacao.codigo}</small>

        </div>

        <span class="popup-status ${infoStatus.classe}">
            ${infoStatus.icone} ${infoStatus.texto}
        </span>

    </div>

    <hr>

    <div class="popup-info">

        <div>
            🕒 Última atualização
        </div>

        <strong>
            ${formatarData(estacao.data)} ${estacao.hora ?? "--"} UTC
        </strong>

        <div>
            ⏱ Status da atualização
        </div>

        <strong>
            ${formatarTempoDecorrido(estacao.atraso_horas)}
        </strong>

    </div>

    <hr>

    <div class="popup-dados">

        <div>
            🌡 Temp. Inst
            <strong>${estacao.temperatura ?? "--"} °C</strong>
        </div>

        <div>
            🥵 Temp. Máxima
            <strong>${estacao.temperatura_maxima ?? "--"} °C</strong>
        </div>

        <div>
            🥶 Temp. Mínima
            <strong>${estacao.temperatura_minima ?? "--"} °C</strong>
        </div>

        <div>
            💧 Umidade
            <strong>${estacao.umidade ?? "--"} %</strong>
        </div>

        <div>
            🌬 Vento
            <strong>${estacao.vento ?? "--"} m/s</strong>
        </div>

        <div>
            💨 Rajada
            <strong>${estacao.rajada ?? "--"} m/s</strong>
        </div>

        <div>
            🌧 Chuva
            <strong>${estacao.chuva ?? "--"} mm</strong>
        </div>

        <div>
            📈 Pressão
            <strong>${estacao.pressao ?? "--"} hPa</strong>
        </div>

    </div>

    <a
        class="popup-btn"
        href="/diario/${estacao.codigo}"
        target="_blank">

        📊 Dados Diários

    </a>

</div>

`;

}

function getStatusEstacao(estacao){

    if(!estacao.data || !estacao.hora){
        return {
            texto: "Offline",
            cor: "#D32F2F"
        };
    }

    return {
        texto: "Online",
        cor: "#43A047"
    };

}