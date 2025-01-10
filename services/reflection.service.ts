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

  async deleteEntry(entryId: string) {
    console.log('Starting delete operation for entry:', entryId);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      console.error('No authenticated user found');
      throw new Error('User must be authenticated to delete entries');
    }

    // First verify the entry exists and belongs to user
    const { data: entry, error: fetchError } = await supabase
      .from('journal_entries')
      .select('id, user_id')
      .eq('id', entryId)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !entry) {
      console.error('Entry not found or unauthorized:', fetchError);
      throw new Error('Entry not found or unauthorized');
    }

    console.log('Found entry to delete:', entry);

    // Delete insights first
    const { error: insightsError } = await supabase
      .from('reflection_insights')
      .delete()
      .eq('entry_id', entryId)
      .eq('user_id', session.user.id);

    if (insightsError) {
      console.error('Failed to delete insights:', insightsError);
      throw insightsError;
    }

    console.log('Successfully deleted insights');

    // Delete the journal entry with explicit user check
    const { error: entryError } = await supabase
      .from('journal_entries')
      .delete()
      .match({ 
        id: entryId,
        user_id: session.user.id 
      });

    if (entryError) {
      console.error('Failed to delete journal entry:', entryError);
      throw entryError;
    }

    // Final verification
    const { data: verifyEntry } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('id', entryId)
      .maybeSingle();

    if (verifyEntry) {
      console.error('Entry still exists after deletion:', entryId);
      throw new Error('Failed to delete entry - entry still exists');
    }

    console.log('Successfully deleted entry and verified deletion');
    return true;
  },
}; 