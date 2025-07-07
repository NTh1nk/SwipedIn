// Utility functions for resume processing

export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      if (file.type === "text/plain") {
        // Handle plain text files
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          resolve(text);
        };
        reader.onerror = () => reject(new Error("Failed to read text file"));
        reader.readAsText(file);
      } else if (file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf')) {
        // Handle PDF files using pdfjs-dist
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');
        // Use local workerSrc for maximum compatibility
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        resolve(text);
      } else if (file.type.includes("word") || file.type.includes("document") || 
                 file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
        // Handle Word documents using mammoth
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } else {
        reject(new Error("Unsupported file type. Please use .txt, .pdf, .doc, or .docx files."));
      }
    } catch (error: any) {
      reject(new Error(`Failed to parse file: ${error.message}`));
    }
  });
}

export function cleanResumeText(text: string): string {
  // Remove extra whitespace and normalize line breaks
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

export function extractKeyInformation(text: string): {
  skills: string[];
  experience: string[];
  education: string[];
} {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const skills: string[] = [];
  const experience: string[] = [];
  const education: string[] = [];
  
  let currentSection = '';
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('skills') || lowerLine.includes('technologies') || lowerLine.includes('tools')) {
      currentSection = 'skills';
    } else if (lowerLine.includes('experience') || lowerLine.includes('work') || lowerLine.includes('employment')) {
      currentSection = 'experience';
    } else if (lowerLine.includes('education') || lowerLine.includes('degree') || lowerLine.includes('university')) {
      currentSection = 'education';
    } else {
      switch (currentSection) {
        case 'skills':
          skills.push(line);
          break;
        case 'experience':
          experience.push(line);
          break;
        case 'education':
          education.push(line);
          break;
      }
    }
  }
  
  return { skills, experience, education };
} 