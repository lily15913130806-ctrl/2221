export interface MistakeRecord {
  id: string;
  userId: string;
  originalQuestion: string;
  originalAnswer: string;
  originalExplanation: string;
  knowledgePoint: string;
  generatedProblems: GeneratedProblem[];
  createdAt: number;
  imageUrl?: string;
}

export interface GeneratedProblem {
  question: string;
  answer: string;
  explanation: string;
  commonMistakes: string;
}

export interface OCRResult {
  question: string;
  options?: string[];
  userAnswer?: string;
  standardAnswer?: string;
  explanation?: string;
  knowledgePoint: string;
}
