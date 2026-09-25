// ===============================
// Criação do mapa
// ===============================

const map = L.map("map", {
    zoomSnap: 1,
    zoomDelta: 1
}).setView([-15, -55], 4);

map.on("popupopen", function(e) {

    const ponto = map.latLngToContainerPoint(e.popup.getLatLng());

    ponto.y -= 230;   // ajuste conforme a altura do banner

    map.panTo(
        map.containerPointToLatLng(ponto),
        {
            animate: true,
            duration: 0.4
        }
    );

});

// ===============================
// Cache das estações
// ===============================

let estacoesCache = [];

let parametroMapaAnterior = "temperatura";

L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution:'© OpenStreetMap contributors',
        maxZoom:19
    }
).addTo(map);

// ===============================
// Inicialização
// ===============================

async function iniciarMapa() {

    estacoesCache = await carregarMapa();

    adicionarEstacoes(estacoesCache);

}

iniciarMapa();


// ===============================
// Troca de parâmetro
// ===============================

document
.getElementById("parametro")
.addEventListener("change", function () {

    parametroAtual = this.value;

    parametroMapaAnterior = this.value;

    atualizarMarcadores();

});


// ===============================
// Escala dos balões
// ===============================

map.on("zoomend", () => {

    atualizarMarcadores();

});

async function atualizarSistema() {

    const data = document.getElementById("filtroData")?.value || "";

    const hora = document.getElementById("filtroHora")?.value || "";

    estacoesCache = await carregarMapa(data, hora);

    adicionarEstacoes(estacoesCache);

    atualizarSidebar(estacoesCache);


}

function pesquisarEstacoes(texto) {

    texto = texto.toLowerCase().trim();

    marcadores.forEach(item => {

        const estacao = item.dados;

        const encontrou =
            estacao.nome.toLowerCase().includes(texto) ||
            estacao.codigo.toLowerCase().includes(texto) ||
            estacao.uf.toLowerCase().includes(texto);

        if (texto === "" || encontrou) {

            item.marker.addTo(map);

        } else {

            map.removeLayer(item.marker);

        }

    });

}
document
.getElementById("buscar")
.addEventListener("input", function () {

    pesquisarEstacoes(this.value);

});

document
.getElementById("filtroData")
.addEventListener("change", atualizarSistema);

document
.getElementById("filtroHora")
.addEventListener("change", atualizarSistema);

// Fecha o popup ao pressionar ESC
document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        map.closePopup();

    }

});

// ===============================
// Menu lateral
// ===============================

const btnMenu = document.getElementById("btnMenu");

if (btnMenu) {

    btnMenu.addEventListener("click", function(){

        document.body.classList.toggle("sidebar-fechada");

        setTimeout(function(){

            map.invalidateSize();

        }, 300);

    });

}

// ===============================
// PERÍODO DOS DADOS EXTREMOS
// ===============================

function configurarDataExtremo() {

    const periodo =
        document.getElementById("periodoExtremo").value;

    const campo =
        document.getElementById("dataExtremo");

    const label =
        document.getElementById("labelDataExtremo");

    if (!campo || !label) return;


    // ===============================
    // DIÁRIO
    // ===============================

    if (periodo === "diario") {

        label.textContent = "Data";

        campo.type = "date";

        campo.removeAttribute("min");

        campo.removeAttribute("max");

        // Se já houver uma data selecionada,
        // mantém a data
        if (!campo.value) {

            campo.value =
                new Date().toISOString().slice(0, 10);

        }

    }


    // ===============================
    // MENSAL
    // ===============================

    else if (periodo === "mensal") {

        label.textContent = "Mês";

        campo.type = "month";

        campo.removeAttribute("min");

        campo.removeAttribute("max");

        // Converte uma data existente para YYYY-MM
        if (campo.value && campo.value.length >= 7) {

            campo.value =
                campo.value.substring(0, 7);

        }

        else {

            campo.value =
                new Date().toISOString().slice(0, 7);

        }

    }


    // ===============================
    // ANUAL
    // ===============================

    else if (periodo === "anual") {

        label.textContent = "Ano";

        campo.type = "number";

        campo.min = "2000";

        campo.max =
            new Date().getFullYear();

        campo.step = "1";

        campo.placeholder = "AAAA";

        // Se veio de uma data/mês,
        // aproveita somente o ano
        if (campo.value) {

            campo.value =
                campo.value.substring(0, 4);

        }

        else {

            campo.value =
                new Date().getFullYear();

        }

    }

}

document
.getElementById("periodoExtremo")
.addEventListener("change", configurarDataExtremo);
configurarDataExtremo();

// ===============================
// BARRA DE PROGRESSO DOS EXTREMOS
// ===============================

