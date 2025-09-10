import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from '@google/genai';

// Declare pako to resolve 'Cannot find name' error. It's expected to be in the global scope.
declare var pako: any;

// Define types for message and persona objects to resolve TypeScript errors.
interface MessageType {
  role: 'user' | 'bot';
  text: string;
  icon?: string;
}

interface PersonaType {
  name: string;
  first_mes: string;
  behavior: string;
  icon: string;
}

// --- STYLES ---
const GlobalStyles = () => (
  <style>{`
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
  `}</style>
);

// --- ICONS ---
const BotIcon = ({ icon }: { icon?: string }) => icon ? <span className="persona-icon">{icon}</span> : (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 12.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 8c-2.21 0-4 1.79-4 4h8c0-2.21-1.79-4-4-4z" fill="currentColor"/></svg>);
const UserIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>);
const SendIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/></svg>);
const CopyIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/></svg>);

// --- AI & PERSONA SERVICES ---
let ai: GoogleGenAI | null = null;
let aiInitializationError: string | null = null;
try {
  // This approach assumes the API_KEY is set in a secure, pre-configured environment.
  const apiKey = (typeof process !== 'undefined' && process.env.API_KEY) ? process.env.API_KEY : null;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    aiInitializationError = "API_KEY not found.";
  }
} catch (error) {
  aiInitializationError = (error as Error).message;
  console.error("Failed to initialize GoogleGenAI", error);
}

const generateCode = async (userInput: string, persona: PersonaType | null) => {
    if (!ai) throw new Error(`AI client not initialized. ${aiInitializationError || 'Is the API_KEY configured correctly?'}`);

    const personaBehavior = persona?.behavior ? `\n\nFollow these instructions for your persona:\n${persona.behavior}` : '';
    const systemInstruction = `You are an expert web developer.${personaBehavior} Given a prompt, you must generate the HTML, CSS, and JavaScript code to achieve the desired result. The code should be self-contained in a single HTML file. The CSS should be inside a <style> tag. The JavaScript should be inside a <script> tag. Wrap the final HTML code in a single markdown code block (\`\`\`html). Do not include any other explanations or text outside of the code block.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemInstruction}\n\nUser prompt: "${userInput}"`,
    });

    const botResponse = response.text;
    const codeBlockRegex = /```html\n([\s\S]*?)\n```/;
    const match = botResponse.match(codeBlockRegex);

    if (match && match[1]) {
        return { code: match[1], message: "Here is the code based on your request. I've updated the editor and preview." };
    } else {
        return { code: `<!-- Code generation failed. Raw response:\n${botResponse}\n-->`, message: botResponse };
    }
};

const parsePersonaFromPng = async (file: File): Promise<PersonaType> => {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);
    if (view.getUint32(0) !== 0x89504E47) {
        throw new Error("Not a valid PNG file.");
    }
    let offset = 8;
    let charaData = null;

    while (offset < buffer.byteLength) {
        const length = view.getUint32(offset);
        const type = String.fromCharCode(view.getUint8(offset + 4), view.getUint8(offset + 5), view.getUint8(offset + 6), view.getUint8(offset + 7));
        
        if (type === 'tEXt' || type === 'iTXt' || type === 'zTXt') {
            const chunkData = new Uint8Array(buffer, offset + 8, length);
            let keywordEnd = chunkData.indexOf(0);
            const keyword = new TextDecoder().decode(chunkData.slice(0, keywordEnd));

            if (keyword === 'chara') {
                let text;
                if (type === 'zTXt') {
                    // compressed, skip method byte
                    text = pako.inflate(chunkData.slice(keywordEnd + 2), { to: 'string' });
                } else if (type === 'iTXt') {
                    const compressed = chunkData[keywordEnd + 2] === 1;
                    const sliceStart = keywordEnd + 5;
                     if(compressed) {
                         text = pako.inflate(chunkData.slice(sliceStart), { to: 'string' });
                     } else {
                         text = new TextDecoder().decode(chunkData.slice(sliceStart));
                     }
                } else { // tEXt
                    text = new TextDecoder().decode(chunkData.slice(keywordEnd + 1));
                }
                charaData = JSON.parse(text);
            }
        }
        offset += 12 + length;
    }

    if (!charaData) throw new Error("No 'chara' data found in PNG.");

    // Normalize data based on spec
    const data = charaData.data || charaData;
    return {
        name: data.name || charaData.name || "Unnamed Persona",
        first_mes: data.first_mes || charaData.first_mes || "Hello. How can I help you?",
        behavior: data.description || charaData.description || "",
        icon: data.icon || "🃏",
    };
};


// --- COMPONENTS ---
const Header = ({ title, onLoadPersona, isAiReady }: { title: string; onLoadPersona: (persona: PersonaType) => void; isAiReady: boolean }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleLoadClick = () => fileInputRef.current?.click();
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const persona = await parsePersonaFromPng(file);
                onLoadPersona(persona);
            } catch (error) {
                alert(`Error loading persona: ${(error as Error).message}`);
                console.error(error);
            }
        }
        if (e.target) {
            e.target.value = ''; // Reset input
        }
    };
    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--header-background)', padding: '10px 20px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '1.2rem' }}>{title}</h1>
                <div 
                    className="ai-status"
                    style={{ backgroundColor: isAiReady ? 'var(--status-ready)' : 'var(--status-offline)' }}
                    title={isAiReady ? 'AI is Ready' : `AI is Offline: ${aiInitializationError}`}>
                </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".png" />
            <button className="icon-button" onClick={handleLoadClick}>ペルソナ読込</button>
        </header>
    );
};

const Message = ({ message }: { message: MessageType }) => (
  <div style={{ display: 'flex', gap: '10px', padding: '10px', alignItems: 'center' }}>
    <div style={{ color: 'var(--icon-color)', flexShrink: 0, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {message.role === 'bot' ? <BotIcon icon={message.icon} /> : <UserIcon />}
    </div>
    <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{message.text}</p>
  </div>
);

const ChatWindow = ({ messages, isLoading, persona }: { messages: MessageType[]; isLoading: boolean; persona: PersonaType | null }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
      {messages.map((msg, index) => <Message key={index} message={msg} />)}
      {isLoading && <Message message={{ role: 'bot', text: 'Thinking...', icon: persona?.icon }} />}
      <div ref={messagesEndRef} />
    </div>
  );
};

const ChatInput = ({ onSendMessage, isLoading }: { onSendMessage: (message: string) => void; isLoading: boolean }) => {
  const [input, setInput] = useState('');
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '10px', borderTop: '1px solid var(--border-color)', gap: '10px' }}>
      <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g., A red button that says 'Click me'" disabled={isLoading} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--input-background)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-color)', fontSize: '1rem' }} />
      <button type="submit" disabled={isLoading} style={{ background: 'var(--primary-color)', border: 'none', borderRadius: '4px', color: 'white', padding: '0 15px', cursor: 'pointer' }}><SendIcon /></button>
    </form>
  );
};

const CodeEditorPanel = ({ code, setCode }: { code: string; setCode: (code: string) => void }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <>
      <div className="panel-header">
        <h2>Code Editor</h2>
        <button onClick={handleCopy} className="icon-button" title="Copy code" style={{ border: 'none', color: 'var(--icon-color)' }}>
          {copied ? 'Copied!' : <CopyIcon />}
        </button>
      </div>
      <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck="false" style={{ flexGrow: 1, width: '100%', backgroundColor: '#1e1e1e', color: '#d4d4d4', border: 'none', fontFamily: 'monospace', fontSize: '14px', padding: '10px', resize: 'none', outline: 'none' }} />
    </>
  );
};

const PreviewPanel = ({ code }: { code: string }) => (
  <>
    <div className="panel-header"><h2>Live Preview</h2></div>
    <iframe srcDoc={code} title="Preview" sandbox="allow-scripts" style={{ flexGrow: 1, width: '100%', height: '100%', border: 'none', backgroundColor: 'white' }} />
  </>
);

const Resizer = ({ onMouseDown, orientation = 'vertical' }: { onMouseDown: (e: React.MouseEvent) => void; orientation?: 'vertical' | 'horizontal' }) => <div className={`resizer ${orientation}`} onMouseDown={onMouseDown} />;

// --- MAIN APP ---
const App = () => {
    const [persona, setPersona] = useState<PersonaType | null>(null);
    const [messages, setMessages] = useState<MessageType[]>([
        { role: 'bot', text: "Hello! I am IZAKAYA Builder. Load a persona or tell me what you'd like to create." }
    ]);
    const [code, setCode] = useState('<!-- Your generated code will appear here -->\n\n<div style="display:grid; place-content:center; height:100%; font-family:sans-serif;">\n  <h1>Welcome to IZAKAYA Builder</h1>\n  <p>Load a Persona PNG card or describe what you want to build in the chat.</p>\n</div>');
    const [isLoading, setIsLoading] = useState(false);
    const [isAiReady, setIsAiReady] = useState(!!ai);
    
    const [leftPanelWidth, setLeftPanelWidth] = useState(35);
    const [topPanelHeight, setTopPanelHeight] = useState(50);
    const isResizingVertical = useRef(false);
    const isResizingHorizontal = useRef(false);

    const handleLoadPersona = useCallback((newPersona: PersonaType) => {
        setPersona(newPersona);
        setMessages([{ role: 'bot', text: newPersona.first_mes, icon: newPersona.icon }]);
    }, []);

    const handleSendMessage = async (input: string) => {
        if (!input.trim() || isLoading) return;
        
        if (!isAiReady) {
            alert(`AI is not available. Please check your API key. Error: ${aiInitializationError}`);
            return;
        }

        const newMessages: MessageType[] = [...messages, { role: 'user', text: input }];
        setMessages(newMessages);
        setIsLoading(true);
        setCode('<!-- Generating code... -->');

        try {
            const result = await generateCode(input, persona);
            setCode(result.code);
            setMessages([...newMessages, { role: 'bot', text: result.message, icon: persona?.icon }]);
        } catch (error) {
            console.error('Error generating content:', error);
            const errorMessage = `Sorry, an error occurred: ${(error as Error).message || 'Unknown error'}`;
            setMessages([...newMessages, { role: 'bot', text: errorMessage, icon: persona?.icon }]);
            setCode(`<!-- Error: ${(error as Error).message} -->`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResizeStart = useCallback((setter: React.MutableRefObject<boolean>) => { setter.current = true; }, []);
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizingVertical.current) {
            const newWidth = (e.clientX / window.innerWidth) * 100;
            if (newWidth > 20 && newWidth < 80) setLeftPanelWidth(newWidth);
        }
        if (isResizingHorizontal.current) {
            const headerElement = document.querySelector('header');
            const mainContentTop = headerElement ? headerElement.offsetHeight : 50;
            const newHeight = ((e.clientY - mainContentTop) / (window.innerHeight - mainContentTop)) * 100;
            if (newHeight > 10 && newHeight < 90) setTopPanelHeight(newHeight);
        }
    }, []);
    const handleMouseUp = useCallback(() => {
        isResizingVertical.current = false;
        isResizingHorizontal.current = false;
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <>
            <GlobalStyles />
            <div className="app-container">
                <Header title={persona?.name || 'IZAKAYA Builder 3'} onLoadPersona={handleLoadPersona} isAiReady={isAiReady} />
                <main className="main-content">
                    <div className="panel left-panel" style={{ width: `${leftPanelWidth}%` }}>
                        <ChatWindow messages={messages} isLoading={isLoading} persona={persona} />
                        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                    </div>
                    <Resizer onMouseDown={() => handleResizeStart(isResizingVertical)} />
                    <div className="panel right-panel" style={{ width: `calc(${100 - leftPanelWidth}% - 5px)` }}>
                        <div className="sub-panel" style={{ height: `${topPanelHeight}%` }}>
                           <CodeEditorPanel code={code} setCode={setCode} />
                        </div>
                        <Resizer onMouseDown={() => handleResizeStart(isResizingHorizontal)} orientation="horizontal" />
                        <div className="sub-panel" style={{ height: `calc(${100 - topPanelHeight}% - 5px)` }}>
                            <PreviewPanel code={code} />
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

// --- RENDER ---
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
