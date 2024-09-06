'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AddTodo from './AddTodo'

interface Todo {
  id: string
  task: string
  is_completed: boolean
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    fetchTodos()
    const subscription = supabase
      .channel('todos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, fetchTodos)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchTodos() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error('Error fetching todos:', error)
    else setTodos(data || [])
  }

  async function toggleTodo(id: string, isCompleted: boolean) {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !isCompleted })
      .eq('id', id)
    
    if (error) {
      console.error('Error updating todo:', error)
    } else {
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, is_completed: !isCompleted } : todo
      ))
    }
  }

  async function deleteTodo(id: string) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting todo:', error)
    } else {
      setTodos(todos.filter(todo => todo.id !== id))
    }
  }

  return (
    <div>
      <AddTodo onAdd={fetchTodos} />
      <ul className="mt-4">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={todo.is_completed}
                onChange={() => toggleTodo(todo.id, todo.is_completed)}
                className="mr-2"
              />
              <span className={todo.is_completed ? 'line-through' : ''}>
                {todo.task}
              </span>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}