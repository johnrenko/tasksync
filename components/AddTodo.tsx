'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface AddTodoProps {
  onAdd: () => void
}

export default function AddTodo({ onAdd }: AddTodoProps) {
  const [task, setTask] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!task.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('todos')
      .insert({ task, user_id: user.id })
    
    if (error) console.error('Error adding todo:', error)
    else {
      setTask('')
      onAdd()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Add a new todo"
        className="flex-grow p-2 border rounded"
      />
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Add
      </button>
    </form>
  )
}