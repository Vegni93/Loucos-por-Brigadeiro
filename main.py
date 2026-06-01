import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Inicialização da aplicação com metadados limpos
app = FastAPI(
    title="Ateliê Dolce & Brigadeiro - Production Server",
    docs_url=None,      # Desativa rotas de documentação automática em produção por segurança
    redoc_url=None
)

# Definição dos caminhos absolutos do projeto
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSS_DIR = os.path.join(BASE_DIR, "css")
JS_DIR = os.path.join(BASE_DIR, "js")

# Montagem dos diretórios estáticos utilizando ASGI StaticFiles (Robustez para arquivos de estilo e lógica)
if os.path.exists(CSS_DIR):
    app.mount("/css", StaticFiles(directory=CSS_DIR), name="css")
if os.path.exists(JS_DIR):
    app.mount("/js", StaticFiles(directory=JS_DIR), name="js")


@app.get("/", tags=["Core"])
async def serve_index():
    """
    Rota Raiz: Entrega o esqueleto HTML da Single Page Application.
    Utiliza FileResponse para transferência eficiente de arquivos sem sobrecarga de memória.
    """
    index_path = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path, media_type="text/html")
    return {"error": "index.html não encontrado no diretório raiz."}


if __name__ == "__main__":
    # Inicialização do servidor ASGI Uvicorn
    # Configurações otimizadas para ambiente local com recarregamento automático (development mode)
    uvicorn.run(
        "main:app", 
        host="127.0.0.1", 
        port=8000, 
        reload=True,
        log_level="info"
    )