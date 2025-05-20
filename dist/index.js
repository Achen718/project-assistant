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
  analyzeCodeQuality: () => analyzeCodeQuality,
  analyzeFileStructure: () => analyzeFileStructure,
  analyzePackageJson: () => analyzePackageJson,
  analyzeProject: () => analyzeProject,
  createAIAssistant: () => createAIAssistant,
  createAssistantChain: () => createAssistantChain,
  createSystemPrompt: () => createSystemPrompt,
  createSystemPromptWithContext: () => createSystemPromptWithContext,
  deleteProjectContext: () => deleteProjectContext,
  generateContextAwareResponse: () => generateContextAwareResponse,
  getLatestProjectContext: () => getLatestProjectContext,
  getProjectContextById: () => getProjectContextById,
  getUserProjects: () => getUserProjects,
  processChat: () => processChat,
  processChatStream: () => processChatStream,
  storeProjectContext: () => storeProjectContext
});
module.exports = __toCommonJS(index_exports);

// src/components/chat/AIChatComponent.tsx
var import_react3 = require("react");
var import_uuid = require("uuid");

// src/components/chat/MessageList.tsx
var import_react = require("react");

// src/components/chat/MessageItem.tsx
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

// src/components/chat/MessageList.tsx
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

// src/components/chat/ChatInput.tsx
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

// src/components/chat/AIChatComponent.tsx
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

// src/client-lib/ai-assistant-client.ts
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

// src/lib/analyzer/index.ts
var import_fs2 = __toESM(require("fs"));
var import_promises = __toESM(require("fs/promises"));
var import_path2 = __toESM(require("path"));

