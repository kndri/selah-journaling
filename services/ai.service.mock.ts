export const mockAiService = {
  async transcribeAudio(audioUri: string): Promise<string> {
    return "This is a mock transcription for testing purposes.";
  },

  async generateInsights(text: string): Promise<InsightResponse> {
    return {
      insight: "This is a mock insight.",
      scripture: {
        verse: "For I know the plans I have for you...",
        reference: "Jeremiah 29:11"
      },
      reflection: "This is a mock reflection."
    };
  }
}; 