import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let job: any = {};
  
  try {
    console.log('Email generation API called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { job: jobData, resume } = body;
    job = jobData;

    console.log('Job data:', job);
    console.log('Resume length:', resume?.length || 0);

    console.log('Using Hack Club AI service');

    // Create the prompt for Hack Club AI
    const prompt = `You are an expert job application writer. Generate a professional and personalized application email for the following job:

Job Details:
- Position: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
${job.salary ? `- Salary: ${job.salary}` : ''}
${job.rating ? `- Company Rating: ${job.rating}/5` : ''}

Resume Information:
${resume}

Please create:
1. A compelling subject line (max 60 characters)
2. A professional email body that:
   - Shows enthusiasm for the specific role and company
   - Highlights relevant skills from the resume
   - Explains why the candidate is a good fit
   - Includes a clear call to action
   - Is concise but comprehensive (200-300 words)
   - Uses a professional but friendly tone

Format the response as JSON with "subject" and "body" fields.`;

    console.log('Sending request to Hack Club AI...');

    // Call Hack Club AI API
    const response = await fetch('https://ai.hackclub.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a professional job application writer. Always respond with valid JSON containing "subject" and "body" fields.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    console.log('Hack Club AI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hack Club AI API error response:', errorText);
      throw new Error(`Hack Club AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Hack Club AI response data:', data);
    
    const generatedText = data.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No response from Hack Club AI');
    }

    console.log('Generated text:', generatedText);

    // Extract and parse JSON from the response
    let emailData;
    try {
      // First, try to parse the entire response as JSON
      emailData = JSON.parse(generatedText);
      console.log('Direct JSON parse successful:', emailData);
    } catch (parseError) {
      console.log('Direct JSON parse failed, attempting to extract JSON from text');
      
      // Try to extract JSON from the text if it's wrapped in other content
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          emailData = JSON.parse(jsonMatch[0]);
          console.log('Extracted JSON parse successful:', emailData);
        } catch (extractError) {
          console.log('JSON extraction failed:', extractError);
          // Create fallback response
          emailData = {
            subject: `Application for ${job.title} position at ${job.company}`,
            body: generatedText
          };
        }
      } else {
        console.log('No JSON found in response, using fallback');
        // If no JSON found, create a fallback response
        emailData = {
          subject: `Application for ${job.title} position at ${job.company}`,
          body: generatedText
        };
      }
    }

    // Clean and validate the extracted data
    if (emailData && typeof emailData === 'object') {
      // Ensure subject and body are strings and trim whitespace
      emailData = {
        subject: (emailData.subject || `Application for ${job.title} position at ${job.company}`).toString().trim(),
        body: (emailData.body || generatedText).toString().trim()
      };
      
      // Validate subject length
      if (emailData.subject.length > 60) {
        emailData.subject = emailData.subject.substring(0, 57) + '...';
      }
      
      console.log('Cleaned email data:', emailData);
    } else {
      // Fallback if emailData is not an object
      emailData = {
        subject: `Application for ${job.title} position at ${job.company}`,
        body: generatedText
      };
    }

    console.log('Final email data:', emailData);
    return NextResponse.json(emailData);

  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate email',
        details: error instanceof Error ? error.message : 'Unknown error',
        subject: `Application for ${job?.title || 'Position'} at ${job?.company || 'Company'}`,
        body: 'I apologize, but I was unable to generate a custom email at this time. Please try again later or write your own application email.'
      },
      { status: 500 }
    );
  }
} 