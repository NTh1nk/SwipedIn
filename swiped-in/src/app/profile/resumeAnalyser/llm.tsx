import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { resume } = await req.json();

  // Example: Using OpenAI API (replace with your key and endpoint)
  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes resumes.' },
        { role: 'user', content: `Summarize this resume in 3-5 sentences:\n\n${resume}` },
      ],
      max_tokens: 300,
    }),
  });

  const openaiData = await openaiRes.json();
  const summary = openaiData.choices?.[0]?.message?.content || 'No summary generated.';

  return NextResponse.json({ summary });
}