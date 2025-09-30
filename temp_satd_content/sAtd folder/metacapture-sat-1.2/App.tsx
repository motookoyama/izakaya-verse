import React, { useState, useCallback, useEffect } from 'react';
import QRCode from 'qrcode';
import { CaptureMode } from './types';
import { analyzeContent } from './services/geminiService';
import { ClipboardIcon, CheckIcon, SendIcon, DownloadIcon } from './components/icons';

type V2CardResult = {
  v2Card: any;
  imageBase64: string;
};

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [mode, setMode] = useState<CaptureMode>(CaptureMode.LightScan);
  const [result, setResult] = useState<string | V2CardResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [minifiedJson, setMinifiedJson] = useState<string>('');
  const [jsonByteSize, setJsonByteSize] = useState<number>(0);
  const [isJsonCopied, setIsJsonCopied] = useState<boolean>(false);

  const createSlug = (name: string): string => {
    if (!name) return 'character';
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const createQrPayload = useCallback((v2Card: any): string => {
    const MAX_QR_BYTES = 2953; // Conservative limit for QR Code Version 40, Error Correction M
    const orderedKeys = ['name', 'description', 'personality', 'first_mes', 'system_prompt', 'scenario', 'creator_notes'];
    const optionalKeys = ['creator_notes', 'scenario', 'system_prompt']; // Drop in reverse order of importance

    let payloadData = { ...v2Card };

    const getMinifiedJson = (obj: any): string => {
        const orderedObj: Record<string, any> = {};
        orderedKeys.forEach(key => {
            if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
                orderedObj[key] = obj[key];
            }
        });
        return JSON.stringify(orderedObj);
    };

    let jsonString = getMinifiedJson(payloadData);
    let byteLength = new Blob([jsonString]).size;

    // 1. Drop optional fields if too large
    for (const key of optionalKeys) {
        if (byteLength > MAX_QR_BYTES && payloadData[key]) {
            delete payloadData[key];
            jsonString = getMinifiedJson(payloadData);
            byteLength = new Blob([jsonString]).size;
        }
    }

    // 2. Shorten mandatory fields if still too large
    const mandatoryToShorten = ['description', 'personality', 'first_mes'];
    while (byteLength > MAX_QR_BYTES) {
        let shortenedSomething = false;
        for (const key of mandatoryToShorten) {
            if (payloadData[key] && payloadData[key].length > 10) { // only shorten if reasonably long
                const originalLength = payloadData[key].length;
                payloadData[key] = payloadData[key].substring(0, Math.floor(originalLength * 0.9));
                shortenedSomething = true;
                break; // Shorten one field at a time and re-evaluate
            }
        }
        jsonString = getMinifiedJson(payloadData);
        byteLength = new Blob([jsonString]).size;

        // Failsafe to prevent infinite loop if no fields can be shortened
        if (!shortenedSomething) {
            console.warn("QR payload is too large and cannot be shortened further.");
            break;
        }
    }
    
    return jsonString;
  }, []);

  useEffect(() => {
    if (result && typeof result !== 'string' && result.v2Card) {
      // Validation as per spec
      const mandatoryKeys = ['name', 'description', 'personality', 'first_mes'];
      const missingKeys = mandatoryKeys.filter(key => !result.v2Card[key] || result.v2Card[key] === '');
      
      if (missingKeys.length > 0) {
        setError(`QR Generation Failed: The following mandatory keys are missing or empty: ${missingKeys.join(', ')}.`);
        setQrCodeDataUrl(null);
        setMinifiedJson('');
        setJsonByteSize(0);
        return;
      }
      
      setError(null); // Clear previous errors if validation passes
      const jsonPayload = createQrPayload(result.v2Card);
      setMinifiedJson(jsonPayload);
      setJsonByteSize(new Blob([jsonPayload]).size);

      QRCode.toDataURL(jsonPayload, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 512,
        color: {
          dark: '#111111',
          light: '#FFFFFF',
        }
      })
      .then(url => {
        setQrCodeDataUrl(url);
      })
      .catch(err => {
        console.error('QR code generation failed:', err);
        setError('Failed to generate QR code. The payload might be too large.');
      });
    } else {
      setQrCodeDataUrl(null);
      setMinifiedJson('');
      setJsonByteSize(0);
    }
  }, [result, createQrPayload]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url && ![CaptureMode.CharacterCard, CaptureMode.OCRMode].includes(mode)) {
      setError('Please enter a URL.');
      return;
    }
    if (!content && [CaptureMode.CharacterCard, CaptureMode.OCRMode, CaptureMode.VideoCapture].includes(mode)) {
       const promptText = mode === CaptureMode.CharacterCard ? 'character wish' : mode === CaptureMode.OCRMode ? 'image URL' : 'question';
      setError(`Please enter a ${promptText}.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsCopied(false);
    setIsJsonCopied(false);

    try {
      const analysisResult = await analyzeContent(url, content, mode);
      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (typeof result === 'string') {
      navigator.clipboard.writeText(result);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleJsonCopyToClipboard = () => {
    if (minifiedJson) {
      navigator.clipboard.writeText(minifiedJson);
      setIsJsonCopied(true);
      setTimeout(() => setIsJsonCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (typeof result === 'string') {
      const blob = new Blob([result], { type: 'text/yaml;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'metacapture_report.yaml';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleJsonDownload = () => {
    if (minifiedJson && result && typeof result !== 'string' && result.v2Card?.name) {
      const slug = createSlug(result.v2Card.name);
      const blob = new Blob([minifiedJson], { type: 'application/json;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${slug}_v2.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleQrDownload = () => {
    if (qrCodeDataUrl && result && typeof result !== 'string' && result.v2Card?.name) {
      const slug = createSlug(result.v2Card.name);
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = `${slug}_qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCardImageDownload = () => {
    if (result && typeof result !== 'string' && result.imageBase64 && result.v2Card?.name) {
      const slug = createSlug(result.v2Card.name);
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${result.imageBase64}`;
      link.download = `${slug}_card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderInputField = () => {
    switch(mode) {
      case CaptureMode.CharacterCard:
        return (
          <>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Inspiration URL (optional, e.g., world, theme)"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              aria-label="Inspiration URL"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your character wish..."
              className="w-full p-3 mt-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none h-24"
              aria-label="Character Wish"
            />
          </>
        );
      case CaptureMode.OCRMode:
        return (
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter image URL for OCR"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            aria-label="Image URL for OCR"
          />
        );
      case CaptureMode.VideoCapture:
          return (
            <>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter YouTube or other video URL"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                aria-label="Video URL"
              />
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What do you want to know about the video?"
                className="w-full p-3 mt-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                aria-label="Question about the video"
              />
            </>
          );
      default:
        return (
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to analyze..."
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            aria-label="URL to analyze"
          />
        );
    }
  };

  const modes = [
    { id: CaptureMode.LightScan, label: 'Light Scan' },
    { id: CaptureMode.DeepScan, label: 'Deep Scan' },
    { id: CaptureMode.OCRMode, label: 'OCR Mode' },
    { id: CaptureMode.VideoCapture, label: 'Video Capture' },
    { id: CaptureMode.CharacterCard, label: 'Character Card' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            MetaCapture Satellite
          </h1>
          <p className="mt-2 text-gray-400">Your AI-powered content analysis and creation tool.</p>
        </header>

        <main className="bg-gray-800 rounded-xl shadow-2xl p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Capture Mode</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 ${
                      mode === m.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {renderInputField()}
            </div>
            
            <div className="mt-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-wait"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <SendIcon />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {result && typeof result === 'string' && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-inner">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-indigo-400">Analysis Result</h2>
                <div>
                  <button
                    onClick={handleCopyToClipboard}
                    className="mr-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    aria-label="Copy to clipboard"
                  >
                    {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    aria-label="Download as YAML"
                  >
                    <DownloadIcon />
                  </button>
                </div>
              </div>
              <pre className="bg-gray-900 rounded-md p-4 font-mono text-sm text-gray-300 overflow-auto max-h-96">
                <code>{result}</code>
              </pre>
            </div>
          )}

          {result && typeof result !== 'string' && result.v2Card && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-inner">
              <h2 className="text-2xl font-bold mb-4 text-indigo-400">Character Card Result</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Character Image */}
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-semibold mb-2 text-gray-300">Portrait</h3>
                  {result.imageBase64 ? (
                    <img 
                      src={`data:image/png;base64,${result.imageBase64}`} 
                      alt={result.v2Card.name || 'Generated Character'} 
                      className="rounded-lg shadow-lg w-full object-cover aspect-[3/4]" 
                      aria-labelledby="character-name"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                      Image not available
                    </div>
                  )}
                  <h4 id="character-name" className="text-xl font-bold mt-3 text-white">{result.v2Card.name}</h4>
                  <p className="text-sm text-gray-400 text-center mt-1">{result.v2Card.description}</p>
                  <button
                      onClick={handleCardImageDownload}
                      className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                      <DownloadIcon />
                      Download Card PNG
                  </button>
                </div>

                {/* Column 2: JSON Data */}
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold mb-2 text-gray-300">V2 Character JSON</h3>
                  <div className="relative flex-grow bg-gray-900 rounded-md p-3 font-mono text-sm text-gray-300 overflow-auto h-64 md:h-auto min-h-[200px]">
                    <pre className="whitespace-pre-wrap break-all">{minifiedJson}</pre>
                    <button
                      onClick={handleJsonCopyToClipboard}
                      className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-gray-300"
                      aria-label="Copy JSON to clipboard"
                    >
                      {isJsonCopied ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-right">JSON bytes: {jsonByteSize}</div>
                  <button
                    onClick={handleJsonDownload}
                    className="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                      <DownloadIcon />
                      Download JSON
                  </button>
                </div>
                
                {/* Column 3: QR Code */}
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-semibold mb-2 text-gray-300">QR Code</h3>
                  <div className="bg-white p-2 rounded-lg shadow-lg">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="Character QR Code" className="w-full max-w-[200px] aspect-square" />
                    ) : (
                      <div className="w-full max-w-[200px] aspect-square bg-gray-700 rounded flex items-center justify-center text-gray-400 p-4 text-center">
                        {error && !minifiedJson ? "QR Gen Failed" : "Generating QR..."}
                      </div>
                    )}
                  </div>
                  <button
                      onClick={handleQrDownload}
                      className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
                      disabled={!qrCodeDataUrl}
                  >
                      <DownloadIcon />
                      Download QR
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>

        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Google Gemini. UI Version 2.2</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
