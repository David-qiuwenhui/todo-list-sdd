# Vue 3 组件模板

## 文件：[Name].vue

```vue
<script setup lang="ts">
/**
 * @description: [描述组件职责]
 */
import { defineProps, defineEmits } from "vue";

// 1. 定义 Props
interface Props {
  // 明确可选性
}
const props = defineProps<Props>();

// 2. 定义 Emits
const emit = defineEmits<{
  (e: "event-name", id: string): void;
}>();

// 3. 业务逻辑（尽可能调用 composables）
</script>

<template>
  <div class="todo-[name]"></div>
</template>

<style scoped>
/* 使用简练的 CSS，避免全局污染 */
</style>
```
