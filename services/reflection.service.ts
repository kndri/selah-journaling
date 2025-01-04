import { supabase } from '@/lib/supabase';

interface ReflectionInsight {
  insight: string;
  scripture_verse: string;
  scripture_reference: string;
  explanation: string;
  theme?: string;
}

interface CreateEntryDTO {
  content: string;
  insights: ReflectionInsight[];
}

export const reflectionService = {
  async createEntryWithInsights({ content, insights }: CreateEntryDTO) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('User must be authenticated to create entries');
      }

      console.log('Creating entry with user_id:', session.user.id);

      // Create journal entry
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .insert([{ 
          content,
          user_id: session.user.id
        }])
        .select()
        .single();

      if (entryError) {
        console.error('Entry creation error details:', {
          error: entryError,
          code: entryError.code,
          message: entryError.message,
          details: entryError.details,
          hint: entryError.hint
        });
        throw new Error(`Failed to create journal entry: ${entryError.message || 'Database error'}`);
      }

      if (!entry) {
        throw new Error('No entry returned after creation');
      }

      console.log('Entry created successfully:', entry.id);

      // Map insights to match database structure
      const mappedInsights = insights.map(insight => ({
        entry_id: entry.id,
        user_id: session.user.id,
        insight: insight.insight,
        scripture_verse: insight.scripture.verse,
        scripture_reference: insight.scripture.reference,
        explanation: insight.explanation,
        theme: insight.theme
      }));

      // Insert insights
      const { error: insightsError } = await supabase
        .from('reflection_insights')
        .insert(mappedInsights);

      if (insightsError) {
        console.error('Insights creation error details:', {
          error: insightsError,
          code: insightsError.code,
          message: insightsError.message,
          details: insightsError.details,
          hint: insightsError.hint
        });
        throw new Error(`Failed to create insights: ${insightsError.message || 'Database error'}`);
      }

      return entry;
    } catch (error) {
      console.error('Failed to create entry:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  async getAllEntriesWithInsights() {
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        reflection_insights (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
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
        reflection_insights (*)
      `)
      .eq('id', entryId)
      .single();

    if (error) {
      console.error('Failed to fetch entry:', error);
      throw new Error('Failed to load reflection');
    }

    return entry;
  }
}; 