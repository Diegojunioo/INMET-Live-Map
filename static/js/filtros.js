let filtroStatus = "todas";

function definirFiltro(status){

    filtroStatus = status;

    document.querySelectorAll(".filtro-status button")
        .forEach(btn => btn.classList.remove("ativo"));

    if(status === "todas")
        document.getElementById("btnTodas").classList.add("ativo");

    if(status === "online")
        document.getElementById("btnOnline").classList.add("ativo");

    if(status === "atraso")
        document.getElementById("btnAtraso").classList.add("ativo");

    if(status === "offline")
        document.getElementById("btnOffline").classList.add("ativo");

    adicionarEstacoes(estacoesCache);
}
document.addEventListener("DOMContentLoaded",()=>{

    document.getElementById("btnTodas")
        .onclick=()=>definirFiltro("todas");

    document.getElementById("btnOnline")
        .onclick=()=>definirFiltro("online");

    document.getElementById("btnAtraso")
        .onclick=()=>definirFiltro("atraso");

    document.getElementById("btnOffline")
        .onclick=()=>definirFiltro("offline");

});

function atualizarContador(total, online, atraso, offline){

    const contador = document.getElementById("contador");

    if(!contador) return;

    // Evita aparecer "undefined"
    total ??= 0;
    online ??= 0;
    atraso ??= 0;
    offline ??= 0;

    switch(filtroStatus){

        case "online":
            contador.innerHTML = `🟢 ${online} online`;
            break;

        case "atraso":
            contador.innerHTML = `🟠 ${atraso} atrasadas`;
            break;

        case "offline":
            contador.innerHTML = `🔴 ${offline} offline`;
            break;

        default:
            contador.innerHTML = `📡 ${total} estações`;
    }

}