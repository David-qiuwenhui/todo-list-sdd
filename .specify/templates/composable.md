# Composable 模板

## 文件：src/composables/[Name].ts

```typescript
import { ref, computed, watchEffect } from 'vue'
import type { [Type] } from '@/types/todo'

export function use[Name]() {
  // 1. 状态管理 (使用 ref/reactive)
  const state = ref([])

  // 2. 状态保护 (使用 computed 暴露只读数据)
  const readonlyState = computed(() => state.value)

  // 3. 业务操作函数 (必须标注返回类型)
  const action = (): void => {
    // ...逻辑
  }

  return {
    state: readonlyState,
    action
  }
}
```
