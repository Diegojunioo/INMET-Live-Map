function corTemperatura(valor){

    if(valor == null) return "#BDBDBD";

    if(valor <= 0) return "#4B0082";
    if(valor <= 10) return "#1565C0";
    if(valor <= 20) return "#00ACC1";
    if(valor <= 25) return "#43A047";
    if(valor <= 30) return "#FDD835";
    if(valor <= 35) return "#FB8C00";

    return "#D32F2F";
}

// Temperatura Máxima
function corTemperaturaMaxima(valor){
    return corTemperatura(valor);
}

// Temperatura Mínima
function corTemperaturaMinima(valor){
    return corTemperatura(valor);
}

function corUmidade(valor){

    if(valor == null) return "#9E9E9E";

    if(valor <= 20) return "#D32F2F";
    if(valor <= 40) return "#FB8C00";
    if(valor <= 60) return "#FDD835";
    if(valor <= 80) return "#43A047";

    return "#1565C0";
}

// Umidade Máxima
function corUmidadeMaxima(valor){
    return corUmidade(valor);
}

// Umidade Mínima
function corUmidadeMinima(valor){
    return corUmidade(valor);
}

function corPontoOrvalho(valor){

    if(valor == null) return "#9E9E9E";

    if(valor <= 0) return "#6D4C41";
    if(valor <= 10) return "#8BC34A";
    if(valor <= 20) return "#26A69A";
    if(valor <= 25) return "#29B6F6";

    return "#1565C0";
}

// Ponto de Orvalho Máximo
function corPontoOrvalhoMaximo(valor){
    return corPontoOrvalho(valor);
}

// Ponto de Orvalho Mínimo
function corPontoOrvalhoMinimo(valor){
    return corPontoOrvalho(valor);
}

function corPressao(valor){

    if(valor == null) return "#9E9E9E";

    if(valor <= 995) return "#D32F2F";
    if(valor <= 1005) return "#FB8C00";
    if(valor <= 1015) return "#43A047";
    if(valor <= 1025) return "#42A5F5";

    return "#283593";
}

// Pressão Máxima
function corPressaoMaxima(valor){
    return corPressao(valor);
}

// Pressão Mínima
function corPressaoMinima(valor){
    return corPressao(valor);
}

function corVento(valor){

    if(valor == null) return "#9E9E9E";

    if(valor <= 2) return "#43A047";
    if(valor <= 5) return "#FDD835";
    if(valor <= 10) return "#FB8C00";
    if(valor <= 20) return "#D32F2F";

    return "#6A1B9A";
}

function corvento_direcao(valor){
    return corVento(valor);
}

function corRajada(valor){

    if(valor == null) return "#9E9E9E";

    if(valor <= 5) return "#43A047";
    if(valor <= 10) return "#FDD835";
    if(valor <= 20) return "#FB8C00";
    if(valor <= 30) return "#D32F2F";

    return "#6A1B9A";
}

function corRadiacao(valor){

    if(valor == null) return "#9E9E9E";

    if(valor <= 100) return "#5E35B1";
    if(valor <= 300) return "#1E88E5";
    if(valor <= 600) return "#43A047";
    if(valor <= 800) return "#FDD835";
    if(valor <= 1000) return "#FB8C00";

    return "#D32F2F";
}

function corChuva(valor){

    if(valor == null) return "#9E9E9E";

    if(valor === 0) return "#43A047";

    if(valor <= 5) return "#81D4FA";
    if(valor <= 20) return "#29B6F6";
    if(valor <= 50) return "#1565C0";

    return "#0D47A1";
}

function obterCor(parametro, valor){

    switch(parametro){

        case "temperatura":
            return corTemperatura(valor);

        case "temperatura_maxima":
            return corTemperaturaMaxima(valor);

        case "temperatura_minima":
            return corTemperaturaMinima(valor);

        case "umidade":
            return corUmidade(valor);

        case "umidade_maxima":
            return corUmidadeMaxima(valor);

        case "umidade_minima":
            return corUmidadeMinima(valor);

        case "ponto_orvalho":
            return corPontoOrvalho(valor);

        case "ponto_orvalho_maximo":
            return corPontoOrvalhoMaximo(valor);

        case "ponto_orvalho_minimo":
            return corPontoOrvalhoMinimo(valor);

        case "pressao":
            return corPressao(valor);

        case "pressao_maxima":
            return corPressaoMaxima(valor);

        case "pressao_minima":
            return corPressaoMinima(valor);

        case "vento":
            return corVento(valor);

        case "rajada":
            return corRajada(valor);

        case "radiacao":
            return corRadiacao(valor);

        case "chuva":
            return corChuva(valor);

        default:
            return "#9E9E9E";

    }

}