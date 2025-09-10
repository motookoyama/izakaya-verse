import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
const GlobalStyles = () => /* @__PURE__ */ jsx("style", { children: `
    :root {
      --background-color: #1e1e1e;
      --panel-background: #252526;
      --header-background: #333333;
      --input-background: #3c3c3c;
      --border-color: #3c3c3c;
      --text-color: #d4d4d4;
      --primary-color: #0e639c;
      --primary-color-hover: #1177bb;
      --icon-color: #cccccc;
      --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      --status-ready: #4caf50;
      --status-offline: #f44336;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: var(--font-family); background-color: var(--background-color);
      color: var(--text-color); margin: 0; overflow: hidden;
    }
    .app-container { display: flex; flex-direction: column; height: 100vh; }
    .main-content { display: flex; flex-grow: 1; overflow: hidden; }
    .panel { background-color: var(--panel-background); display: flex; flex-direction: column; height: 100%; }
    .sub-panel { overflow: hidden; display: flex; flex-direction: column; }
    .panel-header {
      padding: 8px 12px; background-color: #333; border-bottom: 1px solid var(--border-color);
      display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
    }
    .panel-header h2 { margin: 0; font-size: 0.9rem; }
    .icon-button {
      background: none; border: 1px solid var(--primary-color); color: var(--primary-color);
      cursor: pointer; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem;
    }
    .icon-button:hover { background-color: var(--primary-color); color: white; }
    .resizer {
      background-color: var(--border-color); cursor: col-resize; width: 5px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .resizer.horizontal { cursor: row-resize; height: 5px; width: 100%; }
    .resizer:hover { background-color: var(--primary-color); }
    .persona-icon { font-size: 1.5rem; line-height: 1; }
    .ai-status {
      width: 10px; height: 10px; border-radius: 50%;
      margin-left: 10px;
    }
  ` });
