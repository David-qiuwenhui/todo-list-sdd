import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTodos } from '../useTodos'
import type { Todo } from '@/types/todo'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
}

vi.stubGlobal('localStorage', localStorageMock)

describe('useTodos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该能够添加新的待办事项', () => {
    const { todos, addTodo, stats } = useTodos()

    addTodo('测试任务')

    expect(todos.value).toHaveLength(1)
    expect(todos.value[0].title).toBe('测试任务')
    expect(todos.value[0].completed).toBe(false)
    expect(stats.value.total).toBe(1)
    expect(stats.value.active).toBe(1)
    expect(localStorage.setItem).toHaveBeenCalled()
  })

  it('不应该添加空标题的待办事项', () => {
    const { todos, addTodo, stats } = useTodos()

    addTodo('')
    addTodo('   ')

    expect(todos.value).toHaveLength(0)
    expect(stats.value.total).toBe(0)
  })

  it('应该能够切换待办事项的完成状态', () => {
    const { todos, addTodo, toggleTodo, stats } = useTodos()

    addTodo('测试任务')
    const todoId = todos.value[0].id

    toggleTodo(todoId)

    expect(todos.value[0].completed).toBe(true)
    expect(stats.value.active).toBe(0)
    expect(stats.value.completed).toBe(1)
    expect(localStorage.setItem).toHaveBeenCalled()
  })

  it('应该能够删除待办事项', () => {
    const { todos, addTodo, deleteTodo, stats } = useTodos()

    addTodo('测试任务')
    const todoId = todos.value[0].id

    deleteTodo(todoId)

    expect(todos.value).toHaveLength(0)
    expect(stats.value.total).toBe(0)
    expect(localStorage.setItem).toHaveBeenCalled()
  })

  it('应该能够编辑待办事项标题', () => {
    const { todos, addTodo, editTodo } = useTodos()

    addTodo('原始标题')
    const todoId = todos.value[0].id

    editTodo(todoId, '新标题')

    expect(todos.value[0].title).toBe('新标题')
    expect(localStorage.setItem).toHaveBeenCalled()
  })

  it('不应该编辑为空标题', () => {
    const { todos, addTodo, editTodo } = useTodos()

    addTodo('原始标题')
    const todoId = todos.value[0].id

    editTodo(todoId, '')
    editTodo(todoId, '   ')

    expect(todos.value[0].title).toBe('原始标题')
  })

  it('应该能够清除已完成的待办事项', () => {
    const { todos, addTodo, toggleTodo, clearCompleted, stats } = useTodos()

    addTodo('任务1')
    addTodo('任务2')
    toggleTodo(todos.value[0].id)

    expect(stats.value.completed).toBe(1)

    clearCompleted()

    expect(todos.value).toHaveLength(1)
    expect(stats.value.completed).toBe(0)
    expect(localStorage.setItem).toHaveBeenCalled()
  })

  it('应该能够根据筛选条件过滤待办事项', () => {
    const { todos, addTodo, toggleTodo, filter } = useTodos()

    addTodo('任务1')
    addTodo('任务2')
    toggleTodo(todos.value[0].id)

    filter.value = 'active'
    expect(todos.value).toHaveLength(1)
    expect(todos.value[0].completed).toBe(false)

    filter.value = 'completed'
    expect(todos.value).toHaveLength(1)
    expect(todos.value[0].completed).toBe(true)

    filter.value = 'all'
    expect(todos.value).toHaveLength(2)
  })

  it('应该能够从 localStorage 加载数据', () => {
    const mockData = [
      {
        id: '1',
        title: '已存储的任务',
        completed: false,
        createdAt: new Date().toISOString()
      }
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData))

    const { todos, stats } = useTodos()

    expect(localStorage.getItem).toHaveBeenCalledWith('todos_v1')
    expect(todos.value).toHaveLength(1)
    expect(todos.value[0].title).toBe('已存储的任务')
    expect(stats.value.total).toBe(1)
  })

  it('应该处理 localStorage 读取错误', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error')
    })

    expect(() => useTodos()).not.toThrow()
  })

  it('应该处理 localStorage 保存错误', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage error')
    })

    const { addTodo } = useTodos()

    expect(() => addTodo('测试任务')).not.toThrow()
  })

  it('统计数据应该正确计算', () => {
    const { todos, addTodo, toggleTodo, stats } = useTodos()

    expect(stats.value.total).toBe(0)
    expect(stats.value.active).toBe(0)
    expect(stats.value.completed).toBe(0)

    addTodo('任务1')
    addTodo('任务2')
    addTodo('任务3')

    expect(stats.value.total).toBe(3)
    expect(stats.value.active).toBe(3)
    expect(stats.value.completed).toBe(0)

    toggleTodo(todos.value[0].id)
    toggleTodo(todos.value[1].id)

    expect(stats.value.total).toBe(3)
    expect(stats.value.active).toBe(1)
    expect(stats.value.completed).toBe(2)
  })
})