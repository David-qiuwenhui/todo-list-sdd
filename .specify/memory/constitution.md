# To-Do List 项目开发宪法

## 一、 技术栈约束

- **核心**: Vue 3 (Composition API) + TypeScript.
- **构建/包管理**: Yarn + Vite.
- **状态管理**: 禁止使用 Pinia/Vuex，必须使用 `composables` 进行逻辑封装。
- **测试**: Vitest (单元测试为主).
- **环境**: Node v20.19.5, Mac 开发环境.

## 二、 架构原则

- **逻辑抽离**: 组件（`.vue`）仅负责渲染和 UI 事件派发。业务逻辑、状态变更、副作用必须写在 `src/composables/`。
- **持久化**: 使用 `localStorage`，键名需带版本号（如 `todo_v1`）。
- **单向数据流**: 组件通过调用 composable 暴露的函数来修改状态，不得直接修改 props。

## 三、 TypeScript 规范

- **禁止 any**: 必须明确定义所有类型。
- **类型定义**: 统一存放在 `src/types/`。
- **函数签名**: 所有函数必须标注返回类型。
- **对象约束**: `Todo` 接口必须包含 `id`, `title`, `completed`, `createdAt`。

## 四、 测试准则

- **逻辑先行**: 修改 `composables` 逻辑后必须同步更新/编写对应的 `.spec.ts`。
- **隔离性**: 测试不依赖真实 DOM，模拟（Mock）`localStorage`。
- **覆盖点**: 必须覆盖 CRUD、筛选逻辑、持久化读写。
