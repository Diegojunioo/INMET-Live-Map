async function carregarMapa(data = "", hora = "") {

    let url = "/api/mapa";

    const params = new URLSearchParams();

    if (data) {
        params.append("data", data);
    }

    if (hora) {
        params.append("hora", hora);
    }

    if (params.toString()) {
        url += "?" + params.toString();
    }

    const resposta = await fetch(url);

    return await resposta.json();

}

async function carregarExtremos(data, parametro, periodo){

    let url = "/api/extremos";

    const params = new URLSearchParams();

    if(data)
        params.append("data", data);

    if(parametro)
        params.append("parametro", parametro);

    if(periodo)
        params.append("periodo", periodo);

    if(params.toString()){

        url += "?" + params.toString();

    }

    const resposta = await fetch(url);

    if(!resposta.ok){
        throw new Error(
            "Erro ao iniciar processamento dos extremos."
        );
    }

    return await resposta.json();

}


async function consultarProgressoExtremos(tarefaId){

    const resposta = await fetch(
        `/api/extremos/progresso/${tarefaId}`
    );

    if(!resposta.ok){

        throw new Error(
            "Erro ao consultar progresso dos extremos."
        );

    }

    return await resposta.json();

}