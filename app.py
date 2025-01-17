from flask import Flask, send_from_directory
import os

app = Flask(__name__)

# 静态文件路由
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# Vercel 需要这个
app.debug = True

# 本地开发服务器
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
