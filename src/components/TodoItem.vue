<template>
  <li class="todo-item" :class="{ completed: todo.completed }">
    <div class="view">
      <input
        class="toggle"
        type="checkbox"
        :checked="todo.completed"
        @change="toggleTodo(todo.id)"
      />
      <label @dblclick="startEditing">{{ todo.title }}</label>
      <button class="destroy" @click="deleteTodo(todo.id)"></button>
    </div>
    <input
      v-if="editing"
      class="edit"
      v-model="editText"
      @keyup.enter="finishEditing"
      @keyup.escape="cancelEditing"
      @blur="finishEditing"
      ref="editInput"
    />
  </li>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Todo } from '@/types/todo'

interface Props {
  todo: Todo
}

interface Emits {
  toggle: [id: string]
  delete: [id: string]
  edit: [id: string, newTitle: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const editing = ref(false)
const editText = ref(props.todo.title)
const editInput = ref<HTMLInputElement | null>(null)

const toggleTodo = (id: string) => {
  emit('toggle', id)
}

const deleteTodo = (id: string) => {
  emit('delete', id)
}

const startEditing = () => {
  editing.value = true
  editText.value = props.todo.title
  nextTick(() => {
    editInput.value?.focus()
  })
}

const finishEditing = () => {
  if (editing.value) {
    const trimmedText = editText.value.trim()
    if (trimmedText && trimmedText !== props.todo.title) {
      emit('edit', props.todo.id, trimmedText)
    }
    editing.value = false
  }
}

const cancelEditing = () => {
  editing.value = false
  editText.value = props.todo.title
}
</script>

<style scoped>
.todo-item {
  position: relative;
  font-size: 24px;
  border-bottom: 1px solid #ededed;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item.completed label {
  color: #d9d9d9;
  text-decoration: line-through;
}

.view {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle {
  text-align: center;
  width: 40px;
  height: 40px;
  margin: 0;
  opacity: 0;
  position: absolute;
}

.toggle + label {
  flex: 1;
  padding: 15px 15px 15px 60px;
  display: block;
  line-height: 1.2;
  word-break: break-all;
  transition: color 0.4s;
}

.toggle + label:before {
  content: ' ';
  position: absolute;
  top: 10px;
  left: 10px;
  width: 30px;
  height: 30px;
  border: 2px solid #d9d9d9;
  border-radius: 6px;
  transition: all 0.2s;
}

.toggle:checked + label:before {
  background-color: #62c462;
  border-color: #62c462;
}

.toggle:checked + label:after {
  content: '✓';
  position: absolute;
  top: 15px;
  left: 18px;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.destroy {
  position: absolute;
  top: 0;
  right: 10px;
  bottom: 0;
  width: 40px;
  height: 40px;
  margin: auto 0;
  font-size: 30px;
  color: #cc9a9a;
  margin-bottom: 11px;
  transition: color 0.2s ease-out;
  border: none;
  background: none;
  cursor: pointer;
}

.destroy:hover {
  color: #af5b5e;
}

.destroy:after {
  content: '×';
}

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
  padding: 15px 15px 15px 60px;
}

.edit:focus {
  outline: 0;
}
</style>