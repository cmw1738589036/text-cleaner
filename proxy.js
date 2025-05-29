const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const dns = require('dns');
const path = require('path');
require('dotenv').config();

// 设置DNS解析超时
dns.setDefaultResultOrder('ipv4first');

// 创建Express应用
const app = express();

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 添加静态文件服务
app.use(express.static(path.join(__dirname)));

// 添加请求日志中间件
app.use((req, res, next) => {
    console.log('=================================');
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('请求头:', JSON.stringify(req.headers, null, 2));
    console.log('请求体:', JSON.stringify(req.body, null, 2));
    console.log('=================================');
    next();
});

// 测试路由
app.get('/', (req, res) => {
    console.log('收到根路径请求');
    res.json({ message: '代理服务器正在运行' });
});

app.get('/test', (req, res) => {
    console.log('收到测试路由请求');
    res.json({ message: '测试路由正常工作' });
});

// 创建自定义的HTTPS代理
const httpsAgent = new https.Agent({
    keepAlive: true,
    timeout: 30000,
    rejectUnauthorized: false,
    maxSockets: 10,
    maxFreeSockets: 5,
    keepAliveMsecs: 30000,
    family: 4 // 强制使用IPv4
});

// 重试函数
async function retryRequest(config, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`尝试第 ${i + 1} 次请求...`);
            const response = await axios(config);
            return response;
        } catch (error) {
            console.error(`第 ${i + 1} 次请求失败:`, error.message);
            if (i === maxRetries - 1) throw error;
            // 等待一段时间后重试
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// 模拟响应函数
function generateMockResponse(input) {
    const responses = [
        "我理解您的问题，让我来为您解答。",
        "这是一个很好的问题，我的建议是...",
        "根据我的分析，这个问题的解决方案是...",
        "让我为您详细解释一下...",
        "这个问题可以从以下几个方面来考虑..."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return {
        choices: [{
            message: {
                content: `${randomResponse}\n\n${input}\n\n这是一个模拟的响应，用于测试功能是否正常工作。`
            }
        }]
    };
}

// 代理配置
app.post('/api', async (req, res) => {
    console.log('收到API请求');
    try {
        // 验证请求体
        if (!req.body || !req.body.messages) {
            console.error('无效的请求体:', req.body);
            return res.status(400).json({
                error: {
                    message: '无效的请求体'
                }
            });
        }

        // 验证Authorization头
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.error('缺少Authorization头');
            return res.status(401).json({
                error: {
                    message: '缺少Authorization头'
                }
            });
        }

        console.log('使用模拟响应...');
        const input = req.body.messages[0].content;
        const mockResponse = generateMockResponse(input);
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('返回模拟响应:', mockResponse);
        res.json(mockResponse);

    } catch (error) {
        console.error('代理错误:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText
        });

        res.status(error.response?.status || 500).json({
            error: {
                message: error.response?.data?.error?.message || error.message,
                status: error.response?.status,
                statusText: error.response?.statusText
            }
        });
    }
});

// 智谱GLM代理路由
app.post('/api/glm', async (req, res) => {
    try {
        const apiKey = process.env.ZHIPU_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: '未配置ZHIPU_API_KEY环境变量' });
        }
        const response = await axios.post(
            'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            req.body,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

// 404处理
app.use((req, res) => {
    console.log('404 - 未找到路由:', req.method, req.url);
    res.status(404).json({
        error: {
            message: '未找到请求的路由'
        }
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        error: {
            message: err.message
        }
    });
});

// 启动服务器
const PORT = 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log(`代理服务器运行在 http://localhost:${PORT}`);
    console.log('可用路由:');
    console.log('- GET  /        - 检查服务器状态');
    console.log('- GET  /test    - 测试路由');
    console.log('- POST /api     - 模拟AI响应');
    console.log('- POST /api/glm - 智谱GLM代理');
    console.log('=================================');
});

// 错误处理
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`端口 ${PORT} 已被占用`);
    } else {
        console.error('服务器错误:', error);
    }
    process.exit(1);
}); 