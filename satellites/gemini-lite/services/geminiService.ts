import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { CaptureMode } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getBase64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("CORS or network error fetching image:", error);
        throw new Error("Could not fetch image. The server may be blocking requests (CORS issue). Try a different image URL.");
    }
};

const formatToYaml = (data: any): string => {
    const { source_url, capture_mode, timestamp, structured_data } = data;
    let yamlString = `MetaCapture:\n`;
    yamlString += `  source_url: ${source_url}\n`;
    yamlString += `  capture_mode: ${capture_mode}\n`;
    yamlString += `  timestamp: ${timestamp}\n`;

    const extractedText = structured_data.extracted_text || structured_data.summary;
    const formattedText = typeof extractedText === 'string' 
        ? `"${extractedText.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
        : Array.isArray(extractedText) 
        ? extractedText.map(line => `    - "${line.replace(/"/g, '\\"')}"`).join('\n') 
        : '""';

    yamlString += `  extracted_text: ${formattedText}\n`;
    yamlString += `  structured_data:\n`;
    yamlString += `    title: "${structured_data.title || 'N/A'}"\n`;
    yamlString += `    headings:\n${(structured_data.headings || []).map((h: string) => `      - "${h.replace(/"/g, '\\"')}"`).join('\n') || '      []'}\n`;
    yamlString += `    tables:\n${(structured_data.tables || []).map((t: string) => `      - "${t.replace(/"/g, '\\"')}"`).join('\n') || '      []'}\n`;
    yamlString += `    metadata: {}\n`; // Simplified as per spec example
    return yamlString;
};

export const analyzeContent = async (url: string, content: string, mode: CaptureMode): Promise<string | { v2Card: any; imageBase64: string }> => {
    let response: GenerateContentResponse;

    const commonSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The main title of the content." },
            summary: { type: Type.STRING, description: "A concise summary of the content." },
            headings: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of main headings found." },
            tables: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of tables found, summarized as strings." },
        },
    };
    
    if (mode === 'CharacterCard') {
        // Step 1: Generate character concept based on URL and user wish using a two-call process.
        
        // 1a. Grounded analysis to get a text description of a character.
        const creationPrompt = `Thoroughly analyze the content, themes, and atmosphere of the provided URL: ${url}. 
        Based on this analysis and the user's request: "${content}", create a detailed text description for a new character who would fit into that world. 
        Describe their appearance in detail for image generation, their personality, their background, and a characteristic first message they might say.`;

        const groundedResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: creationPrompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        const characterDescriptionText = groundedResponse.text;
        
        // 1b. Structure the text description into JSON.
        const characterSchema = {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The character's name." },
                description: { type: Type.STRING, description: "A visually rich description of the character's appearance, clothing, and aura, suitable for generating an image." },
                personality: { type: Type.STRING, description: "A summary of the character's personality traits." },
                first_mes: { type: Type.STRING, description: "A characteristic first line of dialogue for the character." },
            },
            required: ["name", "description", "personality", "first_mes"]
        };

        const structuringPrompt = `You are a data structuring expert. From the following character description, extract the key information and format it as JSON according to the provided schema. 
        The 'description' field must be visually rich and focus on appearance for image generation.
        
        Character Description:
        ---
        ${characterDescriptionText}
        ---`;

        const structuringResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: structuringPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: characterSchema,
            },
        });
        
        const characterData = JSON.parse(structuringResponse.text);

        // Step 2: Generate image from the structured character data.
        const imagePrompt = `High-quality anime portrait of a character named ${characterData.name}. ${characterData.description}. Fantastical, detailed, character concept art.`;

        const imageResponse = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: imagePrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '3:4',
            },
        });

        if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
            throw new Error("Image generation failed.");
        }
        const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;

        return {
            v2Card: characterData,
            imageBase64: base64ImageBytes,
        };

    }

    if (mode === 'LightScan' || mode === 'DeepScan') {
        const prompt = `You are a web content analysis expert. Analyze the following text extracted from the URL: ${url}.
        Mode: ${mode}. ${mode === 'LightScan' ? 'Provide a brief overview.' : 'Provide a detailed, structured analysis.'}
        
        Content:
        ---
        ${content}
        ---
        
        Extract the title, a summary, key headings, and any tables. Respond in the requested JSON format.`;

        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: commonSchema,
            },
        });

    } else if (mode === 'OCRMode') {
        const imageBase64 = await getBase64(content);
        const imagePart = { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } };
        const promptPart = {
            text: `Perform OCR on this image from the URL ${url}. Extract all text. Also, describe the image content, including any charts or visual elements. Structure your response in the requested JSON format, placing all transcribed text in the 'extracted_text' field and a description in the 'summary' field.`
        };
        
        const ocrSchema = {
             type: Type.OBJECT,
            properties: {
                extracted_text: { type: Type.STRING, description: "All text transcribed from the image using OCR." },
                summary: { type: Type.STRING, description: "A description of the image's visual content." },
                title: { type: Type.STRING, description: "A suitable title for the image content." },
            },
        };

        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [promptPart, imagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: ocrSchema,
            },
        });
    } else if (mode === 'VideoCapture') {
        const groundedPrompt = `Please analyze the video from the URL: ${url}. The user is asking the following question: "${content}". 
        Provide a detailed text description of the video's content that answers the user's question. Cover the main topics, speakers, and key takeaways.`;

        const groundedResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: groundedPrompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const videoDescription = groundedResponse.text;

        const structuringPrompt = `You are a web content analysis expert. Analyze the following text, which is a summary of a video. 
        Extract the title, a summary, and key headings. Respond in the requested JSON format.
        
        Video Summary Text:
        ---
        ${videoDescription}
        ---`;

        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: structuringPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: commonSchema,
            },
        });
    } else {
        throw new Error("Invalid capture mode specified.");
    }
    
    const structuredData = JSON.parse(response.text);
    const finalResult = {
        source_url: url,
        capture_mode: mode,
        timestamp: new Date().toISOString(),
        structured_data: structuredData,
    };

    return formatToYaml(finalResult);
};