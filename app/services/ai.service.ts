import { supabase } from '@/lib/supabase';

interface GoalObject {
  first: string;
  second: string;
  third: string;
}

interface InsightResponse {
  title: string;
  highlight: string;
  challenge: string;
  goal: string | GoalObject;
  scripture: {
    verse: string;
    reference: string;
  };
}

export const aiService = {
  async generateInsights(text: string): Promise<InsightResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { text }
      });

      if (error) throw error;

      // Transform goal based on content structure
      const goalString = data.goal as string;
      const goals = goalString.split(/,\s*(?:and\s+)?/).map(g => g.trim()).filter(Boolean);

      // If we have 3 distinct parts, make it an object
      const transformedGoal = goals.length === 3 ? {
        first: goals[0],
        second: goals[1],
        third: goals[2]
      } : goalString;

      return {
        ...data,
        goal: transformedGoal
      } as InsightResponse;
    } catch (error) {
      console.error('Failed to generate insights:', error);
      throw error;
    }
  }
}; 