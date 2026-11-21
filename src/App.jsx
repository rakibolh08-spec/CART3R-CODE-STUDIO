import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Activity, ChevronDown, Code2, Copy, File, FileCode2, Folder,
  FolderPlus, Gamepad2, Globe, Layers, Menu, MoreHorizontal, Play,
  Plus, Rocket, Smartphone, Store, Terminal, Trash2, X
} from "lucide-react";

const starter = {
  html: `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My first page</title>
</head>
<body>
  <h1>Hello, RAKIB!</h1>
  <p>Your live preview is ready.</p>
  <button onclick="document.querySelector('p').textContent='Button clicked!'">Try me</button>
</body>
</html>`,

  javascript: `// JavaScript playground
const greeting = "Hello from RAKIB Code Studio!";
console.log(greeting);`,

  css: `body {
  font-family: system-ui;
  background: #101b16;
  color: #8cffb0;
  padding: 32px;
}
h1 {
  color: #48ff91;
}`,

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
  ["html", "HTML"],
  ["css", "CSS"],
  ["javascript", "JavaScript"],
  ["typescript", "TypeScript"],
  ["python", "Python"],
  ["java", "Java"],
  ["cpp", "C++"]
];

const starterTree = [
  {
    id: "folder-web",
    type: "folder",
    name: "web-project",
    open: true,
    children: [
      {
        id: "file-html",
        type: "file",
        name: "index.html",
        language: "html",
        content: starter.html
      },
      {
        id: "file-css",
        type: "file",
        name: "style.css",
        language: "css",
        content: starter.css
      },
      {
        id: "file-js",
        type: "file",
        name: "script.js",
        language: "javascript",
        content: starter.javascript
      }
    ]
  },
  {
    id: "folder-python",
    type: "folder",
    name: "python-lab",
    open: true,
    children: [
      {
        id: "file-py",
        type: "file",
        name: "main.py",
        language: "python",
        content: starter.python
      }
    ]
  }
];

const uid = () => Math.random().toString(36).slice(2, 10);

function SpiderClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const date = now.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric"
  });

  return (
    <div className="clock-wrap">
      <div className="spider-clock" aria-label={`Current time ${time}`}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(n => (
          <i key={n} className={`leg leg-${n}`} />
        ))}

        <div className="clock-face">
          <span className="clock-dot" />
          <strong>{time}</strong>
          <small>{date}</small>
        </div>
      </div>

      <div className="clock-label">
        <span className="live-dot" /> LOCAL SYSTEM TIME <b>LIVE</b>
      </div>
    </div>
  );
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
    for (const node of nodes) {
      if (node.id === id) return node;

      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }

    return null;
  };

  // Find the folder that directly contains a file.
  const findParentFolder = (nodes, id, parent = null) => {
    for (const node of nodes) {
      if (node.id === id) return parent;

      if (node.children) {
        const found = findParentFolder(
          node.children,
          id,
          node.type === "folder" ? node : parent
        );

        if (found) return found;
      }
    }

    return null;
  };

  const collectFiles = (nodes, result = []) => {
    nodes.forEach(node => {
      if (node.type === "file") {
        result.push(node);
      } else if (node.children) {
        collectFiles(node.children, result);
      }
    });

    return result;
  };

  const activeFile = findNode(tree, activeId);
  const language = activeFile?.language || "javascript";
  const code = activeFile?.content ?? "";

  const setCode = value => {
    setTree(old => {
      const update = nodes =>
        nodes.map(node =>
          node.id === activeId
            ? { ...node, content: value }
            : node.children
              ? { ...node, children: update(node.children) }
              : node
        );

      return update(old);
    });
  };

  const addNode = () => {
    const name = newName.trim();

    if (!name) return;

    if (newKind === "folder") {
      const newFolder = {
        id: uid(),
        type: "folder",
        name,
        open: true,
        children: []
      };

      setTree(old => [...old, newFolder]);
      setExpanded(old => ({ ...old, [newFolder.id]: true }));
    } else {
      const ext = name.split(".").pop().toLowerCase();

      const lang = ({
        htm: "html",
        html: "html",
        css: "css",
        js: "javascript",
        mjs: "javascript",
        ts: "typescript",
        py: "python",
        java: "java",
        cpp: "cpp",
        cc: "cpp",
        cxx: "cpp"
      })[ext] || "javascript";

      const node = {
        id: uid(),
        type: "file",
        name,
        language: lang,
        content: starter[lang] || ""
      };

      const addTo = nodes =>
        nodes.map(item =>
          item.id === targetFolder && item.type === "folder"
            ? { ...item, children: [...(item.children || []), node] }
            : item.children
              ? { ...item, children: addTo(item.children) }
              : item
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
    const update = nodes =>
      nodes.map(node =>
        node.id === renaming
          ? { ...node, name: renameValue.trim() || node.name }
          : node.children
            ? { ...node, children: update(node.children) }
            : node
      );

    setTree(old => update(old));
    setRenaming(null);
  };

  const removeNode = id => {
    const prune = nodes =>
      nodes
        .filter(node => node.id !== id)
        .map(node =>
          node.children
            ? { ...node, children: prune(node.children) }
            : node
        );

    setTree(old => prune(old));

    if (activeId === id) {
      setActiveId("file-html");
      setActiveTab("index.html");
    }
  };

  // Run HTML, CSS and JavaScript from the same project folder.
  const runCode = () => {
    if (!activeFile) return;

    const parentFolder = findParentFolder(tree, activeId);

    const projectFiles = parentFolder
      ? collectFiles(parentFolder.children || [])
      : collectFiles(tree);

    const getFile = name =>
      projectFiles.find(
        file => file.name.toLowerCase() === name.toLowerCase()
      );

    const htmlFile =
      getFile("index.html") ||
      (activeFile.language === "html" ? activeFile : null);

    // Run a complete web project together.
    if (htmlFile) {
      let html = htmlFile.content || "";

      const cssFile = getFile("style.css") || getFile("styles.css");
      const jsFile = getFile("script.js") || getFile("main.js");

      const safeCss = cssFile
        ? (cssFile.content || "").replace(/<\/style/gi, "<\\/style")
        : "";

      const safeJs = jsFile
        ? (jsFile.content || "").replace(/<\/script/gi, "<\\/script")
        : "";

      // Replace linked local CSS files with their actual editor content.
      if (cssFile) {
        const cssLinkPattern =
          /<link\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;

        let cssWasLinked = false;

        html = html.replace(cssLinkPattern, (tag, href) => {
          const linkedName = href.split("/").pop().split("?")[0];

          if (linkedName.toLowerCase() === cssFile.name.toLowerCase()) {
            cssWasLinked = true;
            return `<style>${safeCss}</style>`;
          }

          return tag;
        });

        if (!cssWasLinked && !html.includes(`>${safeCss}</style>`)) {
          if (/<\/head>/i.test(html)) {
            html = html.replace(
              /<\/head>/i,
              `<style>${safeCss}</style></head>`
            );
          } else {
            html = `<style>${safeCss}</style>${html}`;
          }
        }
      }

      // Capture console messages from the preview iframe.
      const consoleBridge = `
<script>
(function () {
  const send = (...args) => {
    const message = args.map(value => {
      try {
        return typeof value === "string"
          ? value
          : JSON.stringify(value);
      } catch (error) {
        return String(value);
      }
    }).join(" ");

    parent.postMessage({ cart3rLog: message }, "*");
  };

  console.log = send;
  console.info = send;
  console.warn = send;
  console.error = send;
})();
<\/script>`;

      if (jsFile) {
        const scriptPattern =
          /<script\b([^>]*)\bsrc\s*=\s*["']([^"']+)["'][^>]*>\s*<\/script>/gi;

        let jsWasLinked = false;

        html = html.replace(scriptPattern, (tag, attributes, src) => {
          const linkedName = src.split("/").pop().split("?")[0];

          if (linkedName.toLowerCase() === jsFile.name.toLowerCase()) {
            jsWasLinked = true;
            return `<script>${safeJs}<\/script>`;
          }

          return tag;
        });

        if (!jsWasLinked) {
          const scriptTag = `<script>${safeJs}<\/script>`;

          if (/<\/body>/i.test(html)) {
            html = html.replace(
              /<\/body>/i,
              `${scriptTag}</body>`
            );
          } else {
            html += scriptTag;
          }
        }
      }

      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(
          /<head[^>]*>/i,
          match => `${match}${consoleBridge}`
        );
      } else {
        html = `${consoleBridge}${html}`;
      }

      setPreview(html);
      setOutput("Project preview updated successfully.");
      setActivePanel("preview");
      return;
    }

    // Run a single HTML file.
    if (language === "html") {
      setPreview(code);
      setOutput("HTML preview updated successfully.");
      setActivePanel("preview");
      return;
    }

    // Run a standalone JavaScript file.
    if (language === "javascript") {
      const safeDoc = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body {
  font: 16px system-ui;
  background: #0a110d;
  color: #9bffb9;
  padding: 20px;
}
button {
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #36d875;
  background: #10271a;
  color: #a6ffc0;
}
</style>
</head>
<body>
<div id="app"></div>
<script>
const send = (...args) => parent.postMessage({
  cart3rLog: args.map(x => {
    try {
      return typeof x === "string" ? x : JSON.stringify(x);
    } catch (e) {
      return String(x);
    }
  }).join(" ")
}, "*");

console.log = send;
console.info = send;
console.warn = send;
console.error = send;

try {
  ${code}
} catch (e) {
  send("Error: " + e.message);
}
<\/script>
</body>
</html>`;

      setPreview(safeDoc);
      setOutput(
        "JavaScript ran in an isolated preview frame. Console messages appear here."
      );
      setActivePanel("preview");
      return;
    }

    // Show a CSS preview.
    if (language === "css") {
      const safeCss = code.replace(/<\/style/gi, "<\\/style");

      setPreview(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${safeCss}</style>
</head>
<body>
<h1>CSS preview</h1>
<p>Your stylesheet is applied below.</p>
<button>Example button</button>
</body>
</html>`);

      setOutput("CSS preview generated.");
      setActivePanel("preview");
      return;
    }

    setOutput(
      `${languageOptions.find(item => item[0] === language)?.[1] || language} source is ready, but this browser-only starter does not compile that language. Use a trusted local compiler or connect your own build backend. No code was sent to a server.`
    );

    setActivePanel("output");
  };

  useEffect(() => {
    const listener = event => {
      if (event.data?.cart3rLog) {
        setOutput(old => old + "\n> " + event.data.cart3rLog);
      }
    };

    window.addEventListener("message", listener);

    return () => window.removeEventListener("message", listener);
  }, []);

  const renderTree = nodes =>
    nodes.map(node => (
      <div key={node.id}>
        {node.type === "folder" ? (
          <div
            className="tree-row folder-row"
            onClick={() =>
              setExpanded(old => ({
                ...old,
                [node.id]: !old[node.id]
              }))
            }
            onContextMenu={event => {
              event.preventDefault();
              startRename(node);
            }}
          >
            <Folder size={15} />

            <span className="tree-name">
              {renaming === node.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={event => setRenameValue(event.target.value)}
                  onBlur={commitRename}
                  onKeyDown={event =>
                    event.key === "Enter" && commitRename()
                  }
                  onClick={event => event.stopPropagation()}
                />
              ) : node.name}
            </span>

            <button
              className="tiny-icon"
              title="Rename folder"
              onClick={event => {
                event.stopPropagation();
                startRename(node);
              }}
            >
              <MoreHorizontal size={15} />
            </button>
          </div>
        ) : (
          <div
            className={`tree-row file-row ${
              activeId === node.id ? "selected" : ""
            }`}
            onClick={() => {
              setActiveId(node.id);
              setActiveTab(node.name);
            }}
            onContextMenu={event => {
              event.preventDefault();
              startRename(node);
            }}
          >
            <FileCode2 size={14} />

            <span className="tree-name">
              {renaming === node.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={event => setRenameValue(event.target.value)}
                  onBlur={commitRename}
                  onKeyDown={event =>
                    event.key === "Enter" && commitRename()
                  }
                  onClick={event => event.stopPropagation()}
                />
              ) : node.name}
            </span>

            <button
              className="tiny-icon"
              title="Rename file"
              onClick={event => {
                event.stopPropagation();
                startRename(node);
              }}
            >
              <MoreHorizontal size={15} />
            </button>
          </div>
        )}

        {node.type === "folder" && expanded[node.id] && (
          <div className="tree-children">
            {renderTree(node.children || [])}
          </div>
        )}
      </div>
    ));

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

  return (
    <div className="app-shell">
      <div className="matrix-bg" aria-hidden="true">
        {Array.from({ length: 22 }, (_, index) => (
          <span
            key={index}
            style={{
              left: `${(index * 4.73) % 100}%`,
              animationDelay: `-${(index % 9) * 1.7}s`
            }}
          >
            {("01アイウエオCODE").repeat(5)}
          </span>
        ))}
      </div>

      <header className="topbar">
        <button
          className="brand-mark"
          onClick={() => setActivePanel("editor")}
        >
          <Code2 size={22} />
        </button>

        <div className="brand">
          <b>RAKIB<span>.</span></b>
          <small>CODE STUDIO</small>
        </div>

        <div className="top-clock">
          <SpiderClock />
        </div>

        <div className="top-actions">
          <span className="status-pill">
            <i /> LOCAL WORKSPACE
          </span>

          <button
            className="liquid-icon"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Menu size={19} />
          </button>
        </div>
      </header>

      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <Activity size={13} /> CREATIVE DEVELOPMENT ENVIRONMENT
          </div>

          <h1>
            Build something <em>brilliant.</em>
          </h1>

          <p>Your ideas, your files, your workspace. All in one place.</p>
        </div>

        <button
          className="liquid-button primary"
          onClick={() => {
            setNewKind("file");
            setShowNew(true);
          }}
        >
          <Plus size={16} /> New file
        </button>
      </div>

      <nav className={`main-nav ${mobileMenu ? "nav-open" : ""}`}>
        {["editor", "projects", "workspace"].map(page => (
          <button
            key={page}
            className={activePanel === page ? "nav-active" : ""}
            onClick={() => {
              setActivePanel(page);
              setMobileMenu(false);
            }}
          >
            {page === "editor" ? (
              <Code2 size={15} />
            ) : page === "projects" ? (
              <Layers size={15} />
            ) : (
              <Folder size={15} />
            )}

            {" "}{page[0].toUpperCase() + page.slice(1)}
          </button>
        ))}

        <div className="nav-spacer" />

        <span className="save-status">
          <span /> Autosave on this device
        </span>
      </nav>

      {activePanel === "projects" ? (
        <main className="projects-view">
          <div className="section-heading">
            <div>
              <div className="eyebrow">START WITH A TEMPLATE</div>
              <h2>What are we making?</h2>
            </div>
          </div>

          <div className="project-grid">
            {projectCards.map(card => (
              <button
                className="project-card"
                key={card.type}
                onClick={() => {
                  setProjectType(card.type);
                  setActivePanel("editor");
                }}
              >
                <div className="project-icon">
                  <card.icon size={23} />
                </div>

                <h3>{card.name}</h3>
                <p>{card.desc}</p>

                <span>
                  Choose template <span>↗</span>
                </span>
              </button>
            ))}
          </div>

          <div className="hint-card">
            <Rocket size={20} />

            <div>
              <b>Make it yours</b>
              <p>
                Templates are starting points. You can add folders and files,
                then edit them in the workspace.
              </p>
            </div>
          </div>
        </main>
      ) : (
        <main className="workspace">
          <aside className="sidebar panel">
            <div className="panel-title">
              <div>
                <Folder size={15} /> EXPLORER
              </div>

              <div className="side-tools">
                <button
                  title="New file"
                  onClick={() => {
                    setNewKind("file");
                    setShowNew(true);
                  }}
                >
                  <File size={15} />
                </button>

                <button
                  title="New folder"
                  onClick={() => {
                    setNewKind("folder");
                    setShowNew(true);
                  }}
                >
                  <FolderPlus size={15} />
                </button>
              </div>
            </div>

            <div className="project-root">
              <ChevronDown size={13} /> RAKIB-PROJECT <span>...</span>
            </div>

            <div className="file-tree">
              {renderTree(tree)}
            </div>

            <div className="sidebar-bottom">
              <div className="eyebrow">PROJECT TYPE</div>

              <select
                value={projectType}
                onChange={event => setProjectType(event.target.value)}
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
                <FileCode2 size={14} />
                {activeFile?.name || "No file selected"}
                <span className="unsaved-dot" />
              </div>

              <div className="toolbar-right">
                <span className="language-label">
                  {language.toUpperCase()}
                </span>

                <button
                  className="liquid-button run-button"
                  onClick={runCode}
                >
                  <Play size={14} fill="currentColor" /> Run
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
                  onChange={value => setCode(value ?? "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', monospace",
                    lineNumbers: "on",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 18 },
                    roundedSelection: true,
                    cursorBlinking: "smooth",
                    smoothScrolling: true,
                    wordWrap: "on",
                    tabSize: 2,
                    colorDecorators: true,
                    colorDecoratorsActivatedOn: "clickAndHover",
                    defaultColorDecorators: "always",
                    fixedOverflowWidgets: true
                  }}
                />
              ) : (
                <div className="empty-editor">
                  Choose a file from the explorer or create a new one.
                </div>
              )}
            </div>

            <div className="editor-footer">
              <span><i /> Ready</span>
              <span>UTF-8</span>
              <span>{language}</span>
              <span>Ln 1, Col 1</span>
            </div>
          </section>

          <aside className="output-area panel">
            <div className="output-header">
              <div>
                <Terminal size={15} /> OUTPUT
              </div>

              <div className="output-actions">
                <button
                  title="Copy output"
                  onClick={() => navigator.clipboard?.writeText(output)}
                >
                  <Copy size={14} />
                </button>

                <button
                  title="Clear output"
                  onClick={() => setOutput("")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="output-tabs">
              <button
                className={activePanel === "preview" ? "chosen" : ""}
                onClick={() => setActivePanel("preview")}
              >
                Preview
              </button>

              <button
                className={activePanel === "output" ? "chosen" : ""}
                onClick={() => setActivePanel("output")}
              >
                Console
              </button>
            </div>

            {activePanel === "preview" ? (
              <div className="preview-float">
                <div className="preview-caption">
                  <span className="live-dot" /> LIVE PREVIEW
                </div>

                <iframe
                  title="Code output preview"
                  sandbox="allow-scripts"
                  srcDoc={
                    preview ||
                    "<html><body style='background:#0b110d;color:#86ffa9;font:15px system-ui;padding:20px'>Press Run to see your output.</body></html>"
                  }
                />
              </div>
            ) : (
              <pre className="console-output">
                {output || "Console cleared."}
              </pre>
            )}

            <div className="output-foot">
              <span className="live-dot" /> SANDBOXED LOCAL PREVIEW
            </div>
          </aside>
        </main>
      )}

      {showNew && (
        <div
          className="modal-backdrop"
          onClick={() => setShowNew(false)}
        >
          <div
            className="new-modal"
            onClick={event => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <div className="eyebrow">WORKSPACE</div>
                <h3>Create {newKind}</h3>
              </div>

              <button
                className="tiny-icon"
                onClick={() => setShowNew(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="kind-switch">
              <button
                className={newKind === "file" ? "active" : ""}
                onClick={() => setNewKind("file")}
              >
                <File size={14} /> File
              </button>

              <button
                className={newKind === "folder" ? "active" : ""}
                onClick={() => setNewKind("folder")}
              >
                <Folder size={14} /> Folder
              </button>
            </div>

            <label>Name</label>

            <input
              autoFocus
              placeholder={
                newKind === "file" ? "example.js" : "new-folder"
              }
              value={newName}
              onChange={event => setNewName(event.target.value)}
              onKeyDown={event =>
                event.key === "Enter" && addNode()
              }
            />

            {newKind === "file" && (
              <>
                <label>Parent folder</label>

                <select
                  value={targetFolder}
                  onChange={event => setTargetFolder(event.target.value)}
                >
                  {(function flatten(nodes) {
                    return nodes.flatMap(node =>
                      node.type === "folder"
                        ? [
                            <option key={node.id} value={node.id}>
                              {node.name}
                            </option>,
                            ...flatten(node.children || [])
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
              <Plus size={15} /> Create {newKind}
            </button>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <span>© 2026 RAKIB CODE STUDIO</span>
        <span>DESIGNED FOR MAKERS <b>●</b></span>
      </footer>
    </div>
  );
}

export default App;
