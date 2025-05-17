"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// package/index.ts
var index_exports = {};
__export(index_exports, {
  AIChatComponent: () => AIChatComponent_default,
  ChatInput: () => ChatInput_default,
  MessageItem: () => MessageItem_default,
  MessageList: () => MessageList_default,
  createAIAssistant: () => createAIAssistant
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
    var _a;
    (_a = messagesEndRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
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
    sendMessage: async (message, history = []) => {
      const response = await fetchWithAuth("/assistant", {
        method: "POST",
        body: JSON.stringify({ message, history })
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
    createSession: async (title) => {
      const response = await fetchWithAuth("/sessions", {
        method: "POST",
        body: JSON.stringify({ title })
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
    streamMessage: async (message, history = [], onChunk) => {
      var _a;
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
        body: JSON.stringify({ message, history, streaming: true })
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const reader = (_a = response.body) == null ? void 0 : _a.getReader();
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
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AIChatComponent,
  ChatInput,
  MessageItem,
  MessageList,
  createAIAssistant
});
