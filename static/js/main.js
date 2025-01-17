// API 配置
const API_KEY = 'dd360afe23d6424d89dfd50280afd6be.xKdqRmvnLDJoC8jl';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// 处理表单提交
document.getElementById('nameForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const englishName = document.getElementById('englishName').value.trim();
    
    if (englishName) {
        // 显示加载状态
        showLoading();
        try {
            const suggestions = await generateChineseNames(englishName);
            displayResults(suggestions);
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    }
});

// 生成中文名字
async function generateChineseNames(englishName) {
    const prompt = `As a Chinese name expert, create three creative Chinese names for "${englishName}". Return ONLY a JSON object in this exact format:
{
  "suggestions": [
    {
      "chineseName": "中文名",
      "pinyin": "pinyin with spaces",
      "style": "网络热门/搞怪有趣/诗意古风/超级个性/潮流时尚",
      "meaning": {
        "characters": [
          {
            "character": "字",
            "meaning": "meaning in English",
            "culture": "cultural context"
          }
        ],
        "overall": "overall meaning"
      }
    }
  ]
}`;

    try {
        console.log('Sending request...');
        
        const timestamp = Math.floor(Date.now() / 1000);
        const requestBody = {
            model: "glm-4-flash",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.9,
            top_p: 0.8,
            max_tokens: 1000,
            stream: false
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': API_KEY,
                'X-Time': timestamp.toString()
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const responseText = await response.text();
        console.log('Raw API Response:', responseText);

        const data = JSON.parse(responseText);
        console.log('Parsed API Response:', data);

        if (!data.choices?.[0]?.message?.content) {
            throw new Error('Invalid API response structure');
        }

        const content = data.choices[0].message.content;
        console.log('Message Content:', content);

        // 尝试清理内容中可能的前后缀
        const jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
        console.log('Cleaned Content:', jsonContent);

        const parsedContent = JSON.parse(jsonContent);
        console.log('Parsed Content:', parsedContent);

        if (!parsedContent.suggestions?.length) {
            throw new Error('Missing suggestions array');
        }

        return parsedContent.suggestions;
    } catch (error) {
        console.error('Error details:', error);
        throw new Error(`生成名字失败: ${error.message}`);
    }
}

// 显示结果
function displayResults(suggestions) {
    const resultsSection = document.getElementById('results');
    resultsSection.innerHTML = '';
    resultsSection.classList.add('active');

    suggestions.forEach((suggestion, index) => {
        const card = document.createElement('div');
        card.className = 'name-card';
        
        const styleClass = getStyleClass(suggestion.style);
        card.classList.add(styleClass);
        
        card.innerHTML = `
            <div class="style-badge">${suggestion.style}</div>
            <h3>${suggestion.chineseName}</h3>
            <p class="pinyin">${suggestion.pinyin}</p>
            <dl class="name-details">
                <dt>字符含义:</dt>
                ${suggestion.meaning.characters.map(char => `
                    <dd>
                        <strong>${char.character}</strong>: ${char.meaning}<br>
                        <small>文化内涵: ${char.culture}</small>
                    </dd>
                `).join('')}
                <dt>整体寓意:</dt>
                <dd>${suggestion.meaning.overall}</dd>
            </dl>
            <button class="favorite-btn" onclick="toggleFavorite(this)" data-name="${suggestion.chineseName}">
                <span class="heart">♡</span> 收藏
            </button>
        `;

        resultsSection.appendChild(card);
    });
}

// 获取样式类名
function getStyleClass(style) {
    const styleMap = {
        '简约': 'style-minimal',
        '传统': 'style-traditional',
        '艺术': 'style-artistic',
        '个性': 'style-unique',
        '网络热门': 'style-trending',
        '搞怪': 'style-funny',
        '诗意': 'style-poetic',
        '潮流': 'style-modern',
        '古风': 'style-classical'
    };
    return styleMap[style] || 'style-default';
}

// 显示加载状态
function showLoading() {
    const resultsSection = document.getElementById('results');
    resultsSection.innerHTML = '<div class="loading">正在生成名字，请稍候...</div>';
    resultsSection.classList.add('active');
}

// 隐藏加载状态
function hideLoading() {
    const loadingDiv = document.querySelector('.loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// 显示错误信息
function showError(message) {
    const resultsSection = document.getElementById('results');
    resultsSection.innerHTML = `<div class="error">抱歉，出现了错误：${message}</div>`;
}

// 收藏功能
function toggleFavorite(button) {
    button.classList.toggle('active');
    const heart = button.querySelector('.heart');
    if (button.classList.contains('active')) {
        heart.textContent = '♥';
        button.title = '取消收藏';
    } else {
        heart.textContent = '♡';
        button.title = '收藏';
    }
}

// 简化版生成名字函数
async function generateName() {
    const englishName = document.getElementById('englishName').value;
    const resultDiv = document.getElementById('result');
    
    if (!englishName) {
        resultDiv.innerHTML = '<p class="error">Please enter your English name</p>';
        return;
    }

    try {
        resultDiv.innerHTML = '<p class="loading">Generating your Chinese name...</p>';
        
        const response = await fetch('/generate_name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ englishName }),
        });

        const data = await response.json();
        
        if (data.error) {
            resultDiv.innerHTML = `<p class="error">Error: ${data.error}</p>`;
            return;
        }

        resultDiv.innerHTML = `
            <div class="name-result">
                <h2>${data.chineseName}</h2>
                <p class="pinyin">${data.pinyin}</p>
                <p class="meaning">${data.meaning}</p>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}
