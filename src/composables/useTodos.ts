import { ref, computed } from "vue";
import type { Todo, TodoFilter } from "@/types/todo";

const STORAGE_KEY = "todos_v1";

export function useTodos() {
  const todos = ref<Todo[]>([]);
  const filter = ref<TodoFilter>("all");

  // 从 localStorage 加载数据
  const loadTodos = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        todos.value = parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }));
      }
    } catch (error) {
      console.error("加载待办事项失败:", error);
    }
  };

  // 保存到 localStorage
  const saveTodos = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos.value));
    } catch (error) {
      console.error("保存待办事项失败:", error);
    }
  };

  // 添加新待办事项
  const addTodo = (title: string): void => {
    if (title.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
        title: title.trim(),
        completed: false,
        createdAt: new Date(),
      };
      todos.value.unshift(newTodo);
      saveTodos();
    }
  };

  // 切换待办事项状态
  const toggleTodo = (id: string): void => {
    const todo = todos.value.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos();
    }
  };

  // 删除待办事项
  const deleteTodo = (id: string): void => {
    todos.value = todos.value.filter((t) => t.id !== id);
    saveTodos();
  };

  // 编辑待办事项标题
  const editTodo = (id: string, newTitle: string): void => {
    const todo = todos.value.find((t) => t.id === id);
    if (todo && newTitle.trim()) {
      todo.title = newTitle.trim();
      saveTodos();
    }
  };

  // 清除已完成的待办事项
  const clearCompleted = (): void => {
    todos.value = todos.value.filter((t) => !t.completed);
    saveTodos();
  };

  // 筛选后的待办事项
  const filteredTodos = computed(() => {
    switch (filter.value) {
      case "active":
        return todos.value.filter((t) => !t.completed);
      case "completed":
        return todos.value.filter((t) => t.completed);
      default:
        return todos.value;
    }
  });

  // 待办事项统计
  const stats = computed(() => ({
    total: todos.value.length,
    active: todos.value.filter((t) => !t.completed).length,
    completed: todos.value.filter((t) => t.completed).length,
  }));

  loadTodos();

  return {
    todos: filteredTodos,
    filter,
    stats,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
  };
}
