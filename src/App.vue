<script setup>
import { computed, reactive, ref } from "vue";
import { buildDailyMealAgentPayload, createCursorAgent } from "./cursorAgent";

const form = reactive({
  heightCm: 170,
  weightKg: 65,
  lifestylePrompt: "工作日 23:30 入睡，7:30 起床，久坐较多，希望午餐清淡、晚餐低油低盐。",
  apiKey: "",
  proxyUrl: "",
  repository: "https://github.com/Schrodinger-CatBug/daily-meal",
});

const isSubmitting = ref(false);
const result = ref(null);
const errorMessage = ref("");

const bmi = computed(() => {
  const height = Number(form.heightCm);
  const weight = Number(form.weightKg);

  if (!height || !weight) {
    return null;
  }

  return weight / (height / 100) ** 2;
});

const bmiLabel = computed(() => {
  if (!bmi.value) {
    return "填写身高体重后计算";
  }

  if (bmi.value < 18.5) {
    return "偏瘦，菜谱应关注能量和蛋白质补充";
  }

  if (bmi.value < 24) {
    return "正常，菜谱应关注营养均衡";
  }

  if (bmi.value < 28) {
    return "超重，菜谱应关注热量、油盐和主食比例";
  }

  return "肥胖，菜谱应更谨慎控制热量并建议咨询专业人士";
});

const payload = computed(() => buildDailyMealAgentPayload(form));
const prettyPayload = computed(() => JSON.stringify(payload.value, null, 2));
const canSubmit = computed(() => {
  return form.heightCm > 0 && form.weightKg > 0 && form.lifestylePrompt.trim() && form.apiKey.trim();
});

async function handleSubmit() {
  errorMessage.value = "";
  result.value = null;

  if (!canSubmit.value) {
    errorMessage.value = "请填写身高、体重、生活作息提示词和 Cursor API Key。";
    return;
  }

  isSubmitting.value = true;

  try {
    result.value = await createCursorAgent({
      apiKey: form.apiKey.trim(),
      proxyUrl: form.proxyUrl,
      payload: payload.value,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建失败，请稍后重试。";
    errorMessage.value = message === "Failed to fetch"
      ? "浏览器请求失败，可能是 Cursor API 未开放跨域访问。请填写代理地址，由后端转发创建请求。"
      : message;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <main>
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">每日菜谱 · Vue 3 · Cursor 云智能体</p>
      <h1 id="page-title">让 daily-meal 自动创建你的健康菜谱角色</h1>
      <p class="intro">
        输入身高、体重、生活作息提示词和 Cursor API Key，页面会生成 Cursor Cloud Agents 请求，
        创建一个专门负责每日菜谱、采购清单、食材库存和健康饮食调整的角色。
      </p>
    </section>

    <section class="feature-grid" aria-label="每日菜谱能力">
      <article class="feature-card">
        <h2>今日采购提醒</h2>
        <p>根据菜谱和库存判断是否需要采购，并输出食材名称、数量和用途。</p>
      </article>
      <article class="feature-card">
        <h2>食材库存管理</h2>
        <p>记录剩余食材数量、可用状态和存放位置，减少重复购买和浪费。</p>
      </article>
      <article class="feature-card">
        <h2>健康食谱调整</h2>
        <p>根据身体情况、作息和饮食目标调整每日菜单与注意事项。</p>
      </article>
    </section>

    <section class="workspace" aria-label="创建 Cursor 云智能体角色">
      <form class="panel form-panel" @submit.prevent="handleSubmit">
        <div>
          <p class="section-kicker">创建入口</p>
          <h2>创建 daily-meal 云智能体角色</h2>
          <p class="muted">
            API Key 只在浏览器中用于本次请求，不会写入代码仓库。生产环境建议填写代理地址，由后端安全保存密钥并调用 Cursor API。
          </p>
        </div>

        <div class="field-row">
          <label>
            <span>身高（cm）</span>
            <input v-model.number="form.heightCm" type="number" min="80" max="240" required>
          </label>
          <label>
            <span>体重（kg）</span>
            <input v-model.number="form.weightKg" type="number" min="20" max="250" step="0.1" required>
          </label>
        </div>

        <div class="bmi-card">
          <strong>BMI：{{ bmi ? bmi.toFixed(1) : "--" }}</strong>
          <span>{{ bmiLabel }}</span>
        </div>

        <label>
          <span>生活作息和健康提示词</span>
          <textarea
            v-model="form.lifestylePrompt"
            rows="6"
            placeholder="例如：经常熬夜、久坐、希望控糖、晚餐不要太油..."
            required
          />
        </label>

        <label>
          <span>Cursor API Key</span>
          <input
            v-model="form.apiKey"
            type="password"
            autocomplete="off"
            placeholder="粘贴你的 Cursor API Key"
            required
          >
        </label>

        <label>
          <span>代理地址（可选）</span>
          <input
            v-model="form.proxyUrl"
            type="url"
            placeholder="https://your-api.example.com/create-agent"
          >
        </label>

        <label>
          <span>关联仓库（可选）</span>
          <input
            v-model="form.repository"
            type="url"
            placeholder="https://github.com/Schrodinger-CatBug/daily-meal"
          >
        </label>

        <button type="submit" :disabled="!canSubmit || isSubmitting">
          {{ isSubmitting ? "正在创建..." : "创建 Cursor 云智能体角色" }}
        </button>

        <p v-if="errorMessage" class="notice error">{{ errorMessage }}</p>
        <div v-if="result" class="notice success">
          <strong>创建请求已成功返回。</strong>
          <pre>{{ JSON.stringify(result, null, 2) }}</pre>
        </div>
      </form>

      <aside class="panel preview-panel">
        <p class="section-kicker">请求预览</p>
        <h2>Cloud Agents Payload</h2>
        <p class="muted">
          页面会向 <code>POST https://api.cursor.com/v1/agents</code> 发送下面的结构；
          如果填写代理地址，则改为请求你的代理地址。
        </p>
        <pre>{{ prettyPayload }}</pre>
      </aside>
    </section>
  </main>
</template>
