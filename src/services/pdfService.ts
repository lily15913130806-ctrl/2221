import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { MistakeRecord } from "../types";

export async function generatePDF(records: MistakeRecord[]) {
  const pdf = new jsPDF("p", "mm", "a4");
  const margin = 10;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 2 * margin;
  let currentY = margin;

  // Create a temporary container for rendering content to canvas
  const container = document.createElement("div");
  container.style.width = `${contentWidth * 4}px`; // Higher resolution
  container.style.padding = "20px";
  container.style.backgroundColor = "white";
  container.style.fontFamily = "sans-serif";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  for (const record of records) {
    // Render each record's content
    const recordDiv = document.createElement("div");
    recordDiv.style.marginBottom = "40px";
    recordDiv.style.borderBottom = "1px solid #eee";
    recordDiv.style.paddingBottom = "20px";

    recordDiv.innerHTML = `
      <div style="margin-bottom: 10px;">
        <span style="background: #ebf5ff; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${record.knowledgePoint}</span>
        <span style="color: #6b7280; font-size: 10px; margin-left: 10px;">${new Date(record.createdAt).toLocaleDateString()}</span>
      </div>
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #111827;">原题内容</h3>
        <p style="font-size: 14px; color: #374151; line-height: 1.6; white-space: pre-wrap;">${record.originalQuestion}</p>
        ${record.originalAnswer ? `<p style="font-size: 12px; color: #059669; font-weight: bold; margin-top: 8px;">答案：${record.originalAnswer}</p>` : ""}
      </div>
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #111827; border-left: 4px solid #3b82f6; padding-left: 10px;">举一反三练习</h3>
        ${record.generatedProblems.map((p, i) => `
          <div style="margin-bottom: 20px; background: #f9fafb; padding: 15px; border-radius: 8px;">
            <p style="font-size: 13px; font-weight: bold; color: #1f2937; margin-bottom: 6px;">题目 ${i + 1}</p>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 10px;">${p.question}</p>
            <div style="border-top: 1px dashed #d1d5db; padding-top: 10px; margin-top: 10px;">
              <p style="font-size: 12px; color: #059669; font-weight: bold; margin-bottom: 4px;">答案：${p.answer}</p>
              <p style="font-size: 12px; color: #4b5563; margin-bottom: 4px;"><span style="font-weight: bold;">解析：</span>${p.explanation}</p>
              <p style="font-size: 12px; color: #ea580c; font-style: italic;"><span style="font-weight: bold;">易错点：</span>${p.commonMistakes}</p>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    container.appendChild(recordDiv);

    // Capture the record as an image
    const canvas = await html2canvas(recordDiv, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    // Add to PDF, handle page breaks
    if (currentY + imgHeight > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      currentY = margin;
    }

    pdf.addImage(imgData, "PNG", margin, currentY, contentWidth, imgHeight);
    currentY += imgHeight + 5;
    
    // Clean up temporary div
    container.removeChild(recordDiv);
  }

  document.body.removeChild(container);
  pdf.save(`错题本_${new Date().toLocaleDateString()}.pdf`);
}