// src/lib/analyzer/package-analyzer.ts
var TECH_CATEGORIES = {
  react: { type: "framework", usage: "core", confidence: 1 },
  next: { type: "framework", usage: "core", confidence: 1 },
  vue: { type: "framework", usage: "core", confidence: 1 },
  angular: { type: "framework", usage: "core", confidence: 1 },
  typescript: { type: "language", usage: "core", confidence: 1 },
  tailwindcss: { type: "library", usage: "core", confidence: 1 },
  firebase: { type: "database", usage: "core", confidence: 1 },
  "firebase-admin": { type: "library", usage: "core", confidence: 1 },
  jest: { type: "tool", usage: "development", confidence: 0.9 },
  "@testing-library": {
    type: "library",
    usage: "development",
    confidence: 0.9
  },
  eslint: { type: "tool", usage: "development", confidence: 0.9 },
  prettier: { type: "tool", usage: "development", confidence: 0.9 },
  // Added Prettier
  tsup: { type: "tool", usage: "development", confidence: 0.9 },
  zod: { type: "library", usage: "core", confidence: 1 },
  ai: { type: "library", usage: "core", confidence: 1 },
  // Vercel AI SDK (general)
  "@ai-sdk/react": { type: "library", usage: "core", confidence: 1 },
  // Vercel AI SDK for React
  "@ai-sdk/openai": { type: "library", usage: "core", confidence: 1 },
  // Vercel AI SDK for OpenAI
  langchain: { type: "library", usage: "core", confidence: 1 },
  // Langchain (general)
  "@langchain/core": { type: "library", usage: "core", confidence: 1 },
  "@langchain/openai": { type: "library", usage: "core", confidence: 1 },
  axios: { type: "library", usage: "core", confidence: 1 },
  zustand: { type: "library", usage: "core", confidence: 1 },
  "@radix-ui": { type: "library", usage: "core", confidence: 1 },
  "class-variance-authority": {
    type: "library",
    usage: "core",
    confidence: 1
  },
  // Often with Shadcn
  "lucide-react": { type: "library", usage: "core", confidence: 1 },
  // Often with Shadcn
  clsx: { type: "library", usage: "core", confidence: 1 },
  "tailwind-merge": { type: "library", usage: "core", confidence: 1 },
  // Often with Shadcn
  "@heroicons": { type: "library", usage: "core", confidence: 1 }
};
function analyzePackageJson(packageJson) {
  var _a2, _b, _c, _d;
  if (!packageJson) return { technologies: [] };
  const projectName = packageJson.name;
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
      usage: "core",
      confidence: TECH_CATEGORIES.typescript.confidence || 1
    });
  }
  technologies.push({
    name: "JavaScript",
    type: "language",
    usage: "core",
    confidence: 1
    // JS is fundamental
  });
  for (const [depName, version] of Object.entries(allDependencies)) {
    const matchedTechEntry = Object.entries(TECH_CATEGORIES).find(
      ([techKey]) => {
        return depName.toLowerCase() === techKey.toLowerCase() || // Exact match (case-insensitive)
        depName.toLowerCase().startsWith(techKey.toLowerCase() + "-") || // e.g., framework-specific-plugin
        depName.toLowerCase().startsWith("@" + techKey.toLowerCase() + "/");
      }
    );
    if (matchedTechEntry) {
      const [techKey, categoryDetails] = matchedTechEntry;
      const properName = getProperTechName(depName, techKey);
      if (technologies.some(
        (t) => t.name.toLowerCase() === properName.toLowerCase()
      )) {
        continue;
      }
      technologies.push({
        name: properName,
        version,
        type: categoryDetails.type,
        usage: categoryDetails.usage,
        confidence: categoryDetails.confidence || 0.9
        // Default confidence for matched tech
      });
    } else {
      const isSubPackage = technologies.some(
        (tech) => depName.startsWith(tech.name.toLowerCase())
      );
      if (isSubPackage) continue;
      technologies.push({
        name: getProperTechName(depName),
        // Get a capitalized name
        version,
        type: ((_c = packageJson.devDependencies) == null ? void 0 : _c[depName]) ? "tool" : "library",
        usage: ((_d = packageJson.devDependencies) == null ? void 0 : _d[depName]) ? "development" : "core",
        confidence: 0.6
        // Lower confidence for unknown/guessed tech
      });
    }
  }
  const reactTech = technologies.find((t) => t.name.toLowerCase() === "react");
  if (reactTech && reactTech.version) {
    const isReactModern = reactTech.version.startsWith("18") || reactTech.version.startsWith("^18") || reactTech.version.startsWith("~18") || reactTech.version.startsWith("19") || reactTech.version.startsWith("^19") || reactTech.version.startsWith("~19");
    if (isReactModern) {
      reactTech.name = "React (Modern)";
    }
  }
  const nextTech = technologies.find((t) => t.name.toLowerCase() === "next.js");
  if (nextTech && nextTech.version) {
    const isNextModern = nextTech.version.startsWith("13") || nextTech.version.startsWith("^13") || nextTech.version.startsWith("~13") || nextTech.version.startsWith("14") || nextTech.version.startsWith("^14") || nextTech.version.startsWith("~14") || nextTech.version.startsWith("15") || nextTech.version.startsWith("^15") || nextTech.version.startsWith("~15");
    if (isNextModern) {
      nextTech.name = "Next.js (Modern)";
    }
  }
  return { projectName, technologies };
}
function getProperTechName(depName, techKey) {
  if (techKey && TECH_CATEGORIES[techKey]) {
    if (depName.startsWith("@") && techKey.startsWith("@")) {
      const baseKeyName = Object.keys(TECH_SPECIAL_NAMES).find(
        (k) => techKey.toLowerCase() === k.toLowerCase()
      );
      if (baseKeyName) return TECH_SPECIAL_NAMES[baseKeyName];
      return capitalizeFirstLetter(techKey.substring(1).split("/")[0]);
    }
    const specialNameKey = Object.keys(TECH_SPECIAL_NAMES).find(
      (k) => techKey.toLowerCase() === k.toLowerCase()
    );
    if (specialNameKey) return TECH_SPECIAL_NAMES[specialNameKey];
    return capitalizeFirstLetter(techKey);
  }
  if (depName.startsWith("@")) {
    const parts = depName.substring(1).split("/");
    const namespace = capitalizeFirstLetter(parts[0]);
    const packageName = parts[1] ? capitalizeFirstLetter(parts[1]) : "";
    if (packageName) return `${namespace} ${packageName}`;
    return namespace;
  }
  const specialNameKeyFromDep = Object.keys(TECH_SPECIAL_NAMES).find(
    (k) => depName.toLowerCase() === k.toLowerCase()
  );
  if (specialNameKeyFromDep) {
    return TECH_SPECIAL_NAMES[specialNameKeyFromDep];
  }
  return depName.split("-").map((part) => capitalizeFirstLetter(part)).join(" ");
}
var TECH_SPECIAL_NAMES = {
  react: "React",
  next: "Next.js",
  vue: "Vue.js",
  // Added .js for consistency
  angular: "Angular",
  typescript: "TypeScript",
  tailwindcss: "Tailwind CSS",
  firebase: "Firebase",
  "firebase-admin": "Firebase Admin",
  eslint: "ESLint",
  prettier: "Prettier",
  jest: "Jest",
  tsup: "TSup",
  // Capitalized
  zod: "Zod",
  ai: "Vercel AI SDK",
  // More descriptive
  "@ai-sdk/react": "Vercel AI SDK (React)",
  "@ai-sdk/openai": "Vercel AI SDK (OpenAI)",
  langchain: "Langchain",
  "@langchain/core": "Langchain Core",
  "@langchain/openai": "Langchain OpenAI",
  axios: "Axios",
  zustand: "Zustand",
  "@radix-ui": "Radix UI",
  // Base name for Radix
  "class-variance-authority": "Class Variance Authority",
  "lucide-react": "Lucide React",
  clsx: "clsx",
  // Often kept lowercase
  "tailwind-merge": "Tailwind Merge",
  "@heroicons": "Heroicons"
  // Add more as needed
};
function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// src/lib/analyzer/file-structure-analyzer.ts
var KNOWN_CONFIG_FILES = [
  "next.config.js",
  "next.config.mjs",
  "tailwind.config.js",
  "tailwind.config.ts",
  "postcss.config.js",
  "tsconfig.json",
  "jsconfig.json",
  ".eslintrc.json",
  ".eslintrc.js",
  ".eslint.config.js",
  ".prettierrc.json",
  ".prettierrc.js",
  ".prettier.config.js",
  "components.json",
  "vite.config.ts",
  "vite.config.js",
  "webpack.config.js"
];
var KNOWN_ENTRY_POINT_BASENAMES = [
  "index.ts",
  "index.tsx",
  "index.js",
  "index.jsx",
  "main.ts",
  "main.tsx",
  "main.js",
  "main.jsx",
  "App.ts",
  "App.tsx",
  "App.jsx",
  "app.ts",
  "app.tsx",
  "app.jsx",
  "server.ts",
  "server.js"
];
function analyzeFileStructure(allProjectFiles) {
  const result = {
    fileStructure: {
      directories: [],
      commonDirs: [],
      entryPoints: [],
      configFiles: []
    },
    architecturalPatterns: [],
    codePatterns: []
  };
  if (!allProjectFiles || allProjectFiles.length === 0) {
    return result;
  }
  const uniqueRelativeDirs = /* @__PURE__ */ new Set();
  allProjectFiles.forEach((filePath) => {
    const normalizedPath = filePath.replace(/\\/g, "/");
    const parts = normalizedPath.split("/");
    if (parts.length > 1) {
      parts.pop();
      let currentPath = "";
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        uniqueRelativeDirs.add(currentPath);
      }
    }
    const baseName = parts.pop() || normalizedPath;
    if (KNOWN_CONFIG_FILES.includes(baseName)) {
      result.fileStructure.configFiles.push(normalizedPath);
    }
    if (KNOWN_ENTRY_POINT_BASENAMES.includes(baseName)) {
      const dirName = parts.join("/");
      if (dirName === "" || dirName === "src" || dirName === "app" || dirName === "pages") {
        result.fileStructure.entryPoints.push(normalizedPath);
      }
    }
  });
  const allDirs = Array.from(uniqueRelativeDirs);
  result.fileStructure.directories = allDirs.filter(
    (dir) => !dir.includes("/")
  );
  const commonDirNames = [
    "src",
    "components",
    "lib",
    "utils",
    "hooks",
    "api",
    "server",
    "styles",
    "public",
    "app",
    "pages",
    "features"
  ];
  result.fileStructure.commonDirs = allDirs.filter((dir) => {
    const dirBaseName = dir.split("/").pop();
    return dirBaseName && commonDirNames.includes(dirBaseName);
  });
  result.architecturalPatterns = detectArchitecturalPatterns(
    allProjectFiles,
    allDirs
  );
  result.codePatterns = detectCodePatterns(allProjectFiles, allDirs);
  return result;
}
function detectArchitecturalPatterns(allFiles, allDirs) {
  const patterns = [];
  const hasDir = (dirName) => allDirs.some((d) => d === dirName || d.startsWith(dirName + "/"));
  const fileExists2 = (filePath) => allFiles.includes(filePath.replace(/\\/g, "/"));
  if (hasDir("app") && (fileExists2("app/layout.tsx") || fileExists2("app/layout.jsx") || fileExists2("app/layout.ts") || fileExists2("app/layout.js"))) {
    patterns.push({
      name: "Next.js App Router",
      description: "Modern Next.js routing system using app directory with nested layouts and server components.",
      components: [
        "app/layout.tsx (or .jsx, .ts, .js)",
        "app/page.tsx (or .jsx, .ts, .js)"
      ],
      locations: ["app/"]
    });
  }
  if (hasDir("pages") && (fileExists2("pages/_app.tsx") || fileExists2("pages/_app.jsx") || fileExists2("pages/_document.tsx") || fileExists2("pages/_document.jsx"))) {
    if (!patterns.some(
      (p) => p.name === "Next.js App Router" && hasDir("pages/api") && !hasDir("pages/[...slug].tsx")
    )) {
      patterns.push({
        name: "Next.js Pages Router",
        description: "Traditional Next.js routing system using pages directory.",
        components: ["pages/_app.tsx (or .jsx)", "pages/index.tsx (or .jsx)"],
        locations: ["pages/"]
      });
    }
  }
  if (hasDir("src") && allFiles.some((f) => f.startsWith("src/"))) {
    patterns.push({
      name: "Source Directory Layout (src)",
      description: 'Project source code is organized under a top-level "src" directory.',
      locations: ["src/"]
    });
  }
  if (hasDir("components")) {
    patterns.push({
      name: "Component-Based Architecture",
      description: 'UI is built using a modular, component-based approach. Common directory "components" found.',
      components: ["components/*"],
      locations: ["components/"]
    });
  }
  if (hasDir("packages") || hasDir("libs")) {
    patterns.push({
      name: "Monorepo Structure (Potential)",
      description: 'Project may be a monorepo, indicated by "packages" or "libs" directory.',
      locations: ["packages/", "libs/"]
    });
  }
  const hasAppApi = hasDir("app/api");
  const hasPagesApi = hasDir("pages/api");
  const hasSrcApi = hasDir("src/api") || hasDir("src/pages/api") || hasDir("src/app/api");
  if (hasAppApi || hasPagesApi || hasSrcApi) {
    const locations = [];
    if (hasAppApi) locations.push("app/api/");
    if (hasPagesApi) locations.push("pages/api/");
    if (hasSrcApi && !hasAppApi && !hasPagesApi) {
      if (hasDir("src/app/api")) locations.push("src/app/api/");
      else if (hasDir("src/pages/api")) locations.push("src/pages/api/");
      else if (hasDir("src/api")) locations.push("src/api/");
    }
    if (locations.length > 0) {
      patterns.push({
        name: "API Routes Structure",
        description: "Backend API endpoints are likely defined within the project structure.",
        components: locations.map((loc) => `${loc}*`),
        locations
      });
    }
  }
  return patterns;
}
function detectCodePatterns(allFiles, allDirs) {
  const patterns = [];
  const hasDir = (dirName) => allDirs.some((d) => d === dirName || d.startsWith(dirName + "/"));
  const fileExistsInDir = (dirName, partialFilePath) => allFiles.some((f) => f.startsWith(`${dirName}/${partialFilePath}`));
  const dirContainsFileMatching = (dirName, regex) => allFiles.some(
    (f) => f.startsWith(dirName + "/") && regex.test(f.split("/").pop() || "")
  );
  if (hasDir("hooks") || hasDir("src/hooks") || dirContainsFileMatching("lib", /^use[A-Z].*\.(ts|tsx|js|jsx)$/) || dirContainsFileMatching("utils", /^use[A-Z].*\.(ts|tsx|js|jsx)$/)) {
    patterns.push({
      name: "Custom Hooks",
      description: 'React custom hooks for reusable stateful logic (e.g., files starting with "use" in "hooks", "lib" or "utils" directories).',
      examples: ["useAuth", "useForm", "useLocalStorage"],
      locations: ["hooks/", "src/hooks/", "lib/", "utils/"]
    });
  }
  if (hasDir("components/ui") || hasDir("src/components/ui") && fileExistsInDir(
    hasDir("src/components/ui") ? "src/components/ui" : "components/ui",
    "button."
  )) {
    patterns.push({
      name: "Shadcn/UI Components",
      description: "Reusable UI components structured similarly to shadcn/ui, often using Radix UI and Tailwind CSS.",
      examples: ["Button", "Card", "Dialog (found in components/ui)"],
      locations: [
        hasDir("src/components/ui") ? "src/components/ui/" : "components/ui/"
      ]
    });
  }
  if (hasDir("store") || hasDir("stores") || hasDir("src/store") || hasDir("src/stores") || fileExistsInDir("lib", "store.") || fileExistsInDir("app", "store.")) {
    patterns.push({
      name: "Centralized State Management (Potential)",
      description: 'Indicates use of a state management library (e.g., Zustand, Redux, Jotai) by presence of "store(s)" directory or store files.',
      locations: ["store/", "stores/", "src/store/", "src/stores/"]
    });
  }
  if (hasDir("context") || hasDir("contexts") || hasDir("src/context") || hasDir("src/contexts")) {
    patterns.push({
      name: "React Context API Usage",
      description: 'Indicates usage of React Context API for state sharing, suggested by "context(s)" directory.',
      locations: ["context/", "contexts/", "src/context/", "src/contexts/"]
    });
  }
  if (hasDir("utils") || hasDir("src/utils") || hasDir("lib") || hasDir("src/lib")) {
    patterns.push({
      name: "Utility Modules",
      description: 'Project contains utility functions/modules, often in "utils" or "lib" directories.',
      locations: ["utils/", "src/utils/", "lib/", "src/lib/"]
    });
  }
  if (hasDir("locales") || hasDir("src/locales") || hasDir("i18n") || hasDir("src/i18n") || allFiles.some((f) => f.includes("i18n"))) {
    patterns.push({
      name: "Internationalization (i18n) Structure",
      description: 'Project may support multiple languages, indicated by "locales" or "i18n" directories or file names.',
      locations: ["locales/", "src/locales/", "i18n/", "src/i18n/"]
    });
  }
  return patterns;
}

