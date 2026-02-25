// 魔塔API配置
const API_CONFIG = {
    // API基础URL
    baseURL: 'https://api-inference.modelscope.cn/v1',
    
    // 模型配置
    model: 'Qwen/Qwen-Image',
    
    // 默认生成参数
    defaultParams: {
        width: 1024,
        height: 1024,
        steps: 20,
        guidance_scale: 7.5
    },
    
    // 请求超时时间（毫秒）
    timeout: 60000
};
