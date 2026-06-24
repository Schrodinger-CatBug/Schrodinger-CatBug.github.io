const CURSOR_AGENTS_ENDPOINT = "https://api.cursor.com/v1/agents";

export function buildDailyMealAgentPayload(form) {
  const height = Number(form.heightCm);
  const weight = Number(form.weightKg);
  const bmi = height > 0 && weight > 0 ? weight / (height / 100) ** 2 : null;
  const bmiText = bmi ? bmi.toFixed(1) : "未计算";
  const repo = form.repository.trim();

  const userProfile = [
    `身高：${height || "未填写"} cm`,
    `体重：${weight || "未填写"} kg`,
    `BMI：${bmiText}`,
    `生活作息和健康提示：${form.lifestylePrompt.trim()}`,
  ].join("\n");

  const plannerPrompt = [
    "你是 daily-meal 的每日菜谱健康规划角色。",
    "请根据用户的身体数据、生活作息、健康提示和家庭食材库存，生成适合当天执行的菜谱方案。",
    "输出时请包含：今日是否需要采购、采购食材名称和数量、现有食材剩余量、食材存放位置、早餐/午餐/晚餐建议，以及需要注意的健康调整。",
    "不要提供医疗诊断；涉及疾病、用药或强限制饮食时，提醒用户咨询专业医生或营养师。",
    "",
    "用户资料：",
    userProfile,
  ].join("\n");

  return {
    name: "daily-meal 健康菜谱角色",
    prompt: {
      text: [
        "请为 daily-meal 创建并运行一个每日菜谱健康规划角色。",
        "这个角色需要根据用户资料生成当天菜谱、采购清单、库存使用建议和健康饮食提醒。",
        "",
        "用户资料：",
        userProfile,
      ].join("\n"),
    },
    ...(repo
      ? {
          repos: [
            {
              url: repo,
            },
          ],
        }
      : {}),
    customSubagents: [
      {
        name: "daily-meal-health-planner",
        description: "根据身高、体重、生活作息和健康提示生成每日菜谱与采购建议。",
        prompt: plannerPrompt,
        model: "inherit",
      },
    ],
    mode: "agent",
  };
}

export async function createCursorAgent({ apiKey, proxyUrl, payload }) {
  const normalizedProxyUrl = proxyUrl.trim();
  const endpoint = normalizedProxyUrl || CURSOR_AGENTS_ENDPOINT;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }
  }

  if (!response.ok) {
    const message = data?.error?.message || data?.message || `请求失败：HTTP ${response.status}`;
    throw new Error(message);
  }

  return data || {};
}
