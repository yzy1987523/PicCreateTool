require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// 启用CORS
app.use(cors({
    origin: '*', // 允许所有来源，生产环境应该限制
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 魔塔API端点
const MODELSCOPE_API = 'https://api-inference.modelscope.cn/v1';

// 代理端点：图像生成
app.post('/api/images/generations', async (req, res) => {
    try {
        console.log('收到图像生成请求:', {
            model: req.body.model,
            prompt: req.body.prompt?.substring(0, 50) + '...',
            width: req.body.width,
            height: req.body.height
        });

        const apiKey = req.headers.authorization;

        if (!apiKey) {
            return res.status(401).json({
                error: '缺少API密钥',
                message: '请在请求头中提供Authorization字段'
            });
        }

        // 转发请求到魔塔API（使用异步模式）
        const response = await fetch(`${MODELSCOPE_API}/images/generations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey,
                'X-ModelScope-Async-Mode': 'true'
            },
            body: JSON.stringify(req.body)
        });

        const responseText = await response.text();

        console.log('魔塔API响应状态:', response.status);

        if (!response.ok) {
            console.error('魔塔API错误:', responseText);
            return res.status(response.status).json({
                error: '魔塔API调用失败',
                status: response.status,
                message: responseText
            });
        }

        const result = JSON.parse(responseText);
        console.log('异步任务已创建:', result.task_id);

        // 如果任务成功，等待并获取结果
        if (result.task_status === 'SUCCEED' && result.task_id) {
            // 等待2秒后查询任务结果
            await new Promise(resolve => setTimeout(resolve, 2000));

            const taskResult = await fetch(`${MODELSCOPE_API}/tasks/${result.task_id}`, {
                method: 'GET',
                headers: {
                    'Authorization': apiKey
                }
            });

            if (taskResult.ok) {
                const taskData = await taskResult.json();
                console.log('任务结果获取成功');

                // 返回符合前端期望的格式
                if (taskData.output && taskData.output.image_url) {
                    return res.json({
                        images: [{
                            url: taskData.output.image_url
                        }]
                    });
                }
            }
        }

        res.json(result);
    } catch (error) {
        console.error('代理服务器错误:', error);
        res.status(500).json({
            error: '代理服务器错误',
            message: error.message
        });
    }
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'ModelScope API Proxy'
    });
});

// 根路径
app.get('/', (req, res) => {
    res.json({
        name: 'ModelScope API Proxy',
        version: '1.0.0',
        endpoints: {
            '/api/images/generations': 'POST - 图像生成代理',
            '/health': 'GET - 健康检查'
        },
        usage: {
            'image_generation': {
                url: '/api/images/generations',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_API_KEY'
                },
                body: {
                    model: 'Qwen/Qwen-Image',
                    prompt: '描述图像的文字',
                    width: 1024,
                    height: 1024,
                    steps: 20,
                    guidance_scale: 7.5
                }
            }
        }
    });
});

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 魔塔API代理服务器已启动');
    console.log('='.repeat(50));
    console.log(`📍 监听端口: ${PORT}`);
    console.log(`🌐 本地访问: http://localhost:${PORT}`);
    console.log(`🔍 API文档: http://localhost:${PORT}/`);
    console.log(`❤️  健康检查: http://localhost:${PORT}/health`);
    console.log('='.repeat(50));
});
