// 魔塔API客户端
class ModelScopeAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = API_CONFIG.baseURL;
    }

    // 设置API密钥
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    // 生成图像
    async generateImage(prompt, params = {}) {
        const endpoint = `${this.baseURL}/images/generations`;
        
        const requestParams = {
            model: API_CONFIG.model,
            prompt: prompt,
            width: params.width || API_CONFIG.defaultParams.width,
            height: params.height || API_CONFIG.defaultParams.height,
            steps: params.steps || API_CONFIG.defaultParams.steps,
            guidance_scale: params.guidanceScale || API_CONFIG.defaultParams.guidance_scale
        };

        try {
            const response = await this._makeRequest(endpoint, requestParams);
            return response;
        } catch (error) {
            throw new Error(`图像生成失败: ${error.message}`);
        }
    }

    // 封装HTTP请求
    async _makeRequest(endpoint, data) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage;

                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
                } catch {
                    errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
                }

                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error('请求超时，请检查网络连接');
            }

            // 检查是否是代理服务器未启动的错误
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('无法连接到服务器。请确保：\n1. 代理服务器已启动（cd proxy && npm start）\n2. 服务器运行在 http://localhost:3001');
            }

            throw error;
        }
    }
}
