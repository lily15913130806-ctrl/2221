import React, { useState } from "react";
import { MistakeRecord } from "../types";
import { BookOpen, Calendar, ChevronRight, FileDown, Trash2, CheckCircle2, Circle, Image as ImageIcon } from "lucide-react";
import { generatePDF } from "../services/pdfService";
import { cn } from "../lib/utils";
import ReactMarkdown from "react-markdown";

interface NotebookPageProps {
  records: MistakeRecord[];
  onDelete: (id: string) => Promise<void>;
}

export default function NotebookPage({ records, onDelete }: NotebookPageProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [printing, setPrinting] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<MistakeRecord | null>(null);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map((r) => r.id)));
    }
  };

  const handlePrint = async () => {
    if (selectedIds.size === 0) return;
    setPrinting(true);
    try {
      const selectedRecords = records.filter((r) => selectedIds.has(r.id));
      await generatePDF(selectedRecords);
    } catch (error) {
      console.error("Print Error:", error);
      alert("生成 PDF 失败，请重试。");
    } finally {
      setPrinting(false);
    }
  };

  if (viewingRecord) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <button
          onClick={() => setViewingRecord(null)}
          className="text-blue-600 font-bold flex items-center gap-1 hover:underline"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          返回列表
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{viewingRecord.knowledgePoint}</h2>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(viewingRecord.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="space-y-4">
            {viewingRecord.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img src={viewingRecord.imageUrl} alt="Original" className="w-full object-contain max-h-96 bg-gray-50" />
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">原题内容</h3>
              <div className="text-gray-800 leading-relaxed prose prose-sm max-w-none">
                <ReactMarkdown>{viewingRecord.originalQuestion || "（无题目内容）"}</ReactMarkdown>
              </div>
              {viewingRecord.originalAnswer && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wider">标准答案</span>
                  <p className="text-green-800 font-medium">{viewingRecord.originalAnswer}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">举一反三练习</h3>
              {viewingRecord.generatedProblems.map((p, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-gray-800 font-medium">{p.question}</p>
                  </div>
                  <div className="pl-8 space-y-2">
                    <div className="text-sm">
                      <span className="font-bold text-green-600">答案：</span>
                      <span className="text-gray-700">{p.answer}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-bold text-gray-700">解析：</span>
                      <span className="text-gray-600">{p.explanation}</span>
                    </div>
                    <div className="text-sm bg-orange-50 p-2 rounded border border-orange-100 italic">
                      <span className="font-bold text-orange-700">易错点：</span>
                      <span className="text-orange-800">{p.commonMistakes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center justify-between sticky top-[72px] z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
          >
            {selectedIds.size === records.length && records.length > 0 ? (
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
            全选 ({selectedIds.size})
          </button>
        </div>
        <button
          onClick={handlePrint}
          disabled={selectedIds.size === 0 || printing}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {printing ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <FileDown className="w-4 h-4" />
          )}
          {printing ? "生成 PDF 中..." : "打印选定错题"}
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-10 h-10 text-gray-300" />
          </div>
          <div>
            <p className="text-gray-500 font-medium">错题本空空如也</p>
            <p className="text-sm text-gray-400">快去识别第一道错题吧！</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className={cn(
                "bg-white rounded-xl border transition-all flex items-center p-4 gap-4 hover:shadow-md",
                selectedIds.has(record.id) ? "border-blue-500 bg-blue-50/30" : "border-gray-200"
              )}
            >
              <button
                onClick={() => toggleSelect(record.id)}
                className="flex-shrink-0"
              >
                {selectedIds.has(record.id) ? (
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300" />
                )}
              </button>

              {record.imageUrl && (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                  <img src={record.imageUrl} alt="Thumb" className="w-full h-full object-cover" />
                </div>
              )}

              <div
                className="flex-1 cursor-pointer min-w-0"
                onClick={() => setViewingRecord(record)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded uppercase tracking-wider truncate">
                    {record.knowledgePoint}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5 whitespace-nowrap">
                    <Calendar className="w-3 h-3" />
                    {new Date(record.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-800 font-medium truncate">
                  {record.originalQuestion}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingRecord(record)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("确定要删除这条错题记录吗？")) {
                      onDelete(record.id);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
