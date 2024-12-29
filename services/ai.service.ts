import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

interface InsightResponse {
  insights: Array<{
    insight: string;
    scripture: {
      verse: string;
      reference: string;
    };
    explanation: string;
    theme?: string;
  }>;
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
  async generateInsights(text: string): Promise<InsightResponse> {
    return withRetry(
      async () => {
        console.log('Starting generateInsights:', { textLength: text.length });
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `Analyze the journal entry and identify multiple key reflection points. 
              For each point, provide:
              1. A specific insight
              2. A relevant Bible verse
              3. A thoughtful explanation
              4. An optional theme/category
              
              Format as JSON array with multiple insights.
              
              Example format:
              {
                "insights": [
                  {
                    "insight": "Your specific insight here",
                    "scripture": {
                      "verse": "The Bible verse text",
                      "reference": "Book Chapter:Verse"
                    },
                    "explanation": "Your explanation here",
                    "theme": "Optional theme"
                  }
                ]
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

        console.log('OpenAI response received:', {
          hasContent: true,
          contentLength: completion.choices[0].message.content.length,
        });

        const parsed = JSON.parse(completion.choices[0].message.content);
        
        if (!parsed.insights || !Array.isArray(parsed.insights) || parsed.insights.length === 0) {
          throw new Error('Invalid or empty insights structure received');
        }

        // Validate each insight
        parsed.insights.forEach((insight, index) => {
          if (!insight.insight || !insight.scripture?.verse || !insight.scripture?.reference || !insight.explanation) {
            throw new Error(`Invalid insight structure at index ${index}`);
          }
        });

        console.log('Response parsed successfully:', {
          insightsCount: parsed.insights.length,
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