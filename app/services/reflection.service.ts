export const reflectionService = {
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
}; 