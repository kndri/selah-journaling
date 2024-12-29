import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export const transcriptionService = {
  async transcribeAudio(audioUri: string): Promise<string> {
    console.log('Starting transcription:', { audioUri });

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      });
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      formData.append('response_format', 'json');

      console.log('Making OpenAI request...');
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
      console.log('Transcription complete:', {
        success: true,
        textLength: data.text?.length,
        preview: data.text?.substring(0, 50),
      });

      return data.text;
    } catch (error) {
      console.error('Transcription failed:', {
        error,
        message: error.message,
      });
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  },

  // Optional: Add additional configuration options
  async transcribeWithOptions(audioUri: string, options: {
    prompt?: string;  // Optional prompt to guide the transcription
    temperature?: number;  // Control randomness (0-1)
    language?: string;  // Specify language code
  } = {}): Promise<string> {
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    });
    formData.append('model', 'whisper-1');
    
    if (options.prompt) formData.append('prompt', options.prompt);
    if (options.temperature) formData.append('temperature', options.temperature.toString());
    if (options.language) formData.append('language', options.language);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data.text;
  }
}; 