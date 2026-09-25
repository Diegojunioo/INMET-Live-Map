import os
from dotenv import load_dotenv

load_dotenv()

# Token do INMET
INMET_TOKEN = os.getenv("INMET_TOKEN")

# API
BASE_URL = "https://apitempo.inmet.gov.br"

# Configurações
TIMEOUT = 20

# Últimas horas pesquisadas
HORAS_BUSCA = 6

# Limite de estações
MAX_ESTACOES = 1000

# Atraso máximo permitido para exibir a estação no mapa
MAX_ATRASO_HORAS = 6