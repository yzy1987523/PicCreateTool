# 魔塔API代理服务器

这是用于解决浏览器CORS跨域问题的代理服务器。

## 安装依赖

```bash
cd proxy
npm install
```

## 配置

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

如果需要，可以修改 `.env` 文件中的配置。

## 启动服务器

### 开发模式（自动重启）

```bash
npm run dev
```

### 生产模式

```bash
npm start
```

服务器将在 `http://localhost:3001` 启动。

## API端点

### 图像生成

```http
POST /api/images/generations
Content-Type: application/json
Authorization: Bearer YOUR_MODELSCOPE_API_KEY

{
  "model": "Qwen/Qwen-Image",
  "prompt": "一只可爱的猫",
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "guidance_scale": 7.5
}
```

### 健康检查

```http
GET /health
```

## 使用示例

### 使用curl

```bash
curl -X POST http://localhost:3001/api/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ms-your-api-key" \
  -d '{
    "model": "Qwen/Qwen-Image",
    "prompt": "一只可爱的猫",
    "width": 512,
    "height": 512
  }'
```

### 使用JavaScript

```javascript
const response = await fetch('http://localhost:3001/api/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ms-your-api-key'
    },
    body: JSON.stringify({
        model: 'Qwen/Qwen-Image',
        prompt: '一只可爱的猫',
        width: 512,
        height: 512,
        steps: 20,
        guidance_scale: 7.5
    })
});

const result = await response.json();
console.log(result);
```

## 前端集成

修改前端API客户端，将请求发送到代理服务器而不是直接访问魔塔API：

```javascript
// 修改前
const baseURL = 'https://api-inference.modelscope.cn/v1';

// 修改后
const baseURL = 'http://localhost:3001';
```

## 注意事项

1. 代理服务器默认允许所有来源（CORS: *），生产环境应该限制允许的来源
2. 确保代理服务器在运行时前端才能正常使用
3. 生产环境建议使用HTTPS和反向代理（如nginx）
