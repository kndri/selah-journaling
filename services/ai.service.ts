import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

interface ReflectionSummary {
  title: string;
  transcript_summary: string;
  highlight: string;
  challenge: string;
  goal: string;
  scripture: {
    verse: string;
    reference: string;
  };
  theme: string;
  sub_theme: string;
  color: string;
  shape: string;
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

//  All-Encompassing Map
const CATEGORY_MAP = [
  {
    theme: "Spiritual Growth",
    sub_themes: [
      { name: "Gratitude", color: "Blue", shape: "Circle" },
      { name: "Prayer", color: "Blue", shape: "Square" },
      { name: "Faith", color: "Blue", shape: "Star" },
      { name: "Scriptural Study", color: "Blue", shape: "Triangle" },
    ],
  },
  {
    theme: "Emotional Well-being",
    sub_themes: [
      { name: "Joy", color: "Yellow", shape: "Circle" },
      { name: "Confidence", color: "Yellow", shape: "Star" },
      { name: "Love", color: "Yellow", shape: "Square" },
      { name: "Optimism", color: "Yellow", shape: "Triangle" },
    ],
  },
  {
    theme: "Challenges & Struggles",
    sub_themes: [
      { name: "Fear", color: "Red", shape: "Triangle" },
      { name: "Stress", color: "Red", shape: "Square" },
      { name: "Conflict", color: "Red", shape: "Star" },
      { name: "Anxiety", color: "Red", shape: "Circle" },
    ],
  },
  {
    theme: "Physical & Mental Rest",
    sub_themes: [
      { name: "Peace", color: "Green", shape: "Circle" },
      { name: "Recovery", color: "Green", shape: "Square" },
      { name: "Balance", color: "Green", shape: "Star" },
      { name: "Rejuvenation", color: "Green", shape: "Triangle" },
    ],
  },
  {
    theme: "Relationships",
    sub_themes: [
      { name: "Family Bonding", color: "Purple", shape: "Circle" },
      { name: "Friendship", color: "Purple", shape: "Square" },
      { name: "Community", color: "Purple", shape: "Star" },
      { name: "Relational Conflicts", color: "Purple", shape: "Triangle" },
    ],
  },
];

function mapCategory(theme: string, subTheme: string) {
  const themeCategory = CATEGORY_MAP.find((cat) => cat.theme === theme);
  if (!themeCategory) {
    console.warn(`Theme not found: ${theme}`);
    return { color: "Gray", shape: "Circle" }; // Default values
  }

  const subThemeCategory = themeCategory.sub_themes.find((sub) => sub.name === subTheme);
  if (!subThemeCategory) {
    console.warn(`Sub-theme not found: ${subTheme} under theme: ${theme}`);
    return { color: themeCategory.color || "Gray", shape: "Circle" }; // Default for theme
  }

  return { color: subThemeCategory.color, shape: subThemeCategory.shape };
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
              content: `You are an assistant tasked with analyzing journal entries and categorizing them based on predefined themes and sub-themes.

              Please analyze the provided journal entry and generate a JSON response with the following elements:
              1. A **title** summarizing the main theme of the entry.
              2. A **highlight** identifying a positive moment or realization.
              3. A **challenge** outlining the main struggle or difficulty.
              4. A **goal**, which is an actionable step or intention.
              5. A **scripture**, including:
                 - A relevant Bible verse that provides encouragement or reflection.
                 - The reference for the verse.
              6. A **transcript_summary**, which is a concise summary (1-2 sentences) of the transcript.
              7. The **best-fitting theme** and **sub-theme** from the following predefined list:
              
                 THEMES:
                 - Spiritual Growth:
                   - Gratitude
                   - Prayer
                   - Faith
                   - Scriptural Study
                 - Emotional Well-being:
                   - Joy
                   - Confidence
                   - Love
                   - Optimism
                 - Challenges & Struggles:
                   - Fear
                   - Stress
                   - Conflict
                   - Anxiety
                 - Physical & Mental Rest:
                   - Peace
                   - Recovery
                   - Balance
                   - Rejuvenation
                 - Relationships:
                   - Family Bonding
                   - Friendship
                   - Community
                   - Relational Conflicts
              
              Format the response as JSON:
              {
                "title": "Meaningful title",
                "highlight": "Positive moment or realization",
                "challenge": "Main struggle or difficulty",
                "goal": "Actionable step or intention",
                "scripture": {
                  "verse": "Bible verse text",
                  "reference": "Book Chapter:Verse"
                },
                "transcript_summary": "Concise summary",
                "theme": "Best-fitting theme from the list",
                "sub_theme": "Best-fitting sub-theme from the list"
              }
              
              Be precise, user-friendly, and ensure the theme and sub-theme match the content.`
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
        if (
          !parsed.title ||
          !parsed.highlight ||
          !parsed.challenge ||
          !parsed.goal ||
          !parsed.scripture?.verse ||
          !parsed.scripture?.reference ||
          !parsed.transcript_summary ||
          !parsed.theme ||
          !parsed.sub_theme
        ) {
          throw new Error('Invalid response structure received');
        }

      // Map theme and sub-theme to color and shape using the All-Encompassing Map of Categories
      const categorization = mapCategory(parsed.theme, parsed.sub_theme);

        console.log('Response parsed successfully:', {
          title: parsed.title,
          hasAllFields: true
        });

        return {
          ...parsed,
          color: categorization.color,
          shape: categorization.shape,
        };
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