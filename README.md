# 文件夹里面包含了这些核心文件：

## SDD 规格驱动开发模式项目的基本准则和约定

- .specify/memory/constitution.md：项目的基本准则和约定
- .specify/scripts/：一些可执行脚本
- .specify/templates/：模板文件
- .claude/commands/：定义了一套内置的斜杠命令，让你在 AI 编程工具中可以直接调用

## Next Steps

1.  Go to the project folder: cd todo-list-sdd │
2.  Start using slash commands with your AI agent: │
    2.1 /speckit.constitution - Establish project principles │
    2.2 /speckit.specify - Create baseline specification │
    2.3 /speckit.plan - Create implementation plan │
    2.4 /speckit.tasks - Generate actionable tasks │
    2.5 /speckit.implement - Execute implementation │

Enhancement Commands
Optional commands that you can use for your specs (improve quality & confidence)
/speckit.clarify (optional) - Ask structured questions to de-risk ambiguous areas before planning (run before /speckit.plan if used)
/speckit.analyze (optional) - Cross-artifact consistency & alignment report (after /speckit.tasks, before /speckit.implement)
/speckit.checklist (optional) - Generate quality checklists to validate requirements completeness, clarity, and consistency (after /speckit.plan)