// src/lib/analyzer/code-quality-analyzer.ts
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
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
  const hasTypeScript = await fileExists(import_path.default.join(rootDir, "tsconfig.json"));
  result.bestPractices.push({
    name: "TypeScript",
    detected: hasTypeScript,
    details: hasTypeScript ? "Project uses TypeScript for type safety" : "TypeScript not detected"
  });
  const hasESLint = await fileExists(import_path.default.join(rootDir, ".eslintrc.js")) || await fileExists(import_path.default.join(rootDir, ".eslintrc")) || await fileExists(import_path.default.join(rootDir, "eslint.config.js")) || await fileExists(import_path.default.join(rootDir, "eslint.config.mjs"));
  result.bestPractices.push({
    name: "ESLint",
    detected: hasESLint,
    details: hasESLint ? "Project uses ESLint for code quality" : "ESLint not detected"
  });
  const hasJest = await fileExists(import_path.default.join(rootDir, "jest.config.js")) || await fileExists(import_path.default.join(rootDir, "jest.config.ts"));
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
    const componentsDir = import_path.default.join(rootDir, "components");
    if (await fileExists(componentsDir)) {
      const componentFiles = await walkDir(componentsDir, [".tsx", ".jsx"]);
      metrics.componentCount = componentFiles.length;
    }
  } catch (e) {
  }
  try {
    const hooksDir = import_path.default.join(rootDir, "hooks");
    if (await fileExists(hooksDir)) {
      const hookFiles = await walkDir(hooksDir, [".ts", ".tsx", ".js", ".jsx"]);
      metrics.hooksCount = hookFiles.length;
    }
    const libDir = import_path.default.join(rootDir, "lib");
    if (await fileExists(libDir)) {
      const libFiles = await walkDir(libDir, [".ts", ".js"]);
      metrics.hooksCount += libFiles.filter(
        (file) => import_path.default.basename(file).startsWith("use")
      ).length;
    }
  } catch (e) {
  }
  try {
    const utilsDir = import_path.default.join(rootDir, "utils");
    if (await fileExists(utilsDir)) {
      const utilsFiles = await walkDir(utilsDir, [".ts", ".js"]);
      metrics.utilsCount = utilsFiles.length;
    }
    const libUtilsDir = import_path.default.join(rootDir, "lib/utils");
    if (await fileExists(libUtilsDir)) {
      const libUtilsFiles = await walkDir(libUtilsDir, [".ts", ".js"]);
      metrics.utilsCount += libUtilsFiles.length;
    }
  } catch (e) {
  }
  try {
    const apiDir = import_path.default.join(rootDir, "app/api");
    if (await fileExists(apiDir)) {
      const apiFiles = await walkDir(apiDir, [".ts", ".js"]);
      metrics.apiRoutesCount = apiFiles.filter(
        (file) => import_path.default.basename(file) === "route.ts" || import_path.default.basename(file) === "route.js"
      ).length;
    }
    const pagesApiDir = import_path.default.join(rootDir, "pages/api");
    if (await fileExists(pagesApiDir)) {
      const pagesApiFiles = await walkDir(pagesApiDir, [".ts", ".js"]);
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
  if (await fileExists(import_path.default.join(rootDir, "components"))) {
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
async function fileExists(filePath) {
  try {
    await import_fs.default.promises.access(filePath);
    return true;
  } catch (e) {
    return false;
  }
}
async function walkDir(dir, extensions = []) {
  if (!await fileExists(dir)) {
    return [];
  }
  const entries = await import_fs.default.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = import_path.default.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkDir(fullPath, extensions);
      } else if (entry.isFile()) {
        const ext = import_path.default.extname(entry.name);
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
    const files = await walkDir(rootDir, extensions);
    for (const file of files) {
      const basename = import_path.default.basename(file);
      if (patterns.some((pattern) => basename.includes(pattern))) {
        matchingFiles.push(file);
      }
    }
  } catch (e) {
  }
  return matchingFiles;
}

// src/lib/analyzer/index.ts
async function getAllFilePaths(dirPath, baseDir = dirPath) {
  let files = [];
  const entries = await import_promises.default.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = import_path2.default.join(dirPath, entry.name);
    const relativePath = import_path2.default.relative(baseDir, fullPath);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git") {
        files = files.concat(await getAllFilePaths(fullPath, baseDir));
      }
    } else {
      files.push(relativePath.replace(/\\/g, "/"));
    }
  }
  return files;
}
async function analyzeProject(projectPath) {
  var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u;
  if (!import_fs2.default.existsSync(projectPath)) {
    throw new Error(`Project path does not exist: ${projectPath}`);
  }
  const result = {
    context: {
      projectName: import_path2.default.basename(projectPath),
      technologies: [],
      architecturalPatterns: [],
      codePatterns: [],
      bestPracticesObserved: [],
      fileStructure: {
        directories: [],
        entryPoints: [],
        configFiles: []
      },
      analysisMetadata: {
        analyzedAt: /* @__PURE__ */ new Date(),
        overallConfidence: 0
      }
    },
    rawFileContents: {
      packageJson: void 0,
      tsConfig: void 0,
      nextConfig: void 0,
      otherRelevantConfigs: {}
    },
    errors: []
  };
  try {
    const allProjectFiles = await getAllFilePaths(projectPath);
    const packageJsonPath = import_path2.default.join(projectPath, "package.json");
    if (import_fs2.default.existsSync(packageJsonPath)) {
      const packageJsonRaw = await import_promises.default.readFile(
        packageJsonPath,
        "utf-8"
      );
      result.rawFileContents.packageJson = JSON.parse(packageJsonRaw);
      if (result.rawFileContents.packageJson) {
        const packageAnalysis = analyzePackageJson(
          result.rawFileContents.packageJson
        );
        const technologiesFromPackage = packageAnalysis.technologies || [];
        if (result.context.technologies) {
          result.context.technologies.push(...technologiesFromPackage);
        } else {
          result.context.technologies = technologiesFromPackage;
        }
      }
    }
    const tsconfigPath = import_path2.default.join(projectPath, "tsconfig.json");
    if (import_fs2.default.existsSync(tsconfigPath)) {
      const tsconfigRaw = await import_promises.default.readFile(tsconfigPath, "utf-8");
      result.rawFileContents.tsConfig = JSON.parse(tsconfigRaw);
    }
    const nextConfigJsPath = import_path2.default.join(projectPath, "next.config.js");
    const nextConfigTsPath = import_path2.default.join(projectPath, "next.config.ts");
    let nextConfigPathResolved;
    if (allProjectFiles.includes("next.config.js")) {
      nextConfigPathResolved = nextConfigJsPath;
    } else if (allProjectFiles.includes("next.config.ts")) {
      nextConfigPathResolved = nextConfigTsPath;
    }
    if (nextConfigPathResolved) {
      result.rawFileContents.nextConfig = { path: nextConfigPathResolved };
    }
    const fileStructureResult = analyzeFileStructure(allProjectFiles);
    if (result.context.fileStructure) {
      result.context.fileStructure.directories = ((_a2 = fileStructureResult.fileStructure) == null ? void 0 : _a2.directories) || [];
      result.context.fileStructure.entryPoints = ((_b = fileStructureResult.fileStructure) == null ? void 0 : _b.entryPoints) || [];
      result.context.fileStructure.configFiles = ((_c = fileStructureResult.fileStructure) == null ? void 0 : _c.configFiles) || [];
    }
    if (fileStructureResult.architecturalPatterns) {
      result.context.architecturalPatterns = [
        ...result.context.architecturalPatterns || [],
        ...fileStructureResult.architecturalPatterns
      ];
    }
    if (fileStructureResult.codePatterns) {
      result.context.codePatterns = [
        ...result.context.codePatterns || [],
        ...fileStructureResult.codePatterns
      ];
    }
    const codeQualityResult = await analyzeCodeQuality(projectPath);
    if (codeQualityResult.patterns) {
      result.context.codePatterns = [
        ...result.context.codePatterns || [],
        ...codeQualityResult.patterns
      ];
    }
    const hasPackageJson = !!result.rawFileContents.packageJson;
    const hasTsConfig = !!result.rawFileContents.tsConfig;
    const hasNextConfig = !!result.rawFileContents.nextConfig;
    const componentsInFileStructure = ((_e = (_d = fileStructureResult.fileStructure) == null ? void 0 : _d.commonDirs) == null ? void 0 : _e.includes("components")) || ((_g = (_f = fileStructureResult.fileStructure) == null ? void 0 : _f.directories) == null ? void 0 : _g.includes("components")) || false;
    const pagesInFileStructure = ((_i = (_h = fileStructureResult.fileStructure) == null ? void 0 : _h.commonDirs) == null ? void 0 : _i.includes("pages")) || ((_k = (_j = fileStructureResult.fileStructure) == null ? void 0 : _j.directories) == null ? void 0 : _k.includes("pages")) || false;
    const appInFileStructure = ((_m = (_l = fileStructureResult.fileStructure) == null ? void 0 : _l.commonDirs) == null ? void 0 : _m.includes("app")) || ((_o = (_n = fileStructureResult.fileStructure) == null ? void 0 : _n.directories) == null ? void 0 : _o.includes("app")) || false;
    const hasComponents = ((_q = (_p = result.context.fileStructure) == null ? void 0 : _p.directories) == null ? void 0 : _q.includes("components")) || componentsInFileStructure;
    const hasPages = ((_s = (_r = result.context.fileStructure) == null ? void 0 : _r.directories) == null ? void 0 : _s.includes("pages")) || pagesInFileStructure;
    const hasApp = ((_u = (_t = result.context.fileStructure) == null ? void 0 : _t.directories) == null ? void 0 : _u.includes("app")) || appInFileStructure;
    let confidenceScore = 0.5;
    if (hasPackageJson) confidenceScore += 0.1;
    if (hasTsConfig) confidenceScore += 0.05;
    if (hasNextConfig) confidenceScore += 0.05;
    if (hasComponents) confidenceScore += 0.1;
    if (hasPages || hasApp) confidenceScore += 0.1;
    if (result.context.technologies && result.context.technologies.length > 0)
      confidenceScore += 0.1;
    if (result.context.analysisMetadata) {
      result.context.analysisMetadata.overallConfidence = Math.min(
        1,
        confidenceScore
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during project analysis";
    console.error("Error during project analysis:", error);
    if (result.context.analysisMetadata) {
      result.context.analysisMetadata.overallConfidence = 0.3;
    }
    result.errors = [
      ...result.errors || [],
      { message, sourceAnalyzer: "analyzeProjectCatchBlock" }
    ];
  }
  return result;
}

// src/lib/analyzer/context-storage.ts
var import_firestore3 = require("firebase/firestore");

// src/lib/firebase.ts
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

// src/lib/firebase-admin.ts
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

// src/lib/analyzer/context-storage.ts
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
async function getProjectContextById(contextId) {
  const docRef = adminDb.collection("projectContexts").doc(contextId);
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
    return null;
  }
  return {
    id: docSnap.id,
    ...docSnap.data()
  };
}

// src/lib/ai/chains.ts
var import_prompts = require("@langchain/core/prompts");

// src/lib/ai/models.ts
var import_openai = require("@langchain/openai");
function createChatModel(modelName, apiKey, options = {}) {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (modelName.includes("gpt")) {
    return new import_openai.ChatOpenAI({
      modelName,
      openAIApiKey: key,
      ...options
    });
  }
  return new import_openai.ChatOpenAI({
    modelName: "gpt-4o",
    openAIApiKey: key,
    ...options
  });
}

// src/lib/ai/chains.ts
var import_runnables = require("@langchain/core/runnables");
function createAssistantChain(systemPrompt, modelName = "gpt-4o", apiKey) {
  const model = createChatModel(modelName, apiKey);
  const prompt = import_prompts.ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", "{input}"]
  ]);
  return import_runnables.RunnableSequence.from([prompt, model]);
}

