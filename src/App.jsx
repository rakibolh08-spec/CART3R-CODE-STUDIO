import React, { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { HexColorPicker } from "react-colorful";
import {
  Activity, AppWindow, ChevronDown, Code2, Copy, File, FileCode2, Folder,
  FolderPlus, Gamepad2, Globe, Layers, Menu, MoreHorizontal, Play, Plus,
  Rocket, Save, Smartphone, Store, Terminal, Trash2, Watch, X
} from "lucide-react";

const starter = {
  html: `<!doctype html>
<html>
<head><title>My first page</title></head>
<body>
  <h1>Hello, RAKIB!</h1>
  <p>Your live preview is ready.</p>
  <button onclick="document.querySelector('p').textContent='Button clicked!'">Try me</button>
</body>
</html>`,
  javascript: `// JavaScript playground
const greeting = "Hello from RAKIB Code Studio!";
console.log(greeting);
document.body.innerHTML = "<h1>" + greeting + "</h1><p>Edit the code and press Run.</p>";`,
  css: `body { font-family: system-ui; background: #101b16; color: #8cffb0; padding: 32px; }
h1 { color: #48ff91; }`,
  python: `# Python example
name = "RAKIB"
print(f"Hello, {name}!")`,
  java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, RAKIB!");
  }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, RAKIB!" << endl;
    return 0;
}`,
  typescript: `const message: string = "Hello, RAKIB!";
