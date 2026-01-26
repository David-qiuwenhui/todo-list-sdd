<template>
  <section class="todoapp">
    <header class="header">
      <h1>待办事项</h1>
      <input
        class="new-todo"
        v-model="newTodo"
        @keyup.enter="handleAddTodo"
        placeholder="有什么需要完成的？"
        autofocus
      />
    </header>

    <section class="main" v-show="todos.length">
      <input
        id="toggle-all"
        class="toggle-all"
        type="checkbox"
        :checked="allCompleted"
        @change="toggleAll"
      />
      <label for="toggle-all">标记全部为已完成</label>
      <ul class="todo-list">
        <TodoItem
          v-for="todo in todos"
          :key="todo.id"
          :todo="todo"
          @toggle="toggleTodo"
          @delete="deleteTodo"
          @edit="editTodo"
        />
      </ul>
    </section>

    <footer class="footer" v-show="todos.length">
      <span class="todo-count">
        <strong>{{ stats.active }}</strong>
        <span>{{ remainingText }}</span>
      </span>

      <ul class="filters">
        <li>
          <a
            href="#/"
            :class="{ selected: filter === 'all' }"
            @click.prevent="setFilter('all')"
          >
            全部
          </a>
        </li>
        <li>
          <a
            href="#/active"
            :class="{ selected: filter === 'active' }"
            @click.prevent="setFilter('active')"
          >
            未完成
          </a>
        </li>
        <li>
          <a
            href="#/completed"
            :class="{ selected: filter === 'completed' }"
            @click.prevent="setFilter('completed')"
          >
            已完成
          </a>
        </li>
      </ul>

      <button
        class="clear-completed"
        v-show="stats.completed"
        @click="clearCompleted"
      >
        清除已完成 ({{ stats.completed }})
      </button>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTodos } from '@/composables/useTodos'
import TodoItem from './TodoItem.vue'
import type { TodoFilter } from '@/types/todo'

const {
  todos,
  filter,
  stats,
  addTodo,
  toggleTodo,
  deleteTodo,
  editTodo,
  clearCompleted
} = useTodos()

const newTodo = ref('')

const handleAddTodo = () => {
  if (newTodo.value.trim()) {
    addTodo(newTodo.value)
    newTodo.value = ''
  }
}

const setFilter = (newFilter: TodoFilter) => {
  filter.value = newFilter
}

const allCompleted = computed(() => {
  return stats.value.total > 0 && stats.value.active === 0
})

const toggleAll = () => {
  const shouldComplete = stats.value.active > 0
  todos.value.forEach(todo => {
    if (shouldComplete && !todo.completed) {
      toggleTodo(todo.id)
    } else if (!shouldComplete && todo.completed) {
      toggleTodo(todo.id)
    }
  })
}

const remainingText = computed(() => {
  const count = stats.value.active
  return count === 1 ? ' 项待完成' : ' 项待完成'
})
</script>

<style scoped>
.todoapp {
  font: 14px 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: #fff;
  color: #4d4d4d;
  margin: 130px 0 40px 0;
  position: relative;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1);
}

.todoapp input::-webkit-input-placeholder {
  font-style: italic;
  font-weight: 300;
  color: #e6e6e6;
}

.todoapp input::-moz-placeholder {
  font-style: italic;
  font-weight: 300;
  color: #e6e6e6;
}

.todoapp input::input-placeholder {
  font-style: italic;
  font-weight: 300;
  color: #e6e6e6;
}

.header {
  padding-top: 15px;
  border-radius: inherit;
}

.header h1 {
  position: absolute;
  top: -155px;
  width: 100%;
  font-size: 100px;
  font-weight: 100;
  text-align: center;
  color: rgba(175, 47, 47, 0.15);
  -webkit-text-rendering: optimizeLegibility;
  -moz-text-rendering: optimizeLegibility;
  text-rendering: optimizeLegibility;
}

.new-todo,
.edit {
  position: relative;
  margin: 0;
  width: 100%;
  font-size: 24px;
  font-family: inherit;
  font-weight: inherit;
  line-height: 1.4em;
  border: 0;
  color: inherit;
  padding: 6px;
  border: 1px solid #999;
  box-shadow: inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.new-todo {
  padding: 16px 16px 16px 60px;
  border: none;
  background: rgba(0, 0, 0, 0.003);
  box-shadow: inset 0 -2px 1px rgba(0, 0, 0, 0.03);
}

.main {
  position: relative;
  z-index: 2;
  border-top: 1px solid #e6e6e6;
}

.toggle-all {
  width: 1px;
  height: 1px;
  border: none;
  opacity: 0;
  position: absolute;
  right: 100%;
}

.toggle-all + label {
  width: 60px;
  height: 34px;
  font-size: 0;
  position: absolute;
  top: -52px;
  left: -13px;
}

.toggle-all + label:before {
  content: '❯';
  font-size: 22px;
  color: #e6e6e6;
  padding: 10px 27px 10px 27px;
  transform: rotate(90deg);
  display: inline-block;
}

.toggle-all:checked + label:before {
  color: #737373;
}

.todo-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer {
  color: #777;
  padding: 10px 15px;
  height: 20px;
  text-align: center;
  border-top: 1px solid #e6e6e6;
}

.footer:before {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 50px;
  overflow: hidden;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2), 0 8px 0 -3px #f6f6f6, 0 9px 1px -3px rgba(0, 0, 0, 0.2), 0 16px 0 -6px #f6f6f6, 0 17px 2px -6px rgba(0, 0, 0, 0.2);
}

.todo-count {
  float: left;
  text-align: left;
}

.todo-count strong {
  font-weight: 300;
}

.filters {
  margin: 0;
  padding: 0;
  list-style: none;
  position: absolute;
  right: 0;
  left: 0;
}

.filters li {
  display: inline;
}

.filters li a {
  color: inherit;
  margin: 3px;
  padding: 3px 7px;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 3px;
}

.filters li a:hover {
  border-color: rgba(175, 47, 47, 0.1);
}

.filters li a.selected {
  border-color: rgba(175, 47, 47, 0.2);
}

.clear-completed,
html .clear-completed:active {
  float: right;
  position: relative;
  line-height: 20px;
  text-decoration: none;
  cursor: pointer;
  position: relative;
}

.clear-completed:hover {
  text-decoration: underline;
}

@media screen and (-webkit-min-device-pixel-ratio: 0) {
  .toggle-all,
  .new-todo {
    background: none;
  }

  .new-todo {
    width: 566px;
  }
}
</style>