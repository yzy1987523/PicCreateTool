// 全局状态
let apiClient = null;
let currentImage = null;
let history = [];

// DOM元素
const promptInput = document.getElementById('prompt');
const apiKeyInput = document.getElementById('apiKey');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const stepsInput = document.getElementById('steps');
const guidanceScaleInput = document.getElementById('guidanceScale');
const generateBtn = document.querySelector('.generate-btn');
const imageContainer = document.getElementById('imageContainer');
const errorMessage = document.getElementById('errorMessage');
const resultActions = document.querySelector('.result-actions');
const historyGrid = document.getElementById('historyGrid');
const emptyHistory = document.getElementById('emptyHistory');
const clearBtn = document.querySelector('.clear-btn');

// 初始化
function init() {
    loadHistory();
    loadApiKey();
}

// 加载保存的API密钥
function loadApiKey() {
    const savedKey = localStorage.getItem('modelscope_api_key');
    if (savedKey) {
        apiKeyInput.value = savedKey;
        apiClient = new ModelScopeAPI(savedKey);
    }
}

// 切换API密钥可见性
function toggleApiKeyVisibility() {
    const input = apiKeyInput;
    const icon = document.getElementById('eyeIcon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🔒';
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
    }
}

// 生成图像
async function generateImage() {
    const apiKey = apiKeyInput.value.trim();
    const prompt = promptInput.value.trim();
    
    // 验证输入
    if (!apiKey) {
        showError('请输入API密钥');
        return;
    }
    
    if (!prompt) {
        showError('请输入提示词');
        return;
    }
    
    // 保存API密钥
    localStorage.setItem('modelscope_api_key', apiKey);
    
    // 初始化API客户端
    apiClient = new ModelScopeAPI(apiKey);
    
    // 禁用按钮，显示加载状态
    setLoadingState(true);
    hideError();
    
    try {
        // 获取参数
        const params = {
            width: parseInt(widthInput.value),
            height: parseInt(heightInput.value),
            steps: parseInt(stepsInput.value),
            guidanceScale: parseFloat(guidanceScaleInput.value)
        };
        
        // 调用API生成图像
        const result = await apiClient.generateImage(prompt, params);
        
        // 处理响应
        if (result.images && result.images.length > 0) {
            const imageData = result.images[0];
            displayImage(imageData.url);
            currentImage = {
                url: imageData.url,
                prompt: prompt,
                params: params,
                timestamp: new Date().toISOString()
            };
            resultActions.style.display = 'flex';
        } else {
            throw new Error('未返回图像数据');
        }
    } catch (error) {
        showError(error.message);
        console.error('生成图像失败:', error);
    } finally {
        setLoadingState(false);
    }
}

// 设置加载状态
function setLoadingState(loading) {
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoader = generateBtn.querySelector('.btn-loader');
    
    generateBtn.disabled = loading;
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// 显示图像
function displayImage(url) {
    imageContainer.innerHTML = `<img src="${url}" alt="生成的图像" crossorigin="anonymous">`;
}

// 显示错误
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        hideError();
    }, 5000);
}

// 隐藏错误
function hideError() {
    errorMessage.style.display = 'none';
}

// 下载图像
async function downloadImage() {
    if (!currentImage) return;
    
    try {
        const response = await fetch(currentImage.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `generated_image_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        showError('下载失败: ' + error.message);
    }
}

// 保存到历史记录
function saveToHistory() {
    if (!currentImage) return;
    
    // 添加到历史记录
    history.unshift(currentImage);
    
    // 限制历史记录数量（最多保存20条）
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    // 保存到本地存储
    localStorage.setItem('image_history', JSON.stringify(history));
    
    // 更新历史记录显示
    renderHistory();
    
    // 显示成功提示
    showNotification('已保存到历史记录');
}

// 加载历史记录
function loadHistory() {
    const savedHistory = localStorage.getItem('image_history');
    if (savedHistory) {
        try {
            history = JSON.parse(savedHistory);
            renderHistory();
        } catch (error) {
            console.error('加载历史记录失败:', error);
            history = [];
        }
    }
}

// 渲染历史记录
function renderHistory() {
    if (history.length === 0) {
        historyGrid.innerHTML = '';
        emptyHistory.style.display = 'block';
        clearBtn.style.display = 'none';
        return;
    }
    
    emptyHistory.style.display = 'none';
    clearBtn.style.display = 'inline-block';
    
    historyGrid.innerHTML = history.map((item, index) => `
        <div class="history-item" onclick="viewHistoryItem(${index})">
            <img src="${item.url}" alt="${item.prompt}" crossorigin="anonymous">
            <div class="overlay">
                <p class="prompt-preview">${item.prompt}</p>
            </div>
        </div>
    `).join('');
}

// 查看历史记录项
function viewHistoryItem(index) {
    const item = history[index];
    displayImage(item.url);
    currentImage = item;
    resultActions.style.display = 'flex';
    
    // 恢复参数
    promptInput.value = item.prompt;
    widthInput.value = item.params.width;
    heightInput.value = item.params.height;
    stepsInput.value = item.params.steps;
    guidanceScaleInput.value = item.params.guidanceScale;
}

// 清空历史记录
function clearHistory() {
    if (!confirm('确定要清空所有历史记录吗？')) return;
    
    history = [];
    localStorage.removeItem('image_history');
    renderHistory();
    showNotification('历史记录已清空');
}

// 显示通知
function showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // 2秒后移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
