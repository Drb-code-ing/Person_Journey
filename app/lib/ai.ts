/**
 * 共享 AI 调用工具 — 封装 MIMO API 的 fetch/timeout/解析逻辑
 */

const MIMO_ENDPOINT = 'https://api.xiaomimimo.com/v1/chat/completions';
const MIMO_MODEL = 'mimo-v2.5';
const AI_TIMEOUT = 15000;
const AI_MAX_TOKENS = 2048;

/**
 * 调用 MIMO AI 并返回解析后的 JSON 对象
 * @returns 解析后的对象，失败返回 null
 */
export async function callMimoAI<T = Record<string, unknown>>(
  systemPrompt: string,
  userPrompt: string,
): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), AI_TIMEOUT);

    const response = await fetch(MIMO_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MIMO_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MIMO_MODEL,
        max_tokens: AI_MAX_TOKENS,
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    clearTimeout(timer);
    if (!response.ok) return null;

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? '';
    const reasoning: string = data.choices?.[0]?.message?.reasoning_content ?? '';

    // 从 content 中提取 JSON（非贪婪匹配，支持代码块）
    let jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      const codeBlock = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlock) jsonMatch = codeBlock[1].match(/\{[\s\S]*?\}/);
    }
    // content 为空时从 reasoning 中提取
    if (!jsonMatch && reasoning) jsonMatch = reasoning.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    return null;
  }
}