// src/lib/ai/server.ts
var import_ai = require("ai");
var import_openai3 = require("@ai-sdk/openai");

// src/lib/ai/context-adapter.ts
var import_openai2 = require("@langchain/openai");
var import_prompts2 = require("@langchain/core/prompts");
var import_messages = require("@langchain/core/messages");
async function generateContextAwareResponse(message, history, context, config) {
  const llm = new import_openai2.ChatOpenAI({
    modelName: (config == null ? void 0 : config.model) || "gpt-4o-mini",
    temperature: 0.7,
    streaming: (config == null ? void 0 : config.streaming) || false,
    openAIApiKey: (config == null ? void 0 : config.apiKey) || process.env.OPENAI_API_KEY
  });
  const relevanceScore = await assessContextRelevance(message, context, llm);
  if (relevanceScore > 3 && context) {
    return generateEnhancedResponse(message, context, llm);
  } else {
    return generateStandardResponse(message, llm);
  }
}
async function assessContextRelevance(query2, context, llm) {
  if (!context) {
    return 0;
  }
  const contextSummary = formatContextSummary(context);
  const contextAssessmentPrompt = import_prompts2.ChatPromptTemplate.fromMessages([
    new import_messages.SystemMessage(
      "You are an expert at determining how relevant project context is to user queries. Analyze the provided project context and determine how relevant it is to answering the user query. Assign a relevance score from 0 (completely irrelevant) to 10 (highly relevant)."
    ),
    new import_messages.HumanMessage(
      `Project Context: ${contextSummary}

User Query: ${query2}

Assess the relevance of this context to the query on a scale of 0-10 and explain why briefly.`
    )
  ]);
  const assessment = await contextAssessmentPrompt.pipe(llm).invoke({});
  const responseText = assessment.content.toString();
  const relevanceMatch = responseText.match(/\b([0-9]|10)\b/);
  return relevanceMatch ? parseInt(relevanceMatch[0], 10) : 5;
}
async function generateEnhancedResponse(query2, context, llm) {
  const contextString = formatContextSummary(context);
  const contextEnhancedPrompt = import_prompts2.ChatPromptTemplate.fromMessages([
    new import_messages.SystemMessage(
      `You are an AI assistant with expertise in software development. Use the provided project context to tailor your response to be more relevant and specific to the user's project. Focus particularly on technology choices, architectural patterns, and coding conventions that match the context provided.

${contextString}`
    ),
    new import_messages.HumanMessage(query2)
  ]);
  const response = await contextEnhancedPrompt.pipe(llm).invoke({});
  return response.content.toString();
}
async function generateStandardResponse(query2, llm) {
  const standardPrompt = import_prompts2.ChatPromptTemplate.fromMessages([
    new import_messages.SystemMessage(
      "You are an AI assistant with expertise in software development. Provide a helpful answer to the user's query."
    ),
    new import_messages.HumanMessage(query2)
  ]);
  const response = await standardPrompt.pipe(llm).invoke({});
  return response.content.toString();
}
function formatContextSummary(context) {
  const {
    technologies,
    frameworks,
    architecturalPatterns,
    codePatterns,
    bestPracticesObserved
  } = context;
  return `
PROJECT CONTEXT SUMMARY:
- Technologies: ${(technologies == null ? void 0 : technologies.map((t) => t.name).join(", ")) || "N/A"}
- Frameworks: ${(frameworks == null ? void 0 : frameworks.map((f) => f.name).join(", ")) || "N/A"}
- Architecture: ${(architecturalPatterns == null ? void 0 : architecturalPatterns.map((p) => p.name).join(", ")) || "N/A"}
- Code Patterns: ${(codePatterns == null ? void 0 : codePatterns.map((p) => p.name).join(", ")) || "N/A"}
- Best Practices Observed: ${(bestPracticesObserved == null ? void 0 : bestPracticesObserved.slice(0, 3).join(", ")) || "N/A"}
`;
}

// src/lib/firebase/context-service.ts
var import_firestore4 = require("firebase-admin/firestore");
async function getProjectContext(projectId) {
  if (!projectId) {
    console.warn("getProjectContext called with no projectId");
    return null;
  }
  const docRef = adminDb.collection("projectContexts").doc(projectId);
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    const storedData = docSnap.data();
    return storedData.context;
  } else {
    console.log(`No project context found for ID: ${projectId}`);
    return null;
  }
}

// src/lib/ai/server.ts
var openaiModel = (0, import_openai3.openai)("gpt-4o");
async function processChat(message, history = [], appContext, projectId) {
  try {
    if (projectId) {
      const projectContext = await getProjectContext(projectId);
      const response2 = await generateContextAwareResponse(
        message,
        // This is potentially augmentedMessage from the API route
        history,
        projectContext
      );
      return response2;
    }
    const systemPrompt = createSystemPrompt(appContext);
    const chain = createAssistantChain(systemPrompt);
    const formattedHistory = history.map((msg) => ({
      role: msg.role === "user" ? "human" : "assistant",
      content: msg.content
    }));
    const response = await chain.invoke({
      input: message,
      // This is potentially augmentedMessage from the API route
      chat_history: formattedHistory
    });
    return response.content;
  } catch (error) {
    console.error("Error processing chat:", error);
    return "Sorry, there was an error processing your request.";
  }
}
async function processChatStream(message, history = [], appContext, projectContextInput) {
  let systemPrompt = "";
  if (projectContextInput) {
    try {
      systemPrompt = createSystemPromptWithContext(
        appContext,
        projectContextInput
      );
    } catch (error) {
      console.error(
        "Error creating system prompt with project context:",
        error
      );
      systemPrompt = createSystemPrompt(appContext);
    }
  } else {
    systemPrompt = createSystemPrompt(appContext);
  }
  const formattedMessages = [
    { id: crypto.randomUUID(), role: "system", content: systemPrompt },
    ...history,
    { id: crypto.randomUUID(), role: "user", content: message }
    // message here already contains RAG + original query
  ];
  try {
    return (0, import_ai.streamText)({
      model: openaiModel,
      // or activeModel if using Groq/other
      messages: formattedMessages,
      temperature: 0.7,
      maxTokens: 2e3
    });
  } catch (error) {
    console.error("AI streaming error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process AI request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
function createSystemPrompt(appContext) {
  let basePrompt = appContext ? `You are an AI assistant for ${appContext}. Be helpful, concise, and friendly.` : "You are a helpful AI assistant.";
  basePrompt += `
When responding, if the user's message contains "Retrieved Context from Codebase", please use that information as the primary source for your answer. If the retrieved context is not relevant or insufficient, use your general knowledge.`;
  return basePrompt;
}
function createSystemPromptWithContext(appContext, projectContext) {
  let prompt = createSystemPrompt(appContext);
  prompt += `
In addition to any retrieved codebase snippets, consider the following general project details. Synthesize all available information for the most comprehensive answer.`;
  if (!projectContext) {
    prompt += "\nNo general project details available for this session.";
    return prompt;
  }
  prompt += `

General Project Details:`;
  if (projectContext.technologies && projectContext.technologies.length > 0) {
    prompt += "\nProject Technologies:";
    prompt += `
${projectContext.technologies.map((t) => t.name).join(", ")}`;
  }
  if (projectContext.frameworks && projectContext.frameworks.length > 0) {
    prompt += "\nFrameworks:";
    prompt += `
${projectContext.frameworks.map((f) => f.name).join(", ")}`;
  }
  if (projectContext.architecturalPatterns && projectContext.architecturalPatterns.length > 0) {
    prompt += "\nArchitecture:";
    prompt += `
${projectContext.architecturalPatterns.map((p) => p.name).join(", ")}`;
  }
  if (projectContext.codePatterns && projectContext.codePatterns.length > 0) {
    prompt += "\nCode Patterns:";
    for (const pattern of projectContext.codePatterns) {
      prompt += `
- ${pattern.name}: ${pattern.description}`;
    }
  }
  if (projectContext.bestPracticesObserved && projectContext.bestPracticesObserved.length > 0) {
    prompt += "\nBest Practices Observed:";
    for (const practice of projectContext.bestPracticesObserved) {
      prompt += `
- ${practice}`;
    }
  }
  prompt += `

When answering questions about this project:
1. Prioritize information from any "Retrieved Context from Codebase" in the user's message.
2. Supplement with these "General Project Details" (technologies, patterns, etc.) for broader understanding.
3. If conflicting, explicitly state the source of your information.
4. Suggest solutions that align with the existing codebase and its established patterns.
5. Use code examples that match the project's style if possible.`;
  return prompt;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AIChatComponent,
  ChatInput,
  MessageItem,
  MessageList,
  analyzeCodeQuality,
  analyzeFileStructure,
  analyzePackageJson,
  analyzeProject,
  createAIAssistant,
  createAssistantChain,
  createSystemPrompt,
  createSystemPromptWithContext,
  deleteProjectContext,
  generateContextAwareResponse,
  getLatestProjectContext,
  getProjectContextById,
  getUserProjects,
  processChat,
  processChatStream,
  storeProjectContext
});
