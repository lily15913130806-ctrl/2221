import React, { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Loader2, Save, Sparkles, Trash2, X } from "lucide-react";
import { recognizeMistake, generateSimilarProblems } from "../services/geminiService";
import { OCRResult, GeneratedProblem } from "../types";
import ProblemCard from "./ProblemCard";
import { cn } from "../lib/utils";

interface RecognitionPageProps {
  onSave: (record: {
    originalQuestion: string;
    originalAnswer: string;
    originalExplanation: string;
    knowledgePoint: string;
    generatedProblems: GeneratedProblem[];
    imageUrl?: string;
  }) => Promise<void>;
}

export default function RecognitionPage({ onSave }: RecognitionPageProps) {
  const [image, setImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [generatedProblems, setGeneratedProblems] = useState<GeneratedProblem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setImage(base64);
        setOcrResult(null);
        setGeneratedProblems([]);
        await processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string) => {
    setLoading(true);
    try {
      const result = await recognizeMistake(base64);
      setOcrResult(result);
    } catch (error) {
      console.error("OCR Error:", error);
      alert("识别失败，请重试或手动输入。");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!ocrResult) return;
    setGenerating(true);
    try {
      const problems = await generateSimilarProblems(ocrResult.question, ocrResult.knowledgePoint);
      setGeneratedProblems(problems);
    } catch (error) {
      console.error("Generation Error:", error);
      alert("生成失败，请重试。");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!ocrResult || generatedProblems.length === 0) return;
    setSaving(true);
    try {
      await onSave({
        originalQuestion: ocrResult.question,
        originalAnswer: ocrResult.standardAnswer || "",
        originalExplanation: ocrResult.explanation || "",
        knowledgePoint: ocrResult.knowledgePoint,
        generatedProblems,
        imageUrl: image || undefined,
      });
      alert("保存成功！");
      // Reset
      setImage(null);
      setOcrResult(null);
      setGeneratedProblems([]);
    } catch (error) {
      console.error("Save Error:", error);
      alert("保存失败，请重试。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 flex flex-col items-center justify-center text-center space-y-4 transition-all hover:border-blue-400 hover:bg-blue-50/30">
        {image ? (
          <div className="relative w-full max-w-md">
            <img src={image} alt="Uploaded" className="rounded-xl shadow-lg w-full object-contain max-h-64" />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">上传错题图片</p>
              <p className="text-sm text-gray-500">支持拍照或从相册选择</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
            >
              选择图片
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600 font-medium">正在智能识别题目内容...</p>
        </div>
      )}

      {ocrResult && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                识别结果
              </h2>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {ocrResult.knowledgePoint}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">题目内容</label>
                <textarea
                  value={ocrResult.question}
                  onChange={(e) => setOcrResult({ ...ocrResult, question: e.target.value })}
                  placeholder="未识别到题目内容，请手动输入..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">标准答案</label>
                  <input
                    type="text"
                    value={ocrResult.standardAnswer || ""}
                    onChange={(e) => setOcrResult({ ...ocrResult, standardAnswer: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">知识点</label>
                  <input
                    type="text"
                    value={ocrResult.knowledgePoint}
                    onChange={(e) => setOcrResult({ ...ocrResult, knowledgePoint: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {generating ? "正在生成举一反三..." : "生成举一反三"}
              </button>
              <button
                onClick={() => {
                  setOcrResult(null);
                  setImage(null);
                }}
                className="bg-gray-100 text-gray-600 p-3 rounded-xl hover:bg-gray-200 transition-all"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {generatedProblems.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              举一反三推荐
            </h2>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              重新生成
            </button>
          </div>

          <div className="space-y-4">
            {generatedProblems.map((problem, idx) => (
              <ProblemCard key={idx} problem={problem} index={idx} />
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-green-600 text-white px-6 py-4 rounded-2xl font-bold shadow-xl hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            {saving ? "正在保存到错题本..." : "保存到错题本"}
          </button>
        </div>
      )}
    </div>
  );
}