console.log(message);`
};

const languageOptions = [
  ["html", "HTML"], ["css", "CSS"], ["javascript", "JavaScript"],
  ["typescript", "TypeScript"], ["python", "Python"], ["java", "Java"], ["cpp", "C++"]
];

const starterTree = [
  { id: "folder-web", type: "folder", name: "web-project", open: true, children: [
    { id: "file-html", type: "file", name: "index.html", language: "html", content: starter.html },
    { id: "file-css", type: "file", name: "style.css", language: "css", content: starter.css },
    { id: "file-js", type: "file", name: "script.js", language: "javascript", content: starter.javascript }
  ]},
  { id: "folder-python", type: "folder", name: "python-lab", open: true, children: [
    { id: "file-py", type: "file", name: "main.py", language: "python", content: starter.python }
  ]}
];

const uid = () => Math.random().toString(36).slice(2, 10);

function SpiderClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  });

  const date = now.toLocaleDateString([], {
    weekday: "short", month: "short", day: "numeric"
  });

  return <div className="clock-wrap">
    <div className="spider-clock" aria-label={`Current time ${time}`}>
      {[0,1,2,3,4,5,6,7].map(n => <i key={n} className={`leg leg-${n}`} />)}
      <div className="clock-face">
        <span className="clock-dot" />
        <strong>{time}</strong>
        <small>{date}</small>
      </div>
    </div>
    <div className="clock-label">
      <span className="live-dot" /> LOCAL SYSTEM TIME <b>LIVE</b>
    </div>
  </div>;
}

function App() {
  const [tree, setTree] = useState(starterTree);
  const [activeId, setActiveId] = useState("file-html");
  const [activeTab, setActiveTab] = useState("index.html");
  const [output, setOutput] = useState("Ready. Select a file and press Run.");
  const [preview, setPreview] = useState("");
  const [activePanel, setActivePanel] = useState("editor");
  const [projectType, setProjectType] = useState("Web app");
  const [showNew, setShowNew] = useState(false);
  const [newKind, setNewKind] = useState("file");
  const [newName, setNewName] = useState("");
  const [targetFolder, setTargetFolder] = useState("folder-web");
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [expanded, setExpanded] = useState({
    "folder-web": true,
    "folder-python": true
  });
  const [mobileMenu, setMobileMenu] = useState(false);
  const pressTimer = useRef(null);
  const longPressed = useRef(false);

  const findNode = (nodes, id) => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const f = findNode(n.children, id);
        if (f) return f;
      }
    }
    return null;
  };

  const activeFile = findNode(tree, activeId);
  const language = activeFile?.language || "javascript";
  const code = activeFile?.content ?? "";

  const setCode = (value) => setTree(old => {
    const update = nodes => nodes.map(n =>
      n.id === activeId
        ? { ...n, content: value }
        : n.children
          ? { ...n, children: update(n.children) }
          : n
    );
    return update(old);
  });

  const addNode = () => {
    const name = newName.trim();
    if (!name) return;

    if (newKind === "folder") {
      setTree(old => [...old, {
        id: uid(), type: "folder", name, open: true, children: []
      }]);
    } else {
      const ext = name.split(".").pop().toLowerCase();
      const lang = ({
        htm: "html", html: "html", css: "css", js: "javascript",
        mjs: "javascript", ts: "typescript", py: "python",
        java: "java", cpp: "cpp", cc: "cpp", cxx: "cpp"
      })[ext] || "javascript";

      const node = {
        id: uid(),
        type: "file",
        name,
        language: lang,
        content: starter[lang] || ""
      };

      const addTo = nodes => nodes.map(n =>
        n.id === targetFolder && n.type === "folder"
          ? { ...n, children: [...n.children, node] }
          : n.children
            ? { ...n, children: addTo(n.children) }
            : n
      );

      setTree(old => addTo(old));
      setActiveId(node.id);
      setActiveTab(name);
    }

    setNewName("");
    setShowNew(false);
  };

  const startRename = node => {
    setRenaming(node.id);
    setRenameValue(node.name);
  };

  const commitRename = () => {
    const update = nodes => nodes.map(n =>
      n.id === renaming
        ? { ...n, name: renameValue.trim() || n.name }
        : n.children
          ? { ...n, children: update(n.children) }
          : n
    );

    setTree(old => update(old));
    setRenaming(null);
  };

  const removeNode = id => {
    const prune = nodes => nodes
      .filter(n => n.id !== id)
      .map(n => n.children ? { ...n, children: prune(n.children) } : n);

    setTree(old => prune(old));

    if (activeId === id) {
      setActiveId("file-html");
      setActiveTab("index.html");
    }
  };

  const runCode = () => {
    if (!activeFile) return;

    if (language === "html") {
      setPreview(code);
      setOutput("HTML preview updated successfully.");
      setActivePanel("preview");
      return;
    }

    if (language === "javascript") {
      const safeDoc = `<!doctype html><html><head><meta charset="utf-8"><style>body{font:16px system-ui;background:#0a110d;color:#9bffb9;padding:20px}button{padding:10px 16px;border-radius:12px;border:1px solid #36d875;background:#10271a;color:#a6ffc0}</style></head><body><div id="app"></div><script>
      const send=(...args)=>parent.postMessage({cart3rLog:args.map(x=>{try{return typeof x==='string'?x:JSON.stringify(x)}catch(e){return String(x)}}).join(' ')},'*');
      console.log=send; console.info=send; console.warn=send; console.error=send;
      try { ${code}\n } catch(e) { send('Error: '+e.message); }
      <\/script></body></html>`;

      setPreview(safeDoc);
      setOutput("JavaScript ran in an isolated preview frame. Console messages appear here.");
      setActivePanel("preview");
      return;
    }

    if (language === "css") {
      setPreview(`<html><body><h1>CSS preview</h1><p>Your stylesheet is applied below.</p><style>${code}</style></body></html>`);
      setOutput("CSS preview generated.");
      setActivePanel("preview");
      return;
    }

    setOutput(`${languageOptions.find(x=>x[0]===language)?.[1] || language} source is ready, but this browser-only starter does not compile that language. Use a trusted local compiler or connect your own build backend. No code was sent to a server.`);
    setActivePanel("output");
  };

  useEffect(() => {
    const listener = e => {
      if (e.data?.cart3rLog) {
        setOutput(old => old + "\n> " + e.data.cart3rLog);
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  const renderTree = nodes => nodes.map(node => <div key={node.id}>
    {node.type === "folder" ? (
      <div
        className="tree-row folder-row"
        onClick={() => setExpanded(s => ({ ...s, [node.id]: !s[node.id] }))}
        onContextMenu={e => {
          e.preventDefault();
          startRename(node);
        }}
      >
        <Folder size={15}/>
        <span className="tree-name">
          {renaming === node.id ? (
            <input
              autoFocus
              value={renameValue}
              onChange={e=>setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e=>e.key==="Enter"&&commitRename()}
              onClick={e=>e.stopPropagation()}
            />
          ) : node.name}
        </span>
        <button
          className="tiny-icon"
          title="Rename folder"
          onClick={e=>{
            e.stopPropagation();
            startRename(node);
          }}
        >
          <MoreHorizontal size={15}/>
        </button>
      </div>
    ) : (
      <div
        className={`tree-row file-row ${activeId===node.id?"selected":""}`}
        onClick={()=>{
          setActiveId(node.id);
          setActiveTab(node.name);
        }}
        onContextMenu={e=>{
          e.preventDefault();
          startRename(node);
        }}
      >
        <FileCode2 size={14}/>
        <span className="tree-name">
          {renaming===node.id ? (
            <input
              autoFocus
              value={renameValue}
              onChange={e=>setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e=>e.key==="Enter"&&commitRename()}
              onClick={e=>e.stopPropagation()}
            />
          ) : node.name}
        </span>
        <button
          className="tiny-icon"
          title="Rename file"
          onClick={e=>{
            e.stopPropagation();
            startRename(node);
          }}
        >
          <MoreHorizontal size={15}/>
        </button>
      </div>
    )}

    {node.type==="folder" && expanded[node.id] && (
      <div className="tree-children">
        {renderTree(node.children || [])}
      </div>
    )}
  </div>);

  const projectCards = [
    {
      name: "Mobile App",
      desc: "Plan and prototype Android or iOS apps.",
      icon: Smartphone,
      type: "Mobile app"
    },
    {
      name: "Mobile Game",
      desc: "Start a game project with scenes and assets.",
      icon: Gamepad2,
      type: "Mobile game"
    },
    {
      name: "Business Store",
      desc: "Build a storefront for products and services.",
      icon: Store,
      type: "Business store"
    },
    {
      name: "Website",
      desc: "Create a responsive website or web app.",
      icon: Globe,
      type: "Web app"
    }
  ];

  return <div className="app-shell">
    <div className="matrix-bg" aria-hidden="true">
      {Array.from({length:22},(_,i)=>
        <span
          key={i}
          style={{
            left:`${(i*4.73)%100}%`,
            animationDelay:`-${(i%9)*1.7}s`
          }}
        >
          {("01アイウエオCODE").repeat(5)}
        </span>
      )}
    </div>

    <header className="topbar">
      <button
        className="brand-mark"
        onClick={()=>setActivePanel("editor")}
      >
        <Code2 size={22}/>
      </button>

      <div className="brand">
        <b>RAKIB<span>.</span></b>
        <small>CODE STUDIO</small>
      </div>

      <div className="top-clock">
        <SpiderClock/>
      </div>

      <div className="top-actions">
        <span className="status-pill"><i/> LOCAL WORKSPACE</span>
        <button
          className="liquid-icon"
          onClick={()=>setMobileMenu(!mobileMenu)}
        >
          <Menu size={19}/>
        </button>
      </div>
    </header>

    <div className="welcome-row">
      <div>
        <div className="eyebrow">
          <Activity size={13}/> CREATIVE DEVELOPMENT ENVIRONMENT
        </div>
        <h1>Build something <em>brilliant.</em></h1>
        <p>Your ideas, your files, your workspace. All in one place.</p>
      </div>

      <button
        className="liquid-button primary"
        onClick={()=>{
          setNewKind("file");
          setShowNew(true);
        }}
      >
        <Plus size={16}/> New file
      </button>
    </div>

    <nav className={`main-nav ${mobileMenu?"nav-open":""}`}>
      {["editor","projects","workspace"].map(p=>
        <button
          key={p}
          className={activePanel===p?"nav-active":""}
          onClick={()=>{
            setActivePanel(p);
            setMobileMenu(false);
          }}
        >
          {p==="editor" ? <Code2 size={15}/> :
           p==="projects" ? <Layers size={15}/> :
           <Folder size={15}/>}
          {" "}{p[0].toUpperCase()+p.slice(1)}
        </button>
      )}

      <div className="nav-spacer"/>
      <span className="save-status">
        <span/> Autosave on this device
      </span>
    </nav>

    {activePanel==="projects" ? (
      <main className="projects-view">
        <div className="section-heading">
          <div>
            <div className="eyebrow">START WITH A TEMPLATE</div>
            <h2>What are we making?</h2>
          </div>
        </div>

        <div className="project-grid">
          {projectCards.map(card=>
            <button
              className="project-card"
              key={card.type}
              onClick={()=>{
                setProjectType(card.type);
                setActivePanel("editor");
              }}
            >
              <div className="project-icon">
                <card.icon size={23}/>
              </div>
              <h3>{card.name}</h3>
              <p>{card.desc}</p>
              <span>Choose template <span>↗</span></span>
            </button>
          )}
        </div>

        <div className="hint-card">
          <Rocket size={20}/>
          <div>
            <b>Make it yours</b>
            <p>Templates are starting points. You can add folders and files, then edit them in the workspace.</p>
          </div>
        </div>
      </main>
    ) : (
      <main className="workspace">
        <aside className="sidebar panel">
          <div className="panel-title">
            <div><Folder size={15}/> EXPLORER</div>
            <div className="side-tools">
              <button
                title="New file"
                onClick={()=>{
                  setNewKind("file");
                  setShowNew(true);
                }}
              >
                <File size={15}/>
              </button>
              <button
                title="New folder"
                onClick={()=>{
                  setNewKind("folder");
                  setShowNew(true);
                }}
              >
                <FolderPlus size={15}/>
              </button>
            </div>
          </div>

          <div className="project-root">
            <ChevronDown size={13}/> CART3R-PROJECT <span>...</span>
          </div>

          <div className="file-tree">{renderTree(tree)}</div>

          <div className="sidebar-bottom">
            <div className="eyebrow">PROJECT TYPE</div>
            <select
              value={projectType}
              onChange={e=>setProjectType(e.target.value)}
            >
              <option>Web app</option>
              <option>Mobile app</option>
              <option>Mobile game</option>
              <option>Business store</option>
            </select>
          </div>
        </aside>

        <section className="editor-area panel">
          <div className="editor-toolbar">
            <div className="tab">
              <FileCode2 size={14}/>
              {activeFile?.name || "No file selected"}
              <span className="unsaved-dot"/>
            </div>

            <div className="toolbar-right">
              <span className="language-label">{language.toUpperCase()}</span>
              <button
                className="liquid-button run-button"
                onClick={runCode}
              >
                <Play size={14} fill="currentColor"/> Run
              </button>
            </div>
          </div>

          <div className="editor-wrap">
            {activeFile ? (
              <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={v=>setCode(v ?? "")}
                options={{
                  minimap:{enabled:false},
                  fontSize:14,
                  fontFamily:"'JetBrains Mono', monospace",
                  lineNumbers:"on",
                  automaticLayout:true,
                  scrollBeyondLastLine:false,
                  padding:{top:18},
                  roundedSelection:true,
                  cursorBlinking:"smooth",
                  smoothScrolling:true,
                  wordWrap:"on",
                  tabSize:2,
                  colorDecorators: true,
                  colorDecoratorsActivatedOn: "clickAndHover",
                  defaultColorDecorators: "always",
                }}
              />
            ) : (
              <div className="empty-editor">
                Choose a file from the explorer or create a new one.
              </div>
            )}
          </div>

          <div className="editor-footer">
            <span><i/> Ready</span>
            <span>UTF-8</span>
            <span>{language}</span>
            <span>Ln 1, Col 1</span>
          </div>
        </section>

        <aside className="output-area panel">
          <div className="output-header">
            <div><Terminal size={15}/> OUTPUT</div>
            <div className="output-actions">
              <button
                title="Copy output"
                onClick={()=>navigator.clipboard?.writeText(output)}
              >
                <Copy size={14}/>
              </button>
              <button
                title="Clear output"
                onClick={()=>setOutput("")}
              >
                <Trash2 size={14}/>
              </button>
            </div>
          </div>

          <div className="output-tabs">
            <button
              className={activePanel==="preview"?"chosen":""}
              onClick={()=>setActivePanel("preview")}
            >
              Preview
            </button>
            <button
              className={activePanel==="output"?"chosen":""}
              onClick={()=>setActivePanel("output")}
            >
              Console
            </button>
          </div>

          {activePanel==="preview" ? (
            <div className="preview-float">
              <div className="preview-caption">
                <span className="live-dot"/> LIVE PREVIEW
              </div>
              <iframe
                title="Code output preview"
                sandbox="allow-scripts"
                srcDoc={preview || "<html><body style='background:#0b110d;color:#86ffa9;font:15px system-ui;padding:20px'>Press Run to see your output.</body></html>"}
              />
            </div>
          ) : (
            <pre className="console-output">
              {output || "Console cleared."}
            </pre>
          )}

          <div className="output-foot">
            <span className="live-dot"/> SANDBOXED LOCAL PREVIEW
          </div>
        </aside>
      </main>
    )}

    {showNew && (
      <div
        className="modal-backdrop"
        onClick={()=>setShowNew(false)}
      >
        <div
          className="new-modal"
          onClick={e=>e.stopPropagation()}
        >
          <div className="modal-head">
            <div>
              <div className="eyebrow">WORKSPACE</div>
              <h3>Create {newKind}</h3>
            </div>
            <button
              className="tiny-icon"
              onClick={()=>setShowNew(false)}
            >
              <X size={18}/>
            </button>
          </div>

          <div className="kind-switch">
            <button
              className={newKind==="file"?"active":""}
              onClick={()=>setNewKind("file")}
            >
              <File size={14}/> File
            </button>
            <button
              className={newKind==="folder"?"active":""}
              onClick={()=>setNewKind("folder")}
            >
              <Folder size={14}/> Folder
            </button>
          </div>

          <label>Name</label>
          <input
            autoFocus
            placeholder={newKind==="file"?"example.js":"new-folder"}
            value={newName}
            onChange={e=>setNewName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addNode()}
          />

          {newKind==="file" && (
            <>
              <label>Parent folder</label>
              <select
                value={targetFolder}
                onChange={e=>setTargetFolder(e.target.value)}
              >
                {(function flatten(nodes) {
                  return nodes.flatMap(n =>
                    n.type==="folder"
                      ? [
                          <option key={n.id} value={n.id}>{n.name}</option>,
                          ...flatten(n.children||[])
                        ]
                      : []
                  );
                })(tree)}
              </select>
            </>
          )}

          <button
            className="liquid-button primary modal-create"
            onClick={addNode}
          >
            <Plus size={15}/> Create {newKind}
          </button>
        </div>
      </div>
    )}

    <footer className="app-footer">
      <span>© 2026 RAKIB CODE STUDIO</span>
      <span>DESIGNED FOR MAKERS <b>●</b></span>
    </footer>
  </div>;
}

export default App;
