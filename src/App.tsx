import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import RecognitionPage from "./components/RecognitionPage";
import NotebookPage from "./components/NotebookPage";
import { MistakeRecord } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"recognition" | "notebook">("recognition");
  const [records, setRecords] = useState<MistakeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load records from localStorage on mount
  useEffect(() => {
    const savedRecords = localStorage.getItem("mistake_records");
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (error) {
        console.error("Failed to parse saved records:", error);
      }
    }
    setLoading(false);
  }, []);

  // Save records to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("mistake_records", JSON.stringify(records));
    }
  }, [records, loading]);

  const handleSaveRecord = async (record: Omit<MistakeRecord, "id" | "userId" | "createdAt">) => {
    const newRecord: MistakeRecord = {
      ...record,
      id: crypto.randomUUID(),
      userId: "local-user", // No auth, use a placeholder
      createdAt: Date.now(),
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleDeleteRecord = async (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "recognition" ? (
        <RecognitionPage onSave={handleSaveRecord} />
      ) : (
        <NotebookPage records={records} onDelete={handleDeleteRecord} />
      )}
    </Layout>
  );
}

