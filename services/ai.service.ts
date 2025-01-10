import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

interface ReflectionSummary {
  title: string;
  highlight: string;
  challenge: string;
  goal: string;
  scripture: {
    verse: string;
    reference: string;
  };
}

const isDev = process.env.NODE_ENV === 'development';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second delay between retries

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to handle retries
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delayMs = RETRY_DELAY,
  context = ''
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < retries; i++) {
    try {
      if (i > 0) {
        console.log(`Retry attempt ${i + 1}/${retries} for ${context}...`);
      }
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${i + 1}/${retries} failed:`, {
        context,
        error: lastError.message
      });
      
      if (i < retries - 1) {
        await delay(delayMs * (i + 1)); // Exponential backoff
      }
    }
  }

  throw new Error(`Failed after ${retries} attempts: ${lastError.message}`);
}

export const aiService = {
  async generateInsights(text: string): Promise<ReflectionSummary> {
    return withRetry(
      async () => {
        console.log('Starting generateInsights:', { textLength: text.length });
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `Analyze the journal entry and create a structured reflection summary with:
              1. A title that captures the main theme
              2. A highlight - something positive or encouraging
              3. A challenge being faced
              4. A goal or action step forward
              5. A relevant Bible verse with reference
              
              Format as JSON with this structure:
              {
                "title": "Meaningful title here",
                "highlight": "Key positive moment or realization",
                "challenge": "Main struggle or difficulty",
                "goal": "Actionable step or intention",
                "scripture": {
                  "verse": "Bible verse text",
                  "reference": "Book Chapter:Verse"
                }
              }`
            },
            {
              role: "user",
              content: text
            }
          ],
        });

        if (!completion.choices?.[0]?.message?.content) {
          throw new Error('No content received from OpenAI');
        }

        const parsed = JSON.parse(completion.choices[0].message.content);
        
        // Validate response structure
        if (!parsed.title || !parsed.highlight || !parsed.challenge || 
            !parsed.goal || !parsed.scripture?.verse || !parsed.scripture?.reference) {
          throw new Error('Invalid response structure received');
        }

        console.log('Response parsed successfully:', {
          title: parsed.title,
          hasAllFields: true
        });

        return parsed;
      },
      MAX_RETRIES,
      RETRY_DELAY,
      'generateInsights'
    );
  },

  async transcribeAudio(audioUri: string): Promise<string> {
    return withRetry(
      async () => {
        console.log('Starting transcription:', { audioUri });
        
        const formData = new FormData();
        formData.append('file', {
          uri: audioUri,
          type: 'audio/m4a',
          name: 'recording.m4a',
        });
        formData.append('model', 'whisper-1');
        formData.append('language', 'en');
        formData.append('response_format', 'json');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Transcription failed: ${response.status} ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.text) {
          throw new Error('No transcription text received from API');
        }

        console.log('Transcription complete:', {
          success: true,
          textLength: data.text.length,
          preview: data.text.substring(0, 50),
        });

        return data.text;
      },
      MAX_RETRIES,
      RETRY_DELAY,
      'transcribeAudio'
    );
  }
}; 