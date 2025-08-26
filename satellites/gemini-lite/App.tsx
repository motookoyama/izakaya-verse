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

  useEffect(() => {
    if (result && typeof result !== 'string' && result.v2Card) {
      const generateQrCode = async () => {
        try {
          const characterDataString = JSON.stringify(result.v2Card);
          const dataUrl = await QRCode.toDataURL(characterDataString, {
            errorCorrectionLevel: 'M',
            margin: 2,
            color: {
              dark: '#e5e7eb', // Tailwind gray-200 for visibility on dark UI
              light: '#00000000', // Transparent background
            },
          });
          setQrCodeDataUrl(dataUrl);
        } catch (err) {
          console.error('Failed to generate QR code', err);
          setError('Failed to generate character QR code.');
        }
      };
      generateQrCode();
    } else {
      setQrCodeDataUrl(null);
    }
  }, [result]);

  const handlePreview = useCallback(async () => {
    if (!url) {
      setError('Please provide a source URL.');
      return;
    }
    if (!content) {
      const errorMessage =
        mode === CaptureMode.OCRMode ? 'Please provide an image URL.' :
        mode === CaptureMode.VideoCapture ? 'Please enter a question about the video.' :
        mode === CaptureMode.CharacterCard ? 'Please provide your wish/prompt for the character.' :
        'Please provide the content to analyze.';
      setError(errorMessage);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeContent(url, content, mode);
      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [url, content, mode]);
  
  const handleCopy = () => {
      if (!result || typeof result !== 'string') return;
      const fullReport = result + `\n  event_tags: "${tags}"`;
      navigator.clipboard.writeText(fullReport);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadJson = (data: any, fileName: string) => {
    const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeFileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadImage = (base64Data: string, fileName: string) => {
      const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${base64Data}`;
      link.download = `${safeFileName}_card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const modeConfig = {
    [CaptureMode.LightScan]: { label: 'Content from URL', placeholder: 'Paste the text content from the URL here for a quick summary.', inputType: 'textarea'},
    [CaptureMode.DeepScan]: { label: 'Content from URL', placeholder: 'Paste the text content here for a detailed structural analysis.', inputType: 'textarea'},
    [CaptureMode.OCRMode]: { label: 'Image URL', placeholder: 'https://example.com/image.jpg', inputType: 'text'},
    [CaptureMode.VideoCapture]: { label: 'Your Question About The Video', placeholder: 'e.g., What are the key points of this presentation?', inputType: 'textarea'},
    [CaptureMode.CharacterCard]: { label: 'Your Wish / Prompt', placeholder: 'e.g., I want to be friends with a boy who lives in a world like the one in the URL.', inputType: 'textarea'}
  };
  
  const currentModeConfig = modeConfig[mode];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            MetaCapture Satellite
          </h1>
          <p className="mt-2 text-lg text-gray-400">Capture and structure web content with Gemini</p>
        </header>

        <main className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">1. Input Source</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/article" className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"/>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">{currentModeConfig.label}</label>
              {currentModeConfig.inputType === 'textarea' ? (
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={currentModeConfig.placeholder} rows={8} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm"/>
              ) : (
                <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder={currentModeConfig.placeholder} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"/>
              )}
            </div>
            {mode === CaptureMode.OCRMode && content && (
                 <div className="mt-4 p-2 border border-gray-700 rounded-lg bg-gray-900 max-w-sm mx-auto">
                    <p className="text-xs text-center text-gray-500 mb-2">Image Preview</p>
                    <img src={content} alt="Preview" className="rounded-md max-h-48 w-auto mx-auto" onError={(e) => e.currentTarget.style.display='none'} onLoad={(e) => e.currentTarget.style.display='block'} />
                 </div>
            )}
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">2. Processing Engine</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {Object.values(CaptureMode).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={`p-4 rounded-lg text-left transition-all duration-200 ${mode === m ? 'bg-indigo-600 shadow-lg ring-2 ring-indigo-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
                  <span className="font-bold text-lg">{m}</span>
                  <p className="text-sm text-gray-300">
                    {m === CaptureMode.LightScan && 'Quick summary'}
                    {m === CaptureMode.DeepScan && 'Detailed analysis'}
                    {m === CaptureMode.OCRMode && 'Text from images'}
                    {m === CaptureMode.VideoCapture && 'Analyze video'}
                    {m === CaptureMode.CharacterCard && 'Generate V2 Card'}
                  </p>
                </button>
              ))}
            </div>
            <button onClick={handlePreview} disabled={isLoading} className="relative mt-6 w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                 <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{mode === CaptureMode.VideoCapture ? 'Analyzing Video...' : mode === CaptureMode.CharacterCard ? 'Generating Card...' : 'Processing...'}</span>
                    {mode === CaptureMode.VideoCapture && <p className="text-xs text-gray-400 w-full text-center absolute -bottom-6 left-0">This can take a minute.</p>}
                </>
              ) : (
                mode === CaptureMode.VideoCapture ? 'Analyze Video' : mode === CaptureMode.CharacterCard ? 'Generate Card' : 'Generate Preview'
              )}
            </button>
          </div>

           {(result || isLoading || error) && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-100">3. Output Preview</h2>
              {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-md">{error}</div>}
              {result && (typeof result === 'string' ? (
                <div className="space-y-4">
                  <div className="relative">
                    <pre className="bg-gray-900 text-sm p-4 rounded-md overflow-x-auto border border-gray-700"><code className="font-mono text-cyan-300">{result}</code></pre>
                     <button onClick={handleCopy} className="absolute top-2 right-2 p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                        {isCopied ? <CheckIcon className="text-green-400" /> : <ClipboardIcon />}
                    </button>
                  </div>
                   <div className="flex flex-col sm:flex-row gap-4">
                        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Add event tags, e.g., #Research" className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors">
                            <SendIcon />
                            <span>Send to Mothership</span>
                        </button>
                   </div>
                </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="md:col-span-2 flex flex-col items-center gap-4">
                        <img src={`data:image/png;base64,${result.imageBase64}`} alt={result.v2Card.name} className="rounded-lg shadow-lg border-2 border-gray-700 w-full max-w-sm"/>
                        {qrCodeDataUrl && (
                          <div className="w-full max-w-sm p-4 bg-gray-900 border border-gray-700 rounded-lg text-center">
                            <h3 className="text-lg font-semibold mb-2 text-gray-200">Character QR Code</h3>
                            <p className="text-sm text-gray-400 mb-4">Scan to import into compatible apps.</p>
                            <div className="p-2 bg-gray-200 rounded-md inline-block">
                              <img src={qrCodeDataUrl} alt="Character QR Code" className="w-48 h-48" />
                            </div>
                          </div>
                        )}
                    </div>
                    <div className="md:col-span-3 space-y-4">
                        <pre className="bg-gray-900 text-sm p-4 rounded-md overflow-x-auto border border-gray-700 h-full max-h-[28rem]"><code className="font-mono text-cyan-300">{JSON.stringify(result.v2Card, null, 2)}</code></pre>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <button onClick={() => downloadImage(result.imageBase64, result.v2Card.name)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors">
                                <DownloadIcon />
                                <span>Download PNG</span>
                           </button>
                           <button onClick={() => downloadJson(result.v2Card, result.v2Card.name)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors">
                                <DownloadIcon />
                                <span>Download JSON</span>
                           </button>
                        </div>
                    </div>
                 </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;