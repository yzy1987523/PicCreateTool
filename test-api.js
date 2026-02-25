// API测试脚本
async function testModelScopeAPI() {
    const apiKey = 'ms-28230386-a9ef-41bd-8982-a2d474026996';
    const baseURL = 'https://api-inference.modelscope.cn/v1';

    console.log('🧪 开始测试魔塔API...');
    console.log('📋 API密钥:', apiKey.substring(0, 10) + '...');

    const endpoint = `${baseURL}/images/generations`;

    const requestParams = {
        model: 'Qwen/Qwen-Image',
        prompt: '一只可爱的橙色小猫坐在窗台上，阳光透过窗户洒在它的毛发上',
        width: 1024,
        height: 1024,
        steps: 20,
        guidance_scale: 7.5
    };

    console.log('📝 请求参数:', {
        model: requestParams.model,
        prompt: requestParams.prompt,
        width: requestParams.width,
        height: requestParams.height,
        steps: requestParams.steps,
        guidance_scale: requestParams.guidance_scale
    });

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    try {
        console.log('⏳ 发送API请求...');
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestParams)
        });

        console.log('📡 响应状态:', response.status, response.statusText);

        const responseText = await response.text();
        console.log('📄 响应内容:', responseText);

        if (!response.ok) {
            console.error('❌ API请求失败!');
            try {
                const errorData = JSON.parse(responseText);
                console.error('错误详情:', errorData);
            } catch (e) {
                console.error('原始响应:', responseText);
            }
            return;
        }

        const result = JSON.parse(responseText);
        console.log('✅ API调用成功!');
        console.log('📦 返回结果:', result);

        if (result.images && result.images.length > 0) {
            console.log('🖼️ 生成图像数量:', result.images.length);
            console.log('🔗 图像URL:', result.images[0].url);
            console.log('');
            console.log('🎉 测试成功！API可以正常生成图片');
            console.log('💡 你可以在浏览器中访问上面的URL查看生成的图片');
        } else {
            console.warn('⚠️ 响应中没有图像数据');
            console.log('完整响应:', result);
        }

    } catch (error) {
        console.error('❌ 发生错误:', error);
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            console.error('');
            console.error('🔍 可能的原因:');
            console.error('  1. 网络连接问题');
            console.error('  2. CORS限制（浏览器直接调用API的限制）');
            console.error('  3. API端点地址错误');
            console.error('');
            console.error('💡 建议解决方案:');
            console.error('  - 使用Node.js等后端服务调用API');
            console.error('  - 或者使用魔塔提供的其他调用方式');
        }
    }
}

// 在浏览器控制台运行测试
console.log('');
console.log('═════════════════════════════════════════════════════════════════');
console.log('                   魔塔API测试工具');
console.log('═════════════════════════════════════════════════════════════════');
console.log('');

// 自动运行测试
testModelScopeAPI();
