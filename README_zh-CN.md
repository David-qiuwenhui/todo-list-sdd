# 待办事项清单应用

一个使用 Vue 3 + TypeScript 构建的现代化待办事项清单应用，完全中文界面，遵循 SDD (Specification-Driven Development) 开发模式。

## 功能特性

- ✅ 添加新的待办事项
- ✅ 标记待办事项为已完成/未完成
- ✅ 编辑待办事项标题（双击编辑）
- ✅ 删除单个待办事项
- ✅ 批量操作（标记全部完成/未完成）
- ✅ 筛选功能（全部/未完成/已完成）
- ✅ 清除已完成的待办事项
- ✅ 实时统计信息
- ✅ 数据持久化（localStorage）
- ✅ 完全中文界面
- ✅ 响应式设计

## 技术栈

- **核心框架**: Vue 3 (Composition API)
- **类型系统**: TypeScript
- **构建工具**: Vite
- **包管理器**: Yarn
- **测试框架**: Vitest
- **开发环境**: Node.js v20.19.5

## 项目结构

```
src/
├── components/          # Vue 组件
│   ├── TodoItem.vue     # 单个待办事项组件
│   └── TodoList.vue     # 待办事项列表主组件
├── composables/         # 组合式函数
│   └── useTodos.ts      # 待办事项逻辑
├── types/              # TypeScript 类型定义
│   └── todo.ts         # 待办事项相关类型
└── App.vue             # 根组件
```

## 架构原则

1. **逻辑抽离**: 所有业务逻辑都在 `composables` 中，组件只负责 UI 渲染
2. **类型安全**: 严格使用 TypeScript，禁止使用 `any`
3. **持久化**: 使用 localStorage 存储数据，键名带版本号 (`todos_v1`)
4. **单向数据流**: 组件通过 composable 函数修改状态，不直接修改 props
5. **测试覆盖**: 完整的单元测试覆盖所有核心功能

## 快速开始

### 安装依赖

```bash
yarn install
```

### 开发模式

```bash
yarn dev
```

### 构建生产版本

```bash
yarn build
```

### 预览生产版本

```bash
yarn preview
```

### 运行测试

```bash
# 运行所有测试
yarn test

# 监听模式运行测试
yarn test:watch
```

## 使用说明

1. **添加待办事项**: 在顶部输入框中输入内容，按回车键添加
2. **标记完成**: 点击待办事项前的复选框
3. **编辑待办事项**: 双击待办事项标题进行编辑
4. **删除待办事项**: 点击待办事项右侧的删除按钮 (×)
5. **批量操作**: 点击顶部的 "标记全部为已完成" 进行批量操作
6. **筛选查看**: 使用底部的筛选按钮查看不同状态的待办事项
7. **清理已完成**: 点击 "清除已完成" 按钮删除所有已完成的待办事项

## 数据持久化

所有待办事项数据会自动保存到浏览器的 localStorage 中，刷新页面后数据不会丢失。

存储键名: `todos_v1`

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 开发规范

- 遵循 Vue 3 Composition API 最佳实践
- 使用 TypeScript 严格模式
- 组件命名使用 PascalCase
- 函数和变量命名使用 camelCase
- 遵循 ESLint 和 Prettier 代码规范

## 测试说明

测试文件位于 `src/composables/__tests__/` 目录，覆盖了以下场景：

- ✅ CRUD 操作（创建、读取、更新、删除）
- ✅ 筛选逻辑
- ✅ 持久化读写
- ✅ 错误处理
- ✅ 边界情况处理

运行 `yarn test` 可以查看测试覆盖报告。