import { supabase } from '@/lib/supabase';
import { streakService } from './streak.service';

interface ReflectionInsight {
  insight: string;
  scripture_verse: string;
  scripture_reference: string;
  explanation: string;
  theme?: string;
}

interface ReflectionSummary {
  highlight: string;
  challenge: string;
  goal: string;
}

interface CreateEntryDTO {
  title: string;
  transcript: string;
  transcript_summary: string;
  highlight: string;
  challenge: string;
  goal: string;
  scripture_verse?: string;
  scripture_reference?: string;
  explanation?: string;
  theme: string;
  sub_theme: string; 
  color: string; 
  shape: string;
}

export const reflectionService = {
  async createEntryWithInsights(data: CreateEntryDTO) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('User must be authenticated to create entries');
      }

      // Create journal entry
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .insert([{ 
          title: data.title,
          transcript: data.transcript,
          transcript_summary: data.transcript_summary,
          highlight: data.highlight,
          challenge: data.challenge,
          goal: data.goal,
          user_id: session.user.id,
          scripture_verse: data.scripture_verse,
          scripture_reference: data.scripture_reference,
          explanation: data.explanation,
          theme: data.theme,
          sub_theme: data.sub_theme,
          color: data.color,
          shape: data.shape,
        }])
        .select()
        .single();

      if (entryError) throw entryError;

      // Update streak
      await streakService.updateStreak(session.user.id, new Date(entry.created_at));

      return entry;
    } catch (error) {
      console.error('Failed to create entry:', error);
      throw error;
    }
  },

  async getAllEntriesWithInsights() {
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        reflection_insights!reflection_insights_entry_id_fkey (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch entries:', error);
      throw error;
    }
    return entries;
  },

  async getEntriesByTheme(theme: string) {
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        reflection_insights!inner (*)
      `)
      .eq('reflection_insights.theme', theme)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return entries;
  },

  async getEntryWithInsights(entryId: string) {
    const { data: entry, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        reflection_insights!reflection_insights_entry_id_fkey (*)
      `)
      .eq('id', entryId)
      .single();

    if (error) {
      console.error('Failed to fetch entry:', error);
      throw new Error('Failed to load reflection');
    }

    return entry;
  },

  async getEntryById(entryId: string) {
    const { data: entry, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', entryId)
      .single();

    if (error) {
      console.error('Failed to fetch entry:', error);
      throw error;
    }
    return entry;
  },

  async deleteEntry(entryId: string) {
    console.log('Starting delete operation for entry:', entryId);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('User must be authenticated to delete entries');
    }

    // Get entry before deleting to get its date
    const { data: entry } = await supabase
      .from('journal_entries')
      .select('created_at')
      .eq('id', entryId)
      .single();

    if (!entry) {
      throw new Error('Entry not found');
    }

    // Begin transaction
    const { error: txnError } = await supabase.rpc('begin_transaction');
    if (txnError) throw txnError;

    try {
      // Delete insights first (must happen before entry due to FK constraint)
      const { error: insightsError } = await supabase
        .from('reflection_insights')
        .delete()
        .match({ 
          entry_id: entryId,
          user_id: session.user.id 
        });

      if (insightsError) {
        await supabase.rpc('rollback_transaction');
        throw insightsError;
      }

      // Then delete the entry
      const { error: entryError } = await supabase
        .from('journal_entries')
        .delete()
        .match({ 
          id: entryId,
          user_id: session.user.id 
        });

      if (entryError) {
        await supabase.rpc('rollback_transaction');
        throw entryError;
      }

      // Update streak
      await streakService.deleteReflection(session.user.id, new Date(entry.created_at));

      // Commit transaction
      await supabase.rpc('commit_transaction');
      console.log('Successfully deleted entry and insights:', entryId);
      return true;

    } catch (error) {
      // Rollback on any error
      await supabase.rpc('rollback_transaction');
      console.error('Delete operation failed:', error);
      throw error;
    }
  },

  async createReflection(data: {
    content: string;
    insight: string;
    scripture_verse: string;
    scripture_reference: string;
    explanation: string;
  }) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('User must be authenticated');
    }

    // Create journal entry first
    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .insert({
        content: data.content,
        user_id: session.user.id
      })
      .select()
      .single();

    if (entryError) throw entryError;

    // Then create the insight
    const { error: insightError } = await supabase
      .from('reflection_insights')
      .insert({
        entry_id: entry.id,
        user_id: session.user.id,
        insight: data.insight,
        scripture_verse: data.scripture_verse,
        scripture_reference: data.scripture_reference,
        explanation: data.explanation
      });

    if (insightError) throw insightError;

    return entry;
  }
}; 