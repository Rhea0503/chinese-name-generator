from flask import Flask, request, jsonify, send_from_directory
import os
import json
import requests

app = Flask(__name__, static_url_path='/static', static_folder='static', template_folder='.')

# 静态文件路由
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# API路由
@app.route('/generate_name', methods=['POST'])
def generate_name():
    try:
        data = request.get_json()
        english_name = data.get('englishName', '')
        
        # 调用智谱API生成中文名字
        api_key = "dd360afe23d6424d89dfd50280afd6be.xKdqRmvnLDJoC8jl"
        url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""请你扮演一位专业的起名大师，为外国人{english_name}起一个富有创意的中文名字。
        要求：
        1. 名字要体现中国文化特色
        2. 要考虑英文名的发音和含义
        3. 名字要有趣味性和独特性
        4. 解释这个名字的寓意和出处
        
        请按以下格式返回：
        {{
            "chineseName": "中文名字",
            "pinyin": "拼音",
            "meaning": "名字的含义和典故解释"
        }}"""
        
        payload = {
            "model": "glm-4",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "stream": False
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response_data = response.json()
        
        try:
            name_suggestion = json.loads(response_data['choices'][0]['message']['content'])
            return jsonify(name_suggestion)
        except json.JSONDecodeError:
            # 如果返回的不是有效的JSON，尝试提取文本内容
            content = response_data['choices'][0]['message']['content']
            return jsonify({"error": "Invalid response format", "content": content})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 本地开发服务器
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
