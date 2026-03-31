/**
 * 本地 mock 版文案优化器。
 * 未来可在 optimizeTextWithOpenAI 中替换为真实 API 调用。
 */
const actionPrefixes = ["负责", "实现", "优化", "推进", "提升"];

function normalizeSentence(text: string) {
  const trimmed = text.trim().replace(/[。.!！]+$/g, "");
  if (!trimmed) return "";
  return trimmed;
}

function injectResumeTone(text: string) {
  if (actionPrefixes.some((prefix) => text.startsWith(prefix))) {
    return text;
  }
  const verb = actionPrefixes[Math.floor(Math.random() * actionPrefixes.length)];
  return `${verb}${text}`;
}

function toStarStyle(text: string) {
  const base = normalizeSentence(text);
  if (!base) return "";

  const metricHint = /%|提升|降低|增长|缩短|提高|减少/.test(base)
    ? ""
    : "，最终提升关键指标或交付效率";
  return `${injectResumeTone(base)}，在明确业务目标下完成方案设计与落地${metricHint}。`;
}

export function optimizeResumeBullet(text: string) {
  return toStarStyle(text);
}

export async function optimizeTextWithOpenAI(text: string): Promise<string> {
  // 预留未来接入真实大模型 API 的位置
  return Promise.resolve(optimizeResumeBullet(text));
}
