import TodoList from '@/components/TodoList'
import AuthWrapper from '@/components/AuthWrapper'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo Sync</h1>
      <AuthWrapper>
        <TodoList />
      </AuthWrapper>
    </main>
  )
}