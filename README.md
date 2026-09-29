# 🌤️ DADOS INMET

Aplicação web desenvolvida em **Python + Flask + Leaflet** para visualização de dados meteorológicos das estações automáticas do **Instituto Nacional de Meteorologia (INMET)**.

O projeto apresenta as estações meteorológicas do Brasil em um mapa interativo, permitindo consultar condições atuais, dados históricos e identificar valores extremos registrados pelas estações.

---

## 🗺️ Demonstração

A aplicação utiliza um mapa interativo para apresentar as estações meteorológicas distribuídas pelo território brasileiro.

Cada estação é representada por uma placa contendo informações meteorológicas, permitindo uma visualização rápida dos dados.

---

## ✨ Funcionalidades

### 📡 Monitoramento das estações

* Visualização das estações automáticas do INMET.
* Identificação do estado de cada estação.
* Indicadores de estação:

  * 🟢 Online
  * 🟠 Em atraso
  * 🔴 Offline
* Exibição da quantidade de estações disponíveis.

### 🌡️ Dados meteorológicos

Possibilidade de visualizar diferentes parâmetros meteorológicos, incluindo:

* Temperatura
* Temperatura máxima
* Temperatura mínima
* Umidade relativa
* Umidade máxima
* Umidade mínima
* Ponto de orvalho
* Pressão atmosférica
* Velocidade do vento
* Rajada de vento
* Direção do vento
* Precipitação
* Radiação solar

### 📅 Consulta histórica

A aplicação permite realizar consultas utilizando:

* Data
* Horário
* Período diário
* Período mensal
* Período anual

### 📊 Dados extremos

A aplicação possui uma área específica para identificar valores extremos registrados pelas estações meteorológicas.

Os resultados podem ser consultados por diferentes períodos e os principais extremos são destacados diretamente no mapa.

### 🏆 Ranking dos extremos

Os principais valores extremos podem ser identificados através de uma numeração no mapa, facilitando a localização das estações que apresentaram os maiores ou menores registros.

---

## 🛠️ Tecnologias utilizadas

### Backend

* 🐍 Python
* 🌐 Flask
* 🔗 API do INMET

### Frontend

* HTML5
* CSS3
* JavaScript
* 🗺️ Leaflet

### Dados

Os dados meteorológicos são obtidos através da API disponibilizada pelo Instituto Nacional de Meteorologia.

---

## 📁 Estrutura do projeto

```text
INMET-Live-Map/
│
├── app.py
├── config.py
│
├── services/
│   └── inmet.py
│
├── templates/
│   └── index.html
│
├── static/
│   ├── css/
│   │   ├── style.css
│   │   ├── popup.css
│   │   └── markers.css
│   │
│   └── js/
│       ├── api.js
│       ├── estado.js
│       ├── cores.js
│       ├── popup.js
│       ├── sidebar.js
│       ├── markers.js
│       ├── filtros.js
│       ├── mapa.js
│       └── markericon.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Como executar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/Diegojunioo/INMET-Live-Map.git
```

Entre na pasta:

```bash
cd INMET-Live-Map
```

### 2. Criar o ambiente virtual

No Windows:

```bash
python -m venv venv
```

### 3. Ativar o ambiente virtual

PowerShell:

```bash
venv\Scripts\Activate.ps1
```

### 4. Instalar as dependências

```bash
pip install -r requirements.txt
```

### 5. Executar a aplicação

```bash
python app.py
```

Depois, abra no navegador:

```text
http://127.0.0.1:5000
```

---

## 🔌 API

O projeto utiliza os serviços disponibilizados pelo INMET para obtenção dos dados meteorológicos.

Endpoint base utilizado:

```text
https://apitempo.inmet.gov.br
```

A aplicação possui endpoints próprios para disponibilizar os dados ao frontend, incluindo consultas de:

* Estações
* Dados do mapa
* Dados extremos
* Dados diários

---

## 🎯 Objetivo do projeto

O **DADOS INMET** foi desenvolvido como um projeto de estudo e portfólio com o objetivo de praticar e integrar diferentes tecnologias de desenvolvimento web.

O projeto envolve:

* Desenvolvimento de APIs com Flask
* Consumo de APIs externas
* Tratamento e organização de dados meteorológicos
* Desenvolvimento de interfaces web
* JavaScript para atualização dinâmica dos dados
* Mapas interativos com Leaflet
* Manipulação de dados históricos
* Desenvolvimento de filtros
* Visualização de dados meteorológicos

---

## 📌 Próximas melhorias

Algumas funcionalidades que podem ser adicionadas futuramente:

* [ ] Gráficos meteorológicos
* [ ] Histórico detalhado por estação
* [ ] Melhorias de desempenho nas consultas
* [ ] Cache de dados
* [ ] Página individual para cada estação
* [ ] Comparação entre estações
* [ ] Melhorias na responsividade
* [ ] Dashboard meteorológico
* [ ] Deploy em ambiente de produção

---

## 👨‍💻 Desenvolvedor

**Diego Junio Dias Carneiro**

Projeto desenvolvido para estudos, prática de desenvolvimento web e construção de portfólio profissional.

---

## 📄 Licença

Este projeto está disponível para fins educacionais e de portfólio.

---

⭐ Se este projeto foi útil ou interessante para você, considere deixar uma estrela no repositório.
