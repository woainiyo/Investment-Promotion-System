// aiHandler.js
const OpenAI = require("openai");

// 初始化 OpenAI 客户端
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "sk-6e8b10a4855b4be28f9bba875da1fc7e", 
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1", // 北京地域
    
});

/**
 * 调用 AI 聊天接口
 * @param {Array<{role: string, content: string}>} messages 聊天消息列表
 * @param {string} model 模型名，可选，默认 "qwen-flash"
 * @returns {Promise<string>} 返回 AI 回复内容
 */
exports.getAIResponse = async function getAIResponse(currentMessage, historyMessages, model = "qwen-flash") {
    // console.log('调用 AI 聊天接口，模型：', model)
    try {
        const systemPrompt = {
            role: "system",
            content: `
            你是商业地产AI顾问。

            输出格式要求：

            1. 允许使用简单 Markdown：
            - 标题 (# ## ###)
            - 列表 (- )
            - 粗体 (**加粗**)
            - 普通代码块

            2. 禁止输出：
            - 数学公式
            - LaTeX 语法
            - $$ 包裹内容
            - \\( \\) 或 \\[ \\]

            3. 所有内容必须是可直接阅读的自然语言解释。
            4. 不要输出 HTML 标签。
            `
        }
        // console.log('当前消息', currentMessage)
        // console.log('历史消息', historyMessages)
        const messages = [systemPrompt, ...historyMessages,  currentMessage]
        console.log('总消息', messages)
        const completion = await openai.chat.completions.create({
            model,
            messages
        });
        console.log('AI回复', completion.choices[0].message.content)
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("AI调用错误：", error);
        throw error;
    }
}