let intervaloProgressoExtremos = null;

let inicioProcessamentoExtremos = null;

function formatarDataProgresso(data) {

    if (!data) {
        return data;
    }

    // Data diária: YYYY-MM-DD → DD/MM/YYYY
    if (data.length === 10) {

        const partes = data.split("-");

        if (partes.length === 3) {

            return `${partes[2]}/${partes[1]}/${partes[0]}`;

        }

    }

    // Data mensal: YYYY-MM → MM/YYYY
    if (data.length === 7) {

        const partes = data.split("-");

        if (partes.length === 2) {

            return `${partes[1]}/${partes[0]}`;

        }

    }

    return data;

}


function criarBarraExtremos(periodo, data) {

    let titulo = "";

    if (periodo === "diario") {

        titulo =
            `📅 Processando dia ${formatarDataProgresso(data)}`;

    }

    if (periodo === "mensal") {

        titulo =
            `📆 Processando mês ${formatarDataProgresso(data)}`;

    } 

    else if (periodo === "anual") {

        titulo = `🗓️ Processando ano ${data}`;

    }

    let painel = document.getElementById(
        "progressoExtremos"
    );

    if (!painel) {

        painel = document.createElement("div");

        painel.id = "progressoExtremos";

        document.body.appendChild(painel);

    }

    painel.innerHTML = `

        <div class="progresso-extremos-titulo">
            ${titulo}
        </div>

        <div
            id="progressoExtremosTexto"
            class="progresso-extremos-texto"
        >
            Preparando...
        </div>

        <div class="progresso-extremos-barra">

            <div
                id="progressoExtremosBarra"
                class="progresso-extremos-preenchimento"
            ></div>

        </div>

        <div
            id="progressoExtremosTempo"
            class="progresso-extremos-tempo"
        >
            ⏱️ 00:00
        </div>

    `;

    inicioProcessamentoExtremos =
        Date.now();

    atualizarTempoExtremos();

}


function atualizarTempoExtremos() {

    const elemento =
        document.getElementById(
            "progressoExtremosTempo"
        );

    if (!elemento || !inicioProcessamentoExtremos) {
        return;
    }

    const segundos = Math.floor(
        (Date.now() - inicioProcessamentoExtremos) / 1000
    );

    const minutos = Math.floor(
        segundos / 60
    );

    const segundosRestantes =
        segundos % 60;

    elemento.textContent =
        `⏱️ ${String(minutos).padStart(2, "0")}:${String(segundosRestantes).padStart(2, "0")}`;

}


function atualizarBarraExtremos(
    progresso,
    total
) {

    const texto =
        document.getElementById(
            "progressoExtremosTexto"
        );

    const barra =
        document.getElementById(
            "progressoExtremosBarra"
        );

    if (!texto || !barra) {
        return;
    }

    if (!total || total <= 0) {

        texto.textContent =
            "Preparando...";

        barra.style.width = "0%";

        return;

    }

    const porcentagem = Math.round(
        (progresso / total) * 100
    );

    texto.textContent =
        `${progresso} / ${total} dias     ${porcentagem}%`;

    barra.style.width =
        `${porcentagem}%`;

}


function finalizarBarraExtremos(
    periodo,
    data,
    progresso,
    total
) {

    const titulo =
        document.querySelector(
            ".progresso-extremos-titulo"
        );

    const texto =
        document.getElementById(
            "progressoExtremosTexto"
        );

    const barra =
        document.getElementById(
            "progressoExtremosBarra"
        );


    // ===============================
    // MOSTRA CONCLUSÃO
    // ===============================

    if (titulo) {

        if (periodo === "diario") {

            titulo.textContent =
                `📅 Dia ${formatarDataProgresso(data)} concluído`;

        }

        if (periodo === "mensal") {

            titulo.textContent =
                `📆 Mês ${formatarDataProgresso(data)} concluído`;

        }

        else if (periodo === "anual") {

            titulo.textContent =
                `🗓️ Ano ${data} concluído`;

        }

    }


    if (texto) {

        texto.textContent =
            `${total} / ${total} dias     100%`;

    }


    if (barra) {

        barra.style.width = "100%";

    }


    // ===============================
    // PARA O CRONÔMETRO
    // ===============================

    if (intervaloProgressoExtremos) {

        clearInterval(
            intervaloProgressoExtremos
        );

        intervaloProgressoExtremos = null;

    }


    atualizarTempoExtremos();


    // ===============================
    // REMOVE APÓS 3 SEGUNDOS
    // ===============================

    setTimeout(function(){

        removerBarraExtremos();

    }, 3000);

}


function removerBarraExtremos() {

    if (intervaloProgressoExtremos) {

        clearInterval(
            intervaloProgressoExtremos
        );

        intervaloProgressoExtremos = null;

    }

    const painel =
        document.getElementById(
            "progressoExtremos"
        );

    if (painel) {

        painel.remove();

    }

    inicioProcessamentoExtremos = null;

}

// ===============================
// BOTAO EXTREMOS
// ===============================

document
.getElementById("btnExtremos")
.addEventListener("click", async function(){

    const periodo =
        document.getElementById("periodoExtremo").value;

    const data =
        document.getElementById("dataExtremo").value;

    const parametro =
        document.getElementById("parametroExtremo").value;


    // ===============================
    // VALIDAÇÃO
    // ===============================

    if(!data){

        if(periodo === "diario") {

            alert("Selecione uma data.");

        }

        else if(periodo === "mensal") {

            alert("Selecione um mês.");

        }

        else if(periodo === "anual") {

            alert("Informe um ano.");

        }

        return;

    }


    // Guarda o parâmetro atual do mapa
    parametroMapaAnterior =
        parametroAtual;


    // Define o parâmetro dos extremos
    parametroAtual =
        parametro;


    console.log("Dados extremos:");

    console.log("Período:", periodo);

    console.log("Data:", data);

    console.log("Parâmetro:", parametro);


    try {

        // ==========================================
        // DIÁRIO
        // ==========================================

        if(periodo === "diario") {

            // Cria a barra de progresso
            criarBarraExtremos(
                periodo,
                data
            );


            intervaloProgressoExtremos =
                setInterval(
                    atualizarTempoExtremos,
                    1000
                );


            // Mostra imediatamente 0 / 1
                atualizarBarraExtremos(
                    0,
                    1
            );


            // Processa o dia
                estacoesCache =
                    await carregarExtremos(
                        data,
                        parametro,
                        periodo
                );


            // Atualiza os marcadores
            adicionarEstacoes(
                estacoesCache
            );


            // Finaliza a barra
            finalizarBarraExtremos(
                periodo,
                data,
                1,
                1
            );


            return;

        }

        // ==========================================
        // MENSAL / ANUAL
        // ==========================================

        criarBarraExtremos(
            periodo,
            data
        );


        intervaloProgressoExtremos =
            setInterval(
                atualizarTempoExtremos,
                1000
            );


        // ==========================================
        // INICIA A TAREFA
        // ==========================================

        const tarefa =
            await carregarExtremos(
                data,
                parametro,
                periodo
            );


        if(!tarefa.tarefa_id) {

            throw new Error(
                "O servidor não retornou o ID da tarefa."
            );

        }


        const tarefaId =
            tarefa.tarefa_id;


        // ==========================================
        // ACOMPANHA O PROGRESSO
        // ==========================================

        let concluido = false;


        while(!concluido) {

            await new Promise(
                resolve =>
                    setTimeout(resolve, 1000)
            );


            const progresso =
                await consultarProgressoExtremos(
                    tarefaId
                );


            console.log(
                "Progresso extremos:",
                progresso
            );


            // ======================================
            // ATUALIZA BARRA
            // ======================================

            atualizarBarraExtremos(
                progresso.progresso,
                progresso.total
            );


            // ======================================
            // PROCESSAMENTO CONCLUÍDO
            // ======================================

            if(
                progresso.status ===
                "concluido"
            ) {

                concluido = true;


                estacoesCache =
                    progresso.resultado;


                adicionarEstacoes(
                    estacoesCache
                );


                finalizarBarraExtremos(
                    periodo,
                    data,
                    progresso.progresso,
                    progresso.total
                );

            }


            // ======================================
            // ERRO
            // ======================================

            else if(
                progresso.status ===
                "erro"
            ) {

                throw new Error(
                    progresso.erro ||
                    "Erro ao processar os dados extremos."
                );

            }

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar dados extremos:",
            erro
        );


        removerBarraExtremos();


        alert(
            "Não foi possível carregar os dados extremos."
        );

    }

});

// ===============================
// BOTÃO MAPA ATUAL
// ===============================

document
.getElementById("btnMapaAtual")
.addEventListener("click", async function(){

    try {

        // Recupera o parâmetro utilizado antes dos extremos
        parametroAtual = parametroMapaAnterior;

        // Carrega novamente os dados atuais
        estacoesCache = await carregarMapa();

        // Recria os marcadores
        adicionarEstacoes(estacoesCache);

        // Atualiza o contador
        atualizarContador(estacoesCache);

        console.log("Mapa atual restaurado.");

    } catch (erro) {

        console.error(
            "Erro ao restaurar o mapa atual:",
            erro
        );

        alert(
            "Não foi possível restaurar o mapa atual."
        );

    }

});