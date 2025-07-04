// Utility functions for resume processing

export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === "text/plain") {
      // Handle plain text files
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = () => reject(new Error("Failed to read text file"));
      reader.readAsText(file);
    } else if (file.type === "application/pdf") {
      // For PDF files, we'll need a PDF parser library
      // You can install: npm install pdf-parse
      reject(new Error("PDF parsing requires additional setup. Please paste text manually."));
    } else if (file.type.includes("word") || file.type.includes("document")) {
      // For Word documents, we'll need a DOCX parser library
      // You can install: npm install mammoth
      reject(new Error("Word document parsing requires additional setup. Please paste text manually."));
    } else {
      reject(new Error("Unsupported file type"));
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