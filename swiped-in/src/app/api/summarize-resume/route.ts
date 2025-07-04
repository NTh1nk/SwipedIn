import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { resume } = await req.json();

    if (!resume || typeof resume !== 'string') {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    const summary = await generateSummary(resume);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error summarizing resume:', error);
    return NextResponse.json(
      { error: 'Failed to summarize resume' },
      { status: 500 }
    );
  }
}

async function generateSummary(resumeText: string): Promise<string> {
  // Check if OpenAI API key is available
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    // Fallback to simple text processing if no API key
    const sentences = resumeText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keyInfo = sentences.slice(0, 3).map(s => s.trim());
    
    return `Professional Summary:\n\n${keyInfo.join('. ')}. This candidate demonstrates relevant experience and skills for the position.`;
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional resume analyzer. Create a concise 3-4 sentence summary highlighting key skills, experience, and qualifications. Focus on the most relevant information for job applications.' 
          },
          { 
            role: 'user', 
            content: `Please summarize this resume:\n\n${resumeText}` 
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      throw new Error('OpenAI API request failed');
    }

    const openaiData = await openaiRes.json();
    return openaiData.choices?.[0]?.message?.content || 'Unable to generate summary.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback to simple text processing
    const sentences = resumeText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keyInfo = sentences.slice(0, 3).map(s => s.trim());
    
    return `Professional Summary:\n\n${keyInfo.join('. ')}. This candidate demonstrates relevant experience and skills for the position.`;
  }
} 