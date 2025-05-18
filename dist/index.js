"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// package/index.ts
var index_exports = {};
__export(index_exports, {
  AIChatComponent: () => AIChatComponent_default,
  ChatInput: () => ChatInput_default,
  MessageItem: () => MessageItem_default,
  MessageList: () => MessageList_default,
  analyzeProject: () => analyzeProject,
  createAIAssistant: () => createAIAssistant,
  deleteProjectContext: () => deleteProjectContext,
  getLatestProjectContext: () => getLatestProjectContext,
  getUserProjects: () => getUserProjects,
  storeProjectContext: () => storeProjectContext
});
module.exports = __toCommonJS(index_exports);

// components/chat/AIChatComponent.tsx
var import_react3 = require("react");
var import_uuid = require("uuid");

// components/chat/MessageList.tsx
var import_react = require("react");

// components/chat/MessageItem.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var MessageItem = ({ message, isAI }) => {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `flex ${isAI ? "justify-start" : "justify-end"} mb-4`, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: `max-w-[70%] rounded-lg p-3 ${isAI ? "bg-gray-100" : "bg-blue-500 text-white"}`,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm", children: message.content })
    }
  ) });
};
var MessageItem_default = MessageItem;

// components/chat/MessageList.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var MessageList = ({ messages, loading = false }) => {
  const messagesEndRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    var _a2;
    (_a2 = messagesEndRef.current) == null ? void 0 : _a2.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex-1 overflow-y-auto p-4", children: [
    messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      MessageItem_default,
      {
        message,
        isAI: message.role === "assistant"
      },
      message.id
    )),
    loading && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex justify-start mb-4", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bg-gray-100 rounded-lg p-3 max-w-[70%]", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex space-x-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "w-2 h-2 rounded-full bg-gray-400 animate-bounce" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          className: "w-2 h-2 rounded-full bg-gray-400 animate-bounce",
          style: { animationDelay: "0.2s" }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          className: "w-2 h-2 rounded-full bg-gray-400 animate-bounce",
          style: { animationDelay: "0.4s" }
        }
      )
    ] }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ref: messagesEndRef })
  ] });
};
var MessageList_default = MessageList;

// components/chat/ChatInput.tsx
var import_react2 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
var ChatInput = ({
  onSendMessage,
  disabled = false,
  placeholder
}) => {
  const [input, setInput] = (0, import_react2.useState)("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput("");
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("form", { onSubmit: handleSubmit, className: "border-t p-4", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex space-x-2", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "input",
      {
        type: "text",
        value: input,
        onChange: (e) => setInput(e.target.value),
        placeholder: placeholder || "Type your message...",
        disabled,
        className: "flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
        "data-testid": "chat-input"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "button",
      {
        type: "submit",
        disabled: disabled || !input.trim(),
        className: "bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300",
        children: "Send"
      }
    )
  ] }) });
};
var ChatInput_default = ChatInput;

