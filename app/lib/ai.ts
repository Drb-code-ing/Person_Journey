/**
 * 共享 AI 调用工具 — 封装 MIMO API 的 fetch/timeout/解析逻辑
 */

const MIMO_ENDPOINT = 'https://api.xiaomimimo.com/v1/chat/completions';
const MIMO_MODEL = 'mimo-v2.5';
const AI_TIMEOUT = 30000;

/**
 * 从文本中提取最外层 JSON 对象（括号计数法，正确处理嵌套）
 * 替代原来的非贪婪正则 /\{[\s\S]*?\}/ — 后者会截断嵌套对象
 */
function extractOutermostJSON(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }

    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }

  // 未闭合 — 返回从 '{' 到末尾的内容，交给 repairTruncatedJSON 修复
  return text.slice(start);
}

/** 尝试修复被截断的 JSON（补齐缺失的括号/引号） */
function repairTruncatedJSON(raw: string): Record<string, unknown> | null {
  let s = raw.trim();

  // 移除末尾不完整的字符串值（没有关闭引号）
  const lastQuote = s.lastIndexOf('"');
  if (lastQuote >= 0) {
    const escapedQuote = /(?<!\\)"/g;
    const quoteCount = (s.match(escapedQuote) ?? []).length;
    if (quoteCount % 2 !== 0) {
      s = s.slice(0, lastQuote);
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

/** 从文本中提取并解析 JSON 对象 */
function extractAndParseJSON(text: string): Record<string, unknown> | null {
  // 1. 尝试从代码块中提取
  const codeBlock = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const source = codeBlock ? codeBlock[1] : text;

  // 2. 用括号计数法提取最外层 JSON
  const jsonStr = extractOutermostJSON(source);
  if (!jsonStr) return null;

  // 3. 尝试直接解析
  try {
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    // 4. 尝试修复截断的 JSON
    const repaired = repairTruncatedJSON(jsonStr);
    if (repaired) return repaired;
    console.warn('callMimoAI: JSON parse failed, could not repair:', jsonStr.slice(0, 200));
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
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    clearTimeout(timer);
    if (!response.ok) {
      console.warn('callMimoAI: HTTP error', response.status);
      return null;
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? '';
    const reasoning: string = data.choices?.[0]?.message?.reasoning_content ?? '';

    // 优先从 content 中提取
    let parsed = extractAndParseJSON(content);
    // content 为空时从 reasoning 中提取
    if (!parsed && reasoning) parsed = extractAndParseJSON(reasoning);

    if (!parsed) {
      console.warn('callMimoAI: no JSON found. content:', content.slice(0, 200) || '(empty)');
      return null;
    }

    return parsed as T;
  } catch (err) {
    console.error('callMimoAI error:', err instanceof Error ? err.message : err);
    return null;
  }
}