const BotIcon = ({ icon }) => icon ? /* @__PURE__ */ jsx("span", { className: "persona-icon", children: icon }) : /* @__PURE__ */ jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 12.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 8c-2.21 0-4 1.79-4 4h8c0-2.21-1.79-4-4-4z", fill: "currentColor" }) });
const UserIcon = () => /* @__PURE__ */ jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z", fill: "currentColor" }) });
const SendIcon = () => /* @__PURE__ */ jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z", fill: "currentColor" }) });
const CopyIcon = () => /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z", fill: "currentColor" }) });
let ai = null;
let aiInitializationError = null;
try {
  const apiKey = typeof process !== "undefined" && process.env.API_KEY ? process.env.API_KEY : null;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    aiInitializationError = "API_KEY not found.";
  }
} catch (error) {
  aiInitializationError = error.message;
  console.error("Failed to initialize GoogleGenAI", error);
}
const generateCode = async (userInput, persona) => {
  if (!ai) throw new Error(`AI client not initialized. ${aiInitializationError || "Is the API_KEY configured correctly?"}`);
  const personaBehavior = persona?.behavior ? `

Follow these instructions for your persona:
${persona.behavior}` : "";
  const systemInstruction = `You are an expert web developer.${personaBehavior} Given a prompt, you must generate the HTML, CSS, and JavaScript code to achieve the desired result. The code should be self-contained in a single HTML file. The CSS should be inside a <style> tag. The JavaScript should be inside a <script> tag. Wrap the final HTML code in a single markdown code block (\`\`\`html). Do not include any other explanations or text outside of the code block.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${systemInstruction}

User prompt: "${userInput}"`
  });
  const botResponse = response.text;
  const codeBlockRegex = /```html\n([\s\S]*?)\n```/;
  const match = botResponse.match(codeBlockRegex);
  if (match && match[1]) {
    return { code: match[1], message: "Here is the code based on your request. I've updated the editor and preview." };
  } else {
    return { code: `<!-- Code generation failed. Raw response:
${botResponse}
-->`, message: botResponse };
  }
};
const parsePersonaFromPng = async (file) => {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  if (view.getUint32(0) !== 2303741511) {
    throw new Error("Not a valid PNG file.");
  }
  let offset = 8;
  let charaData = null;
  while (offset < buffer.byteLength) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(view.getUint8(offset + 4), view.getUint8(offset + 5), view.getUint8(offset + 6), view.getUint8(offset + 7));
    if (type === "tEXt" || type === "iTXt" || type === "zTXt") {
      const chunkData = new Uint8Array(buffer, offset + 8, length);
      let keywordEnd = chunkData.indexOf(0);
      const keyword = new TextDecoder().decode(chunkData.slice(0, keywordEnd));
      if (keyword === "chara") {
        let text;
        if (type === "zTXt") {
          text = pako.inflate(chunkData.slice(keywordEnd + 2), { to: "string" });
        } else if (type === "iTXt") {
          const compressed = chunkData[keywordEnd + 2] === 1;
          const sliceStart = keywordEnd + 5;
          if (compressed) {
            text = pako.inflate(chunkData.slice(sliceStart), { to: "string" });
          } else {
            text = new TextDecoder().decode(chunkData.slice(sliceStart));
          }
        } else {
          text = new TextDecoder().decode(chunkData.slice(keywordEnd + 1));
        }
        charaData = JSON.parse(text);
      }
    }
    offset += 12 + length;
  }
  if (!charaData) throw new Error("No 'chara' data found in PNG.");
  const data = charaData.data || charaData;
  return {
    name: data.name || charaData.name || "Unnamed Persona",
    first_mes: data.first_mes || charaData.first_mes || "Hello. How can I help you?",
    behavior: data.description || charaData.description || "",
    icon: data.icon || "\u{1F0CF}"
  };
};
const Header = ({ title, onLoadPersona, isAiReady }) => {
  const fileInputRef = useRef(null);
  const handleLoadClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const persona = await parsePersonaFromPng(file);
        onLoadPersona(persona);
      } catch (error) {
        alert(`Error loading persona: ${error.message}`);
        console.error(error);
      }
    }
    if (e.target) {
      e.target.value = "";
    }
  };
  return /* @__PURE__ */ jsxs("header", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--header-background)", padding: "10px 20px", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center" }, children: [
      /* @__PURE__ */ jsx("h1", { style: { margin: 0, fontSize: "1.2rem" }, children: title }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "ai-status",
          style: { backgroundColor: isAiReady ? "var(--status-ready)" : "var(--status-offline)" },
          title: isAiReady ? "AI is Ready" : `AI is Offline: ${aiInitializationError}`
        }
      )
    ] }),
    /* @__PURE__ */ jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, style: { display: "none" }, accept: ".png" }),
    /* @__PURE__ */ jsx("button", { className: "icon-button", onClick: handleLoadClick, children: "\u30DA\u30EB\u30BD\u30CA\u8AAD\u8FBC" })
  ] });
};
const Message = ({ message }) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "10px", padding: "10px", alignItems: "center" }, children: [
  /* @__PURE__ */ jsx("div", { style: { color: "var(--icon-color)", flexShrink: 0, width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }, children: message.role === "bot" ? /* @__PURE__ */ jsx(BotIcon, { icon: message.icon }) : /* @__PURE__ */ jsx(UserIcon, {}) }),
  /* @__PURE__ */ jsx("p", { style: { margin: 0, whiteSpace: "pre-wrap", lineHeight: "1.5" }, children: message.text })
] });
const ChatWindow = ({ messages, isLoading, persona }) => {
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return /* @__PURE__ */ jsxs("div", { style: { flexGrow: 1, overflowY: "auto", padding: "10px" }, children: [
    messages.map((msg, index) => /* @__PURE__ */ jsx(Message, { message: msg }, index)),
    isLoading && /* @__PURE__ */ jsx(Message, { message: { role: "bot", text: "Thinking...", icon: persona?.icon } }),
    /* @__PURE__ */ jsx("div", { ref: messagesEndRef })
  ] });
};
const ChatInput = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, style: { display: "flex", padding: "10px", borderTop: "1px solid var(--border-color)", gap: "10px" }, children: [
    /* @__PURE__ */ jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), placeholder: "e.g., A red button that says 'Click me'", disabled: isLoading, style: { width: "100%", padding: "10px", backgroundColor: "var(--input-background)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-color)", fontSize: "1rem" } }),
    /* @__PURE__ */ jsx("button", { type: "submit", disabled: isLoading, style: { background: "var(--primary-color)", border: "none", borderRadius: "4px", color: "white", padding: "0 15px", cursor: "pointer" }, children: /* @__PURE__ */ jsx(SendIcon, {}) })
  ] });
};
const CodeEditorPanel = ({ code, setCode }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "panel-header", children: [
      /* @__PURE__ */ jsx("h2", { children: "Code Editor" }),
      /* @__PURE__ */ jsx("button", { onClick: handleCopy, className: "icon-button", title: "Copy code", style: { border: "none", color: "var(--icon-color)" }, children: copied ? "Copied!" : /* @__PURE__ */ jsx(CopyIcon, {}) })
    ] }),
    /* @__PURE__ */ jsx("textarea", { value: code, onChange: (e) => setCode(e.target.value), spellCheck: "false", style: { flexGrow: 1, width: "100%", backgroundColor: "#1e1e1e", color: "#d4d4d4", border: "none", fontFamily: "monospace", fontSize: "14px", padding: "10px", resize: "none", outline: "none" } })
  ] });
};
const PreviewPanel = ({ code }) => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx("div", { className: "panel-header", children: /* @__PURE__ */ jsx("h2", { children: "Live Preview" }) }),
  /* @__PURE__ */ jsx("iframe", { srcDoc: code, title: "Preview", sandbox: "allow-scripts", style: { flexGrow: 1, width: "100%", height: "100%", border: "none", backgroundColor: "white" } })
] });
const Resizer = ({ onMouseDown, orientation = "vertical" }) => /* @__PURE__ */ jsx("div", { className: `resizer ${orientation}`, onMouseDown });
const App = () => {
  const [persona, setPersona] = useState(null);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I am IZAKAYA Builder. Load a persona or tell me what you'd like to create." }
  ]);
  const [code, setCode] = useState('<!-- Your generated code will appear here -->\n\n<div style="display:grid; place-content:center; height:100%; font-family:sans-serif;">\n  <h1>Welcome to IZAKAYA Builder</h1>\n  <p>Load a Persona PNG card or describe what you want to build in the chat.</p>\n</div>');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiReady, setIsAiReady] = useState(!!ai);
  const [leftPanelWidth, setLeftPanelWidth] = useState(35);
  const [topPanelHeight, setTopPanelHeight] = useState(50);
  const isResizingVertical = useRef(false);
  const isResizingHorizontal = useRef(false);
  const handleLoadPersona = useCallback((newPersona) => {
    setPersona(newPersona);
    setMessages([{ role: "bot", text: newPersona.first_mes, icon: newPersona.icon }]);
  }, []);
  const handleSendMessage = async (input) => {
    if (!input.trim() || isLoading) return;
    if (!isAiReady) {
      alert(`AI is not available. Please check your API key. Error: ${aiInitializationError}`);
      return;
    }
    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setIsLoading(true);
    setCode("<!-- Generating code... -->");
    try {
      const result = await generateCode(input, persona);
      setCode(result.code);
      setMessages([...newMessages, { role: "bot", text: result.message, icon: persona?.icon }]);
    } catch (error) {
      console.error("Error generating content:", error);
      const errorMessage = `Sorry, an error occurred: ${error.message || "Unknown error"}`;
      setMessages([...newMessages, { role: "bot", text: errorMessage, icon: persona?.icon }]);
      setCode(`<!-- Error: ${error.message} -->`);
    } finally {
      setIsLoading(false);
    }
  };
  const handleResizeStart = useCallback((setter) => {
    setter.current = true;
  }, []);
  const handleMouseMove = useCallback((e) => {
    if (isResizingVertical.current) {
      const newWidth = e.clientX / window.innerWidth * 100;
      if (newWidth > 20 && newWidth < 80) setLeftPanelWidth(newWidth);
    }
    if (isResizingHorizontal.current) {
      const headerElement = document.querySelector("header");
      const mainContentTop = headerElement ? headerElement.offsetHeight : 50;
      const newHeight = (e.clientY - mainContentTop) / (window.innerHeight - mainContentTop) * 100;
      if (newHeight > 10 && newHeight < 90) setTopPanelHeight(newHeight);
    }
  }, []);
  const handleMouseUp = useCallback(() => {
    isResizingVertical.current = false;
    isResizingHorizontal.current = false;
  }, []);
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(GlobalStyles, {}),
    /* @__PURE__ */ jsxs("div", { className: "app-container", children: [
      /* @__PURE__ */ jsx(Header, { title: persona?.name || "IZAKAYA Builder 3", onLoadPersona: handleLoadPersona, isAiReady }),
      /* @__PURE__ */ jsxs("main", { className: "main-content", children: [
        /* @__PURE__ */ jsxs("div", { className: "panel left-panel", style: { width: `${leftPanelWidth}%` }, children: [
          /* @__PURE__ */ jsx(ChatWindow, { messages, isLoading, persona }),
          /* @__PURE__ */ jsx(ChatInput, { onSendMessage: handleSendMessage, isLoading })
        ] }),
        /* @__PURE__ */ jsx(Resizer, { onMouseDown: () => handleResizeStart(isResizingVertical) }),
        /* @__PURE__ */ jsxs("div", { className: "panel right-panel", style: { width: `calc(${100 - leftPanelWidth}% - 5px)` }, children: [
          /* @__PURE__ */ jsx("div", { className: "sub-panel", style: { height: `${topPanelHeight}%` }, children: /* @__PURE__ */ jsx(CodeEditorPanel, { code, setCode }) }),
          /* @__PURE__ */ jsx(Resizer, { onMouseDown: () => handleResizeStart(isResizingHorizontal), orientation: "horizontal" }),
          /* @__PURE__ */ jsx("div", { className: "sub-panel", style: { height: `calc(${100 - topPanelHeight}% - 5px)` }, children: /* @__PURE__ */ jsx(PreviewPanel, { code }) })
        ] })
      ] })
    ] })
  ] });
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  /* @__PURE__ */ jsx(React.StrictMode, { children: /* @__PURE__ */ jsx(App, {}) })
);
