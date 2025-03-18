import { supabase } from '@/lib/supabase';

interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_reflection_date: string;
}

export const streakService = {
  async getCurrentStreak(userId: string): Promise<Streak | null> {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Failed to get streak:', error);
      throw error;
    }

    return data;
  },

  async updateStreak(userId: string, reflectionDate: Date): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reflectionDateStart = new Date(reflectionDate);
    reflectionDateStart.setHours(0, 0, 0, 0);

    // Get current streak
    const currentStreak = await this.getCurrentStreak(userId);

    // If no streak exists, create one
    if (!currentStreak) {
      const { error } = await supabase
        .from('user_streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_reflection_date: reflectionDate.toISOString(),
        });

      if (error) throw error;
      return;
    }

    const lastReflectionDate = new Date(currentStreak.last_reflection_date);
    lastReflectionDate.setHours(0, 0, 0, 0);

    // If reflection is from today, don't update streak
    if (reflectionDateStart.getTime() === today.getTime()) {
      return;
    }

    // If reflection is from yesterday, increment streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (reflectionDateStart.getTime() === yesterday.getTime() && 
        lastReflectionDate.getTime() === yesterday.getTime()) {
      const newStreak = currentStreak.current_streak + 1;
      const { error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, currentStreak.longest_streak),
          last_reflection_date: reflectionDate.toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;
      return;
    }

    // If reflection is from before yesterday, reset streak
    if (reflectionDateStart.getTime() < yesterday.getTime()) {
      const { error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: 1,
          last_reflection_date: reflectionDate.toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;
    }
  },

  async deleteReflection(userId: string, reflectionDate: Date): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reflectionDateStart = new Date(reflectionDate);
    reflectionDateStart.setHours(0, 0, 0, 0);

    // Get current streak
    const currentStreak = await this.getCurrentStreak(userId);
    if (!currentStreak) return;

    const lastReflectionDate = new Date(currentStreak.last_reflection_date);
    lastReflectionDate.setHours(0, 0, 0, 0);

    // If deleting today's reflection and it's the only one today
    if (reflectionDateStart.getTime() === today.getTime()) {
      // Check if there are other reflections today
      const { data: todayReflections } = await supabase
        .from('journal_entries')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

      if (!todayReflections || todayReflections.length === 0) {
        // If this was the last reflection for today, update streak
        const { error } = await supabase
          .from('user_streaks')
          .update({
            current_streak: Math.max(0, currentStreak.current_streak - 1),
            last_reflection_date: lastReflectionDate.toISOString(),
          })
          .eq('user_id', userId);

        if (error) throw error;
      }
    }
  }
}; 