# To-Do 项目专用指令集

- `/init-logic`: 根据 PRD 任务 2 和 3，生成 `types/todo.ts` 和核心 `useTodos.ts` 逻辑。
- `/gen-component [name]`: 参考 `.specify/templates/vue-component.md` 生成对应的 Vue 组件（如 TodoInput, TodoItem）。
- `/write-test [target]`: 为指定的 composable 生成 Vitest 单元测试，确保覆盖所有业务分支。
- `/audit`: 根据 `constitution.md` 检查当前代码是否违背规范（如检查是否存在 any，逻辑是否在组件内）。
- `/ship`: 检查所有需求点（CRUD、筛选、持久化）是否完成，并生成项目 README。
