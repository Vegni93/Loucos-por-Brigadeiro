import os
from flask import Flask, send_from_directory

app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def serve_index():
    if os.path.exists('index.html'):
        return send_from_directory('.', 'index.html')
    return {"error": "index.html não encontrado no diretório raiz."}, 404

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
