// src/components/chat/MessageItem.tsx
import { jsx } from "react/jsx-runtime";
var MessageItem = ({ message, isAI }) => {
  return /* @__PURE__ */ jsx("div", { className: `flex ${isAI ? "justify-start" : "justify-end"} mb-4`, children: /* @__PURE__ */ jsx(
    "div",
    {
      className: `max-w-[70%] rounded-lg p-3 ${isAI ? "bg-gray-100" : "bg-blue-500 text-white"}`,
      children: /* @__PURE__ */ jsx("p", { className: "text-sm", children: message.content })
    }
  ) });
};
var MessageItem_default = MessageItem;

// src/components/chat/MessageList.tsx
import { useRef, useEffect } from "react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var MessageList = ({ messages, loading = false }) => {
  const messagesEndRef = useRef(null);
  useEffect(() => {
    var _a;
    (_a = messagesEndRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-4", children: [
    messages.map((message) => /* @__PURE__ */ jsx2(
      MessageItem_default,
      {
        message,
        isAI: message.role === "assistant"
      },
      message.id
    )),
    loading && /* @__PURE__ */ jsx2("div", { className: "flex justify-start mb-4", children: /* @__PURE__ */ jsx2("div", { className: "bg-gray-100 rounded-lg p-3 max-w-[70%]", children: /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
      /* @__PURE__ */ jsx2("div", { className: "w-2 h-2 rounded-full bg-gray-400 animate-bounce" }),
      /* @__PURE__ */ jsx2(
        "div",
        {
          className: "w-2 h-2 rounded-full bg-gray-400 animate-bounce",
          style: { animationDelay: "0.2s" }
        }
      ),
      /* @__PURE__ */ jsx2(
        "div",
        {
          className: "w-2 h-2 rounded-full bg-gray-400 animate-bounce",
          style: { animationDelay: "0.4s" }
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsx2("div", { ref: messagesEndRef })
  ] });
};
var MessageList_default = MessageList;

// src/components/chat/ChatInput.tsx
import { useState } from "react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var ChatInput = ({
  onSendMessage,
  disabled = false,
  placeholder
}) => {
  const [input, setInput] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput("");
    }
  };
  return /* @__PURE__ */ jsx3("form", { onSubmit: handleSubmit, className: "border-t p-4", children: /* @__PURE__ */ jsxs2("div", { className: "flex space-x-2", children: [
    /* @__PURE__ */ jsx3(
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
    /* @__PURE__ */ jsx3(
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
import { useState as useState2 } from "react";
import { v4 as uuidv4 } from "uuid";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var AIChatComponent = ({
  apiKey,
  apiEndpoint = "/api/assistant",
  initialMessages = [],
  placeholder = "Type your message...",
  className = "",
  onMessageSent,
  onResponseReceived
}) => {
  const [messages, setMessages] = useState2(initialMessages);
  const [loading, setLoading] = useState2(false);
  const [error, setError] = useState2(null);
  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMessage = {
      id: uuidv4(),
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
        id: data.id || uuidv4(),
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
  return /* @__PURE__ */ jsxs3("div", { className: `flex flex-col h-full ${className}`, children: [
    /* @__PURE__ */ jsx4("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsx4(MessageList_default, { messages, loading }) }),
    error && /* @__PURE__ */ jsx4("div", { className: "p-2 text-red-500 text-sm text-center", children: error }),
    /* @__PURE__ */ jsx4("div", { className: "mt-auto", children: /* @__PURE__ */ jsx4(
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
import { v4 as uuidv42 } from "uuid";
function createAIAssistant(options) {
  const apiUrl = options.apiUrl.endsWith("/") ? options.apiUrl.slice(0, -1) : options.apiUrl;
  const appContext = options.appContext;
  const getIdToken = options.getIdToken;
  const staticApiKey = options.staticApiKey;
  const fetchWithAuth = async (endpoint, requestOptions) => {
    const url = `${apiUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(requestOptions == null ? void 0 : requestOptions.headers) || {}
    };
    let tokenToUse = null;
    if (getIdToken) {
      tokenToUse = await getIdToken();
    }
    if (tokenToUse) {
      headers["Authorization"] = `Bearer ${tokenToUse}`;
    } else if (staticApiKey) {
      headers["Authorization"] = `Bearer ${staticApiKey}`;
    }
    return fetch(url, {
      ...requestOptions,
      headers
    });
  };
  return {
    // Send a message to the AI assistant
    sendMessage: async (message, history = [], contextId) => {
      const response = await fetchWithAuth("/api/assistant", {
        method: "POST",
        body: JSON.stringify({
          message,
          history,
          contextId,
          streaming: false
        })
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return {
        id: data.id || uuidv42(),
        role: "assistant",
        content: data.response || data.content,
        createdAt: data.timestamp || Date.now()
      };
    },
    getSessions: async () => {
      const response = await fetchWithAuth("/api/sessions");
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return data.sessions;
    },
    createSession: async (title, contextId) => {
      const response = await fetchWithAuth("/api/sessions", {
        method: "POST",
        body: JSON.stringify({ title, contextId })
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    },
    getSessionMessages: async (sessionId) => {
      const response = await fetchWithAuth(
        `/api/sessions/${sessionId}/messages`
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return data.messages;
    },
    sendMessageToSession: async (sessionId, content) => {
      const response = await fetchWithAuth(
        `/api/sessions/${sessionId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content })
        }
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    },
    updateSession: async (sessionId, data) => {
      const response = await fetchWithAuth(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    },
    deleteSession: async (sessionId) => {
      const response = await fetchWithAuth(`/api/sessions/${sessionId}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    },
    // streaming method
    streamMessage: async (message, history = [], onChunk, contextId) => {
      var _a;
      const headers = {
        "Content-Type": "application/json"
      };
      if (appContext) {
        headers["x-app-context"] = appContext;
      }
      let tokenToUse = null;
      if (getIdToken) {
        tokenToUse = await getIdToken();
      }
      if (tokenToUse) {
        headers["Authorization"] = `Bearer ${tokenToUse}`;
      } else if (staticApiKey) {
        headers["Authorization"] = `Bearer ${staticApiKey}`;
      }
      const response = await fetch(`${apiUrl}/api/assistant`, {
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
        id: uuidv42(),
        role: "assistant",
        content: fullText,
        createdAt: /* @__PURE__ */ new Date()
      };
    },
    // Project analysis
    analyzeProject: async (projectPath) => {
      const response = await fetchWithAuth("/api/analyze", {
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
      const response = await fetchWithAuth("/api/projects");
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return data.projects;
    },
    getProjectContext: async (contextId) => {
      if (!contextId || typeof contextId !== "string" || contextId.trim() === "") {
        console.error(
          "Invalid contextId provided to getProjectContext:",
          contextId
        );
        throw new Error("Invalid or missing project context ID.");
      }
      const response = await fetchWithAuth(`/api/projects/${contextId}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    },
    deleteProjectContext: async (contextId) => {
      if (!contextId || typeof contextId !== "string" || contextId.trim() === "") {
        console.error(
          "Invalid contextId provided to deleteProjectContext:",
          contextId
        );
        throw new Error("Invalid or missing project context ID for deletion.");
      }
      const response = await fetchWithAuth(`/api/projects/${contextId}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    },
    createProjectContext: async (projectContext) => {
      const response = await fetchWithAuth("/api/context", {
        method: "POST",
        body: JSON.stringify(projectContext)
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    },
    // Method to get project context by project ID (which is the contextId in this client)
    getProjectContextByProjectId: async (projectId) => {
      if (!projectId || typeof projectId !== "string" || projectId.trim() === "") {
        console.error(
          "Invalid projectId provided to getProjectContextByProjectId:",
          projectId
        );
        throw new Error("Invalid or missing project ID.");
      }
      const response = await fetchWithAuth(`/api/projects/${projectId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    }
  };
}

export {
  MessageItem_default,
  MessageList_default,
  ChatInput_default,
  AIChatComponent_default,
  createAIAssistant
};