// components/chat/AIChatComponent.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var AIChatComponent = ({
  apiKey,
  apiEndpoint = "/api/assistant",
  initialMessages = [],
  placeholder = "Type your message...",
  className = "",
  onMessageSent,
  onResponseReceived
}) => {
  const [messages, setMessages] = (0, import_react3.useState)(initialMessages);
  const [loading, setLoading] = (0, import_react3.useState)(false);
  const [error, setError] = (0, import_react3.useState)(null);
  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMessage = {
      id: (0, import_uuid.v4)(),
      role: "user",
      content: text,
      createdAt: /* @__PURE__ */ new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    onMessageSent == null ? void 0 : onMessageSent(userMessage);
    try {
      const headers = {
        "Content-Type": "application/json"
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: text,
          history: messages
        })
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      const aiMessage = {
        id: data.id || (0, import_uuid.v4)(),
        role: "assistant",
        content: data.response,
        createdAt: new Date(data.timestamp || Date.now())
      };
      setMessages((prev) => [...prev, aiMessage]);
      onResponseReceived == null ? void 0 : onResponseReceived(aiMessage);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(
        err instanceof Error ? err.message : "Failed to get AI response"
      );
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: `flex flex-col h-full ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(MessageList_default, { messages, loading }) }),
    error && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "p-2 text-red-500 text-sm text-center", children: error }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "mt-auto", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      ChatInput_default,
      {
        onSendMessage: sendMessage,
        disabled: loading,
        placeholder
      }
    ) })
  ] });
};
var AIChatComponent_default = AIChatComponent;

// client-lib/ai-assistant-client.ts
var import_uuid2 = require("uuid");
function createAIAssistant(options) {
  const apiUrl = options.apiUrl.endsWith("/") ? options.apiUrl.slice(0, -1) : options.apiUrl;
  const apiKey = options.apiKey;
  const appContext = options.appContext;
  const fetchWithAuth = async (endpoint, options2) => {
    const url = `${apiUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options2 == null ? void 0 : options2.headers) || {}
    };
    return fetch(url, {
      ...options2,
      headers
    });
  };
  return {
    // Send a message to the AI assistant
    sendMessage: async (message, history = [], contextId) => {
      const response = await fetchWithAuth("/assistant", {
        method: "POST",
        body: JSON.stringify({
          message,
          history,
          contextId
        })
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return {
        id: data.id || (0, import_uuid2.v4)(),
        role: "assistant",
        content: data.response || data.content,
        createdAt: data.timestamp || Date.now()
      };
    },
    // Session management
    getSessions: async () => {
      const response = await fetchWithAuth("/sessions");
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return data.sessions;
    },
    createSession: async (title, contextId) => {
      const response = await fetchWithAuth("/sessions", {
        method: "POST",
        body: JSON.stringify({ title, contextId })
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    },
    getSessionMessages: async (sessionId) => {
      const response = await fetchWithAuth(`/sessions/${sessionId}/messages`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return data.messages;
    },
    sendMessageToSession: async (sessionId, content) => {
      const response = await fetchWithAuth(`/sessions/${sessionId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content })
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    },
    updateSession: async (sessionId, data) => {
      const response = await fetchWithAuth(`/sessions/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    },
    deleteSession: async (sessionId) => {
      const response = await fetchWithAuth(`/sessions/${sessionId}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    },
    // streaming method
    streamMessage: async (message, history = [], onChunk, contextId) => {
      var _a2;
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      };
      if (appContext) {
        headers["x-app-context"] = appContext;
      }
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message,
          history,
          streaming: true,
          contextId
        })
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const reader = (_a2 = response.body) == null ? void 0 : _a2.getReader();
      if (!reader) throw new Error("Response body is null");
      let fullText = "";
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullText += chunk;
          onChunk(chunk);
        }
      } finally {
        reader.releaseLock();
      }
      return {
        id: (0, import_uuid2.v4)(),
        role: "assistant",
        content: fullText,
        createdAt: /* @__PURE__ */ new Date()
      };
    },
    // Project analysis
    analyzeProject: async (projectPath) => {
      const response = await fetchWithAuth("/analyze", {
        method: "POST",
        body: JSON.stringify({ projectPath })
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return {
        context: data.analysis.context,
        contextId: data.contextId
      };
    },
    // Project context management
    getUserProjects: async () => {
      const response = await fetchWithAuth("/projects");
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return data.projects;
    },
    getProjectContext: async (contextId) => {
      const response = await fetchWithAuth(`/projects/${contextId}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    },
    deleteProjectContext: async (contextId) => {
      const response = await fetchWithAuth(`/projects/${contextId}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    }
  };
}

// lib/analyzer/index.ts
var import_fs3 = __toESM(require("fs"));
var import_path3 = __toESM(require("path"));

// lib/analyzer/package-analyzer.ts
var TECH_CATEGORIES = {
  react: { type: "framework", usage: "core" },
  next: { type: "framework", usage: "core" },
  vue: { type: "framework", usage: "core" },
  angular: { type: "framework", usage: "core" },
  typescript: { type: "language", usage: "core" },
  tailwindcss: { type: "library", usage: "core" },
  firebase: { type: "database", usage: "core" },
  "firebase-admin": { type: "library", usage: "core" },
  jest: { type: "tool", usage: "development" },
  "@testing-library": { type: "library", usage: "development" },
  eslint: { type: "tool", usage: "development" },
  tsup: { type: "tool", usage: "development" },
  zod: { type: "library", usage: "core" },
  ai: { type: "library", usage: "core" },
  "@ai-sdk": { type: "library", usage: "core" },
  "@langchain": { type: "library", usage: "core" },
  axios: { type: "library", usage: "core" },
  zustand: { type: "library", usage: "core" },
  "@radix-ui": { type: "library", usage: "core" },
  "class-variance-authority": { type: "library", usage: "core" },
  "lucide-react": { type: "library", usage: "core" },
  clsx: { type: "library", usage: "core" },
  "tailwind-merge": { type: "library", usage: "core" },
  "@heroicons": { type: "library", usage: "core" }
};
function analyzePackageJson(packageJson) {
  var _a2, _b, _c, _d;
  if (!packageJson) return [];
  const technologies = [];
  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies
  };
  if (((_a2 = packageJson.devDependencies) == null ? void 0 : _a2.typescript) || ((_b = packageJson.dependencies) == null ? void 0 : _b.typescript)) {
    technologies.push({
      name: "TypeScript",
      version: allDependencies.typescript,
      type: "language",
      usage: "core"
    });
  }
  technologies.push({
    name: "JavaScript",
    type: "language",
    usage: "core"
  });
  for (const [depName, version] of Object.entries(allDependencies)) {
    const matchedTech = Object.entries(TECH_CATEGORIES).find(([techName]) => {
      return depName === techName || depName.startsWith(techName + "-") || depName.startsWith("@" + techName + "/");
    });
    if (matchedTech) {
      const [techName, category] = matchedTech;
      if (technologies.some(
        (t) => t.name.toLowerCase() === techName.toLowerCase()
      )) {
        continue;
      }
      const properName = getProperTechName(depName);
      technologies.push({
        name: properName,
        version,
        type: category.type,
        usage: category.usage
      });
    } else {
      technologies.push({
        name: depName,
        version,
        type: ((_c = packageJson.devDependencies) == null ? void 0 : _c[depName]) ? "tool" : "library",
        usage: ((_d = packageJson.devDependencies) == null ? void 0 : _d[depName]) ? "development" : "core"
      });
    }
  }
  const reactVersion = allDependencies == null ? void 0 : allDependencies.react;
  if (reactVersion) {
    const isReact18OrHigher = reactVersion && (reactVersion.startsWith("18") || reactVersion.startsWith("^18") || reactVersion.startsWith("19") || reactVersion.startsWith("^19"));
    const reactIndex = technologies.findIndex((t) => t.name === "React");
    if (reactIndex >= 0) {
      technologies[reactIndex].name = isReact18OrHigher ? "React (Modern)" : "React";
    } else {
      technologies.push({
        name: isReact18OrHigher ? "React (Modern)" : "React",
        version: reactVersion,
        type: "framework",
        usage: "core"
      });
    }
  }
  const nextVersion = allDependencies == null ? void 0 : allDependencies.next;
  if (nextVersion) {
    const isNextModern = nextVersion && (nextVersion.startsWith("13") || nextVersion.startsWith("^13") || nextVersion.startsWith("14") || nextVersion.startsWith("^14") || nextVersion.startsWith("15") || nextVersion.startsWith("^15"));
    const nextIndex = technologies.findIndex((t) => t.name.includes("Next.js"));
    if (nextIndex >= 0) {
      technologies[nextIndex].name = isNextModern ? "Next.js (13+)" : "Next.js";
    } else {
      technologies.push({
        name: isNextModern ? "Next.js (13+)" : "Next.js",
        version: nextVersion,
        type: "framework",
        usage: "core"
      });
    }
  }
  return technologies;
}
function getProperTechName(depName) {
  if (depName.startsWith("@")) {
    const [namespace, name] = depName.substring(1).split("/");
    if (name) {
      return `${capitalizeFirstLetter(namespace)} ${capitalizeFirstLetter(
        name
      )}`;
    }
  }
  const specialCases = {
    tailwindcss: "Tailwind CSS",
    nextjs: "Next.js",
    next: "Next.js",
    react: "React",
    typescript: "TypeScript",
    javascript: "JavaScript",
    firebase: "Firebase",
    "firebase-admin": "Firebase Admin",
    eslint: "ESLint",
    jest: "Jest",
    zod: "Zod",
    axios: "Axios",
    zustand: "Zustand"
  };
  if (specialCases[depName.toLowerCase()]) {
    return specialCases[depName.toLowerCase()];
  }
  return depName.split("-").map(capitalizeFirstLetter).join(" ");
}
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// lib/analyzer/file-structure-analyzer.ts
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
async function analyzeFileStructure(rootDir) {
  const result = {
    directories: [],
    entryPoints: [],
    configFiles: [],
    patterns: {
      architectural: [],
      code: []
    }
  };
  const topLevelEntries = await import_fs.default.promises.readdir(rootDir, {
    withFileTypes: true
  });
  for (const entry of topLevelEntries) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) {
      continue;
    }
    if (entry.isDirectory()) {
      result.directories.push(entry.name);
    } else if (entry.isFile()) {
      if (isConfigFile(entry.name)) {
        result.configFiles.push(entry.name);
      }
      if (isEntryPoint(entry.name)) {
        result.entryPoints.push(entry.name);
      }
    }
  }
  result.patterns.architectural = detectArchitecturalPatterns(
    result.directories,
    rootDir
  );
  result.patterns.code = await detectCodePatterns(rootDir, result.directories);
  return result;
}
function detectArchitecturalPatterns(directories, rootDir) {
  const patterns = [];
  if (directories.includes("app")) {
    try {
      if (import_fs.default.existsSync(import_path.default.join(rootDir, "app/layout.tsx")) || import_fs.default.existsSync(import_path.default.join(rootDir, "app/layout.jsx"))) {
        patterns.push({
          name: "Next.js App Router",
          description: "Modern Next.js routing system using app directory with nested layouts and server components",
          components: ["app/layout.tsx", "app/page.tsx"],
          locations: ["app/"]
        });
      }
    } catch (e) {
    }
  }
  if (directories.includes("pages")) {
    patterns.push({
      name: "Next.js Pages Router",
      description: "Traditional Next.js routing system using pages directory",
      components: ["pages/_app.tsx", "pages/index.tsx"],
      locations: ["pages/"]
    });
  }
  if (directories.includes("components")) {
    patterns.push({
      name: "Component Library",
      description: "Organized collection of reusable UI components",
      components: ["components/*"],
      locations: ["components/"]
    });
  }
  if (import_fs.default.existsSync(import_path.default.join(rootDir, "package", "index.ts")) || directories.includes("packages")) {
    patterns.push({
      name: "Monorepo / Package Library",
      description: "Multi-package repository with shared code",
      components: ["package/index.ts"],
      locations: ["package/"]
    });
  }
  if (directories.includes("api") || import_fs.default.existsSync(import_path.default.join(rootDir, "app/api"))) {
    patterns.push({
      name: "API Routes",
      description: "Backend API endpoints using Next.js API routes or standalone API",
      components: ["app/api/*/route.ts", "pages/api/*"],
      locations: ["app/api/", "pages/api/"]
    });
  }
  return patterns;
}
async function detectCodePatterns(rootDir, directories) {
  const patterns = [];
  if (directories.includes("hooks")) {
    patterns.push({
      name: "Custom Hooks",
      description: "React custom hooks for reusable stateful logic",
      examples: ["useAuth", "useForm", "useLocalStorage"],
      locations: ["hooks/"]
    });
  }
  try {
    const componentsDir = import_path.default.join(rootDir, "components");
    if (import_fs.default.existsSync(componentsDir)) {
      const componentEntries = await import_fs.default.promises.readdir(componentsDir, {
        withFileTypes: true
      });
      const hasUiDir = componentEntries.some(
        (entry) => entry.isDirectory() && entry.name === "ui"
      );
      if (hasUiDir) {
        patterns.push({
          name: "shadcn/ui Components",
          description: "Reusable UI components following shadcn/ui patterns with Radix UI and Tailwind",
          examples: ["Button", "Card", "Dialog"],
          locations: ["components/ui/"]
        });
      }
    }
  } catch (e) {
  }
  if (await fileExists(import_path.default.join(rootDir, "context")) || await globMatch(rootDir, "**/context/**/*.tsx")) {
    patterns.push({
      name: "React Context API",
      description: "State management using React Context API",
      examples: ["ThemeContext", "AuthContext"],
      locations: ["context/", "lib/context/", "components/context/"]
    });
  }
  if (await globMatch(rootDir, "**/actions.ts") || await globMatch(rootDir, "**/actions/**/*.ts")) {
    patterns.push({
      name: "Next.js Server Actions",
      description: "Server-side mutations using Next.js Server Actions",
      examples: ["form actions", "data mutations"],
      locations: ["app/**/actions.ts", "actions/"]
    });
  }
  return patterns;
}
function isConfigFile(filename) {
  const configFiles = [
    "package.json",
    "tsconfig.json",
    "next.config.js",
    "next.config.ts",
    "tailwind.config.js",
    "tailwind.config.ts",
    ".eslintrc.js",
    ".prettierrc",
    "jest.config.js",
    "jest.config.ts",
    "postcss.config.js",
    "components.json"
  ];
  return configFiles.includes(filename);
}
function isEntryPoint(filename) {
  const entryPoints = [
    "index.ts",
    "index.tsx",
    "index.js",
    "server.ts",
    "server.js",
    "app.ts",
    "app.js",
    "main.ts",
    "main.js"
  ];
  return entryPoints.includes(filename);
}
async function fileExists(filePath) {
  try {
    await import_fs.default.promises.access(filePath);
    return true;
  } catch (e) {
    return false;
  }
}
async function globMatch(rootDir, pattern) {
  const parts = pattern.split("**/");
  const searchDir = parts[0] || rootDir;
  const searchPattern = parts[1];
  try {
    const files = await walkDir(import_path.default.join(rootDir, searchDir));
    return files.some((file) => file.includes(searchPattern));
  } catch (e) {
    return false;
  }
}
async function walkDir(dir) {
  const entries = await import_fs.default.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = import_path.default.join(dir, entry.name);
      return entry.isDirectory() ? walkDir(fullPath) : [fullPath];
    })
  );
  return files.flat();
}

// lib/analyzer/code-quality-analyzer.ts
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
async function analyzeCodeQuality(rootDir) {
  const result = {
    patterns: [],
    bestPractices: [],
    metrics: {
      componentCount: 0,
      hooksCount: 0,
      utilsCount: 0,
      apiRoutesCount: 0
    }
  };
  const hasTypeScript = await fileExists2(import_path2.default.join(rootDir, "tsconfig.json"));
  result.bestPractices.push({
    name: "TypeScript",
    detected: hasTypeScript,
    details: hasTypeScript ? "Project uses TypeScript for type safety" : "TypeScript not detected"
  });
  const hasESLint = await fileExists2(import_path2.default.join(rootDir, ".eslintrc.js")) || await fileExists2(import_path2.default.join(rootDir, ".eslintrc")) || await fileExists2(import_path2.default.join(rootDir, "eslint.config.js")) || await fileExists2(import_path2.default.join(rootDir, "eslint.config.mjs"));
  result.bestPractices.push({
    name: "ESLint",
    detected: hasESLint,
    details: hasESLint ? "Project uses ESLint for code quality" : "ESLint not detected"
  });
  const hasJest = await fileExists2(import_path2.default.join(rootDir, "jest.config.js")) || await fileExists2(import_path2.default.join(rootDir, "jest.config.ts"));
  result.bestPractices.push({
    name: "Testing",
    detected: hasJest,
    details: hasJest ? "Project has Jest testing setup" : "No testing framework detected"
  });
  result.metrics = await countCodeMetrics(rootDir);
  result.patterns = await detectCodeQualityPatterns(rootDir);
  return result;
}
async function countCodeMetrics(rootDir) {
  const metrics = {
    componentCount: 0,
    hooksCount: 0,
    utilsCount: 0,
    apiRoutesCount: 0
  };
  try {
    const componentsDir = import_path2.default.join(rootDir, "components");
    if (await fileExists2(componentsDir)) {
      const componentFiles = await walkDir2(componentsDir, [".tsx", ".jsx"]);
      metrics.componentCount = componentFiles.length;
    }
  } catch (e) {
  }
  try {
    const hooksDir = import_path2.default.join(rootDir, "hooks");
    if (await fileExists2(hooksDir)) {
      const hookFiles = await walkDir2(hooksDir, [".ts", ".tsx", ".js", ".jsx"]);
      metrics.hooksCount = hookFiles.length;
    }
    const libDir = import_path2.default.join(rootDir, "lib");
    if (await fileExists2(libDir)) {
      const libFiles = await walkDir2(libDir, [".ts", ".js"]);
      metrics.hooksCount += libFiles.filter(
        (file) => import_path2.default.basename(file).startsWith("use")
      ).length;
    }
  } catch (e) {
  }
  try {
    const utilsDir = import_path2.default.join(rootDir, "utils");
    if (await fileExists2(utilsDir)) {
      const utilsFiles = await walkDir2(utilsDir, [".ts", ".js"]);
      metrics.utilsCount = utilsFiles.length;
    }
    const libUtilsDir = import_path2.default.join(rootDir, "lib/utils");
    if (await fileExists2(libUtilsDir)) {
      const libUtilsFiles = await walkDir2(libUtilsDir, [".ts", ".js"]);
      metrics.utilsCount += libUtilsFiles.length;
    }
  } catch (e) {
  }
  try {
    const apiDir = import_path2.default.join(rootDir, "app/api");
    if (await fileExists2(apiDir)) {
      const apiFiles = await walkDir2(apiDir, [".ts", ".js"]);
      metrics.apiRoutesCount = apiFiles.filter(
        (file) => import_path2.default.basename(file) === "route.ts" || import_path2.default.basename(file) === "route.js"
      ).length;
    }
    const pagesApiDir = import_path2.default.join(rootDir, "pages/api");
    if (await fileExists2(pagesApiDir)) {
      const pagesApiFiles = await walkDir2(pagesApiDir, [".ts", ".js"]);
      metrics.apiRoutesCount += pagesApiFiles.length;
    }
  } catch (e) {
  }
  return metrics;
}
async function detectCodeQualityPatterns(rootDir) {
  const patterns = [];
  patterns.push({
    name: "Organized Imports",
    description: "Grouped and organized import statements",
    examples: ["React imports first, then libraries, then local modules"],
    locations: ["Throughout the codebase"]
  });
  if (await fileExists2(import_path2.default.join(rootDir, "components"))) {
    patterns.push({
      name: "Component Composition",
      description: "Building complex UIs from smaller, reusable components",
      examples: ["Layout components, UI components, feature components"],
      locations: ["components/"]
    });
  }
  const hasErrorBoundaries = await findFilesWithContent(
    rootDir,
    ["ErrorBoundary", "error.tsx", "error.jsx"],
    [".tsx", ".jsx"]
  );
  if (hasErrorBoundaries.length > 0) {
    patterns.push({
      name: "Error Boundaries",
      description: "Components that catch JavaScript errors and display fallback UI",
      examples: hasErrorBoundaries,
      locations: ["Throughout the codebase"]
    });
  }
  const hasFetchingPatterns = await findFilesWithContent(
    rootDir,
    [
      "useQuery",
      "useSWR",
      "createServerComponent",
      "getData",
      "getServerSideProps"
    ],
    [".ts", ".tsx", ".js", ".jsx"]
  );
  if (hasFetchingPatterns.length > 0) {
    patterns.push({
      name: "Data Fetching Patterns",
      description: "Structured approach to fetching and managing data",
      examples: ["React Query", "SWR", "Server Components"],
      locations: hasFetchingPatterns
    });
  }
  return patterns;
}
async function fileExists2(filePath) {
  try {
    await import_fs2.default.promises.access(filePath);
    return true;
  } catch (e) {
    return false;
  }
}
async function walkDir2(dir, extensions = []) {
  if (!await fileExists2(dir)) {
    return [];
  }
  const entries = await import_fs2.default.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = import_path2.default.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkDir2(fullPath, extensions);
      } else if (entry.isFile()) {
        const ext = import_path2.default.extname(entry.name);
        if (extensions.length === 0 || extensions.includes(ext)) {
          return [fullPath];
        }
      }
      return [];
    })
  );
  return files.flat();
}
async function findFilesWithContent(rootDir, patterns, extensions = []) {
  const matchingFiles = [];
  try {
    const files = await walkDir2(rootDir, extensions);
    for (const file of files) {
      const basename = import_path2.default.basename(file);
      if (patterns.some((pattern) => basename.includes(pattern))) {
        matchingFiles.push(file);
      }
    }
  } catch (e) {
  }
  return matchingFiles;
}

// lib/analyzer/index.ts
async function analyzeProject(projectPath) {
  if (!import_fs3.default.existsSync(projectPath)) {
    throw new Error(`Project path does not exist: ${projectPath}`);
  }
  const result = {
    context: {
      name: import_path3.default.basename(projectPath),
      technologies: [],
      patterns: {
        code: [],
        architectural: []
      },
      fileStructure: {
        directories: [],
        entryPoints: [],
        configFiles: []
      },
      metadata: {
        analyzedAt: /* @__PURE__ */ new Date(),
        confidence: 0
      }
    },
    raw: {
      otherConfigs: {}
    }
  };
  try {
    const packageJsonPath = import_path3.default.join(projectPath, "package.json");
    if (import_fs3.default.existsSync(packageJsonPath)) {
      const packageJsonRaw = import_fs3.default.readFileSync(packageJsonPath, "utf-8");
      result.raw.packageJson = JSON.parse(packageJsonRaw);
      if (result.raw.packageJson) {
        result.context.technologies = analyzePackageJson(
          result.raw.packageJson
        );
      }
    }
    const tsconfigPath = import_path3.default.join(projectPath, "tsconfig.json");
    if (import_fs3.default.existsSync(tsconfigPath)) {
      const tsconfigRaw = import_fs3.default.readFileSync(tsconfigPath, "utf-8");
      result.raw.tsConfig = JSON.parse(tsconfigRaw);
    }
    const nextConfigPath = import_fs3.default.existsSync(
      import_path3.default.join(projectPath, "next.config.js")
    ) ? import_path3.default.join(projectPath, "next.config.js") : import_path3.default.join(projectPath, "next.config.ts");
    if (import_fs3.default.existsSync(nextConfigPath)) {
      result.raw.nextConfig = { path: nextConfigPath };
    }
    const fileStructureResult = await analyzeFileStructure(projectPath);
    result.context.fileStructure.directories = fileStructureResult.directories;
    result.context.fileStructure.entryPoints = fileStructureResult.entryPoints;
    result.context.fileStructure.configFiles = fileStructureResult.configFiles;
    result.context.patterns.architectural = fileStructureResult.patterns.architectural;
    result.context.patterns.code = [...fileStructureResult.patterns.code];
    const codeQualityResult = await analyzeCodeQuality(projectPath);
    result.context.patterns.code = [
      ...result.context.patterns.code,
      ...codeQualityResult.patterns
    ];
    const hasPackageJson = !!result.raw.packageJson;
    const hasTsConfig = !!result.raw.tsConfig;
    const hasNextConfig = !!result.raw.nextConfig;
    const hasComponents = result.context.fileStructure.directories.includes("components");
    const hasPages = result.context.fileStructure.directories.includes("pages");
    const hasApp = result.context.fileStructure.directories.includes("app");
    let confidenceScore = 0.5;
    if (hasPackageJson) confidenceScore += 0.1;
    if (hasTsConfig) confidenceScore += 0.05;
    if (hasNextConfig) confidenceScore += 0.05;
    if (hasComponents) confidenceScore += 0.1;
    if (hasPages || hasApp) confidenceScore += 0.1;
    if (result.context.technologies.length > 0) confidenceScore += 0.1;
    result.context.metadata.confidence = Math.min(1, confidenceScore);
  } catch (error) {
    console.error("Error during project analysis:", error);
    result.context.metadata.confidence = 0.3;
  }
  return result;
}

// lib/analyzer/context-storage.ts
var import_firestore3 = require("firebase/firestore");

// lib/firebase.ts
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
var import_auth = require("firebase/auth");
var firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
var clientApp = (0, import_app.initializeApp)(firebaseConfig);
var clientDb = (0, import_firestore.getFirestore)(clientApp);
var clientAuth = (0, import_auth.getAuth)(clientApp);

// lib/firebase-admin.ts
var import_app2 = require("firebase-admin/app");
var import_auth2 = require("firebase-admin/auth");
var import_firestore2 = require("firebase-admin/firestore");
var _a;
var adminApp = (0, import_app2.getApps)().length === 0 ? (0, import_app2.initializeApp)({
  credential: (0, import_app2.cert)({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    // The private key needs to have newlines replaced
    privateKey: (_a = process.env.FIREBASE_ADMIN_PRIVATE_KEY) == null ? void 0 : _a.replace(
      /\\n/g,
      "\n"
    )
  })
  // databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
}) : (0, import_app2.getApps)()[0];
var adminAuth = (0, import_auth2.getAuth)(adminApp);
var adminDb = (0, import_firestore2.getFirestore)(adminApp);

// lib/analyzer/context-storage.ts
var import_crypto = __toESM(require("crypto"));
function hashProjectPath(projectPath) {
  return import_crypto.default.createHash("sha256").update(projectPath).digest("hex");
}
async function storeProjectContext(userId, projectPath, result) {
  const projectHash = hashProjectPath(projectPath);
  const existingContext = await getLatestProjectContext(userId, projectPath);
  if (existingContext) {
    const contextData = {
      projectPath,
      projectHash,
      userId,
      context: result.context,
      updatedAt: Date.now(),
      version: existingContext.version + 1
    };
    const contextRef = (0, import_firestore3.doc)(clientDb, "projectContexts", existingContext.id);
    await (0, import_firestore3.updateDoc)(contextRef, contextData);
    return existingContext.id;
  } else {
    const contextData = {
      projectPath,
      projectHash,
      userId,
      context: result.context,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1
    };
    const docRef = await (0, import_firestore3.addDoc)(
      (0, import_firestore3.collection)(clientDb, "projectContexts"),
      contextData
    );
    return docRef.id;
  }
}
async function getLatestProjectContext(userId, projectPath) {
  const projectHash = hashProjectPath(projectPath);
  const contextQuery = (0, import_firestore3.query)(
    (0, import_firestore3.collection)(clientDb, "projectContexts"),
    (0, import_firestore3.where)("userId", "==", userId),
    (0, import_firestore3.where)("projectHash", "==", projectHash),
    (0, import_firestore3.orderBy)("version", "desc"),
    (0, import_firestore3.limit)(1)
  );
  const snapshot = await (0, import_firestore3.getDocs)(contextQuery);
  if (snapshot.empty) {
    return null;
  }
  const doc2 = snapshot.docs[0];
  return {
    id: doc2.id,
    ...doc2.data()
  };
}
async function getUserProjects(userId) {
  const projectHashes = /* @__PURE__ */ new Set();
  const latestVersions = /* @__PURE__ */ new Map();
  const contextQuery = (0, import_firestore3.query)(
    (0, import_firestore3.collection)(clientDb, "projectContexts"),
    (0, import_firestore3.where)("userId", "==", userId),
    (0, import_firestore3.orderBy)("updatedAt", "desc")
  );
  const snapshot = await (0, import_firestore3.getDocs)(contextQuery);
  for (const doc2 of snapshot.docs) {
    const data = doc2.data();
    const hash = data.projectHash;
    if (!projectHashes.has(hash)) {
      projectHashes.add(hash);
      latestVersions.set(hash, {
        id: doc2.id,
        ...data
      });
    }
  }
  return Array.from(latestVersions.values());
}
async function deleteProjectContext(userId, projectPath) {
  const projectHash = hashProjectPath(projectPath);
  const contextQuery = (0, import_firestore3.query)(
    (0, import_firestore3.collection)(clientDb, "projectContexts"),
    (0, import_firestore3.where)("userId", "==", userId),
    (0, import_firestore3.where)("projectHash", "==", projectHash)
  );
  const snapshot = await (0, import_firestore3.getDocs)(contextQuery);
  const deletePromises = snapshot.docs.map((doc2) => (0, import_firestore3.deleteDoc)(doc2.ref));
  await Promise.all(deletePromises);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AIChatComponent,
  ChatInput,
  MessageItem,
  MessageList,
  analyzeProject,
  createAIAssistant,
  deleteProjectContext,
  getLatestProjectContext,
  getUserProjects,
  storeProjectContext
});
