import React from "react";
import ReactMarkdown from "react-markdown";
import { GeneratedProblem } from "../types";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface ProblemCardProps {
  problem: GeneratedProblem;
  index: number;
}

export default function ProblemCard({ problem, index }: ProblemCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center gap-2">
        <span className="text-blue-700 font-bold text-sm uppercase tracking-wider">举一反三 #{index + 1}</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
            <div className="text-gray-800 leading-relaxed prose prose-sm max-w-none">
              <ReactMarkdown>{problem.question}</ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-green-800">正确答案</span>
          </div>
          <div className="text-green-900 text-sm font-medium">
            <ReactMarkdown>{problem.answer}</ReactMarkdown>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm">
            <span className="font-bold text-gray-700 block mb-1">题目解析</span>
            <div className="text-gray-600 leading-relaxed prose prose-sm max-w-none">
              <ReactMarkdown>{problem.explanation}</ReactMarkdown>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-bold text-orange-800">易错点分析</span>
            </div>
            <div className="text-orange-900 text-sm leading-relaxed prose prose-sm max-w-none italic">
              <ReactMarkdown>{problem.commonMistakes}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
