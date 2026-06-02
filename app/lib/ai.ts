/**
 * 共享 AI 调用工具 — 封装 MIMO API 的 fetch/timeout/解析逻辑
 */

const MIMO_ENDPOINT = 'https://api.xiaomimimo.com/v1/chat/completions';
const MIMO_MODEL = 'mimo-v2.5';
const AI_TIMEOUT = 30000;
const AI_MAX_TOKENS = 8192;

/** 尝试修复被截断的 JSON（补齐缺失的括号/引号） */
function repairTruncatedJSON(raw: string): Record<string, unknown> | null {
  let s = raw.trim();

  // 移除末尾不完整的字符串值（没有关闭引号）
  const lastQuote = s.lastIndexOf('"');
  if (lastQuote >= 0) {
    // 检查最后一个引号是否是开引号（奇数个引号 = 最后一个是开引号）
    const quoteCount = (s.match(/(?<!\\)"/g) ?? []).length;
    if (quoteCount % 2 !== 0) {
      // 最后一个引号是开引号，截断到它之前
      s = s.slice(0, lastQuote);
      // 如果前面是冒号或逗号，需要补一个占位值
      if (s.endsWith(':') || s.endsWith(',')) s += '"..."';
      else s += '"';
    }
  }

  // 移除末尾多余的逗号
  s = s.replace(/,\s*$/, '');

  // 计算缺失的括号并补齐
  const openBrace = (s.match(/\{/g) ?? []).length;
  const closeBrace = (s.match(/\}/g) ?? []).length;
  const openBracket = (s.match(/\[/g) ?? []).length;
  const closeBracket = (s.match(/\]/g) ?? []).length;

  // 先补齐数组括号，再补齐对象括号
  s += ']'.repeat(Math.max(0, openBracket - closeBracket));
  s += '}'.repeat(Math.max(0, openBrace - closeBrace));

  try {
    return JSON.parse(s) as Record<string, unknown>;
  } catch {
    return null;
  }
}

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
    if (!jsonMatch) {
      console.warn('callMimoAI: no JSON found. content:', content.slice(0, 100) || '(empty)');
      return null;
    }

    try {
      return JSON.parse(jsonMatch[0]) as T;
    } catch {
      // JSON 被截断 — 尝试修复常见截断模式
      const repaired = repairTruncatedJSON(jsonMatch[0]);
      if (repaired) return repaired as T;
      console.warn('callMimoAI: JSON parse failed, could not repair:', jsonMatch[0].slice(0, 100));
      return null;
    }
  } catch (err) {
    console.error('callMimoAI error:', err instanceof Error ? err.message : err);
    return null;
  }
}
