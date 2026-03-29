import { GoogleGenAI, Type } from "@google/genai";
import { OCRResult, GeneratedProblem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function recognizeMistake(base64Image: string): Promise<OCRResult> {
  const model = "gemini-3-flash-preview";
  const prompt = `
    你是一个专业的全科题目识别助手。请识别图片中的错题内容，并提取以下信息：
    1. 题目文本 (question)
    2. 选项 (options, 如果有)
    3. 标准答案 (standardAnswer, 如果有)
    4. 题目解析 (explanation, 如果有)
    5. 核心知识点 (knowledgePoint, 如“一元二次方程根的判别式”、“现在完成时态”等)

    请以 JSON 格式返回。
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          standardAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING },
          knowledgePoint: { type: Type.STRING },
        },
        required: ["question", "knowledgePoint"],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function generateSimilarProblems(
  question: string,
  knowledgePoint: string
): Promise<GeneratedProblem[]> {
  const model = "gemini-3-flash-preview";
  const prompt = `
    基于以下错题和知识点，生成 3 道“举一反三”的相似题目。
    
    原题：${question}
    知识点：${knowledgePoint}

    要求：
    1. 覆盖同一知识点的不同角度或变换形式。
    2. 难度与原题相当。
    3. 每道题必须附带正确答案、解析以及“易错点分析”。
    
    请以 JSON 数组格式返回。
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            commonMistakes: { type: Type.STRING, description: "本题常见错误分析" },
          },
          required: ["question", "answer", "explanation", "commonMistakes"],
        },
      },
    },
  });

  return JSON.parse(response.text);
}
