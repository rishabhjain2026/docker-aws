import "./App.css"
import Editor from "@monaco-editor/react"
function App() {
 
  return (
   <main className="h-screen w-full bg-gray-950 p-2 flex gap-2">
      <aside className="w-1/4 h-full bg-amber-50 rounded-lg"></aside>
      <section className="w-3/4 h-full bg-purple-400 rounded-lg overflow-hidden">
      <Editor height="100%" defaultLanguage="javascript" defaultValue="// some comment" theme="vs-dark"  />
      </section>
   </main>
  )
}

export default App
