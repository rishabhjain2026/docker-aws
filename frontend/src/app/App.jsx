import "./App.css";
import Editor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import { useRef, useMemo, useState, useEffect } from "react";
import { SocketIOProvider } from "y-socket.io";

function App() {
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);

  const [userName, setUserName] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });

  const [user, setUser] = useState([]);
  const [editorReady, setEditorReady] = useState(false);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;
    setEditorReady(true);
  };

  const handlesubmit = (e) => {
    e.preventDefault();

    const name = e.target.userName.value.trim();
    if (!name) return;

    setUserName(name);

    window.history.pushState(
      {},
      "",
      `?username=${encodeURIComponent(name)}`
    );
  };

  useEffect(() => {
    if (!userName || !editorReady || !editorRef.current) return;

    const provider = new SocketIOProvider(
      "http://localhost:3000",
      "monaco",
      ydoc,
      { params: { username: userName } }
    );

    providerRef.current = provider;

    provider.awareness.setLocalStateField("user", {
      username: userName,
    });

    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values());

      setUser(
        states
          .map((state) => state.user)
          .filter((person) => person?.username)
      );
    };

    provider.awareness.on("change", updateUsers);
    updateUsers();

    const binding = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );

    bindingRef.current = binding;

    const handleBeforeUnload = () => {
      provider.awareness.setLocalStateField("user", null);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      provider.awareness.off("change", updateUsers);
      binding.destroy();
      provider.destroy();

      bindingRef.current = null;
      providerRef.current = null;
    };
  }, [userName, editorReady, ydoc, yText]);

  if (!userName) {
    return (
      <main className="h-screen w-full flex items-center justify-center bg-gray-950">
        <form
          onSubmit={handlesubmit}
          className="flex flex-col gap-3 bg-gray-800 p-6 rounded-xl"
        >
          <input
            type="text"
            placeholder="Enter name"
            className="p-2 rounded-lg bg-amber-50 text-black"
            name="userName"
            required
          />

          <button
            type="submit"
            className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
          >
            Join
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="h-screen w-full bg-gray-950 p-2 flex gap-2">
      <aside className="w-1/4 h-full bg-amber-50 rounded-lg p-4">
        <h2 className="text-lg font-bold text-gray-950">Online users</h2>

        {user.map((person, index) => (
          <p key={`${person.username}-${index}`} className="text-gray-800">
            {person.username}
          </p>
        ))}
      </aside>

      <section className="w-3/4 h-full bg-purple-400 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  );
}

export default App;