import { supabase } from '../lib/supabaseClient';

export interface LangGraphWorkflow {
  name: string;
  context?: string;
  latest_version: number;
  created_at: string;
  data: any;
}

export const langGraphService = {
  async getAllWorkflows(): Promise<LangGraphWorkflow[]> {
    try {
      const { data, error } = await supabase
        .from('langgraph_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  },

  async getWorkflowByName(name: string): Promise<LangGraphWorkflow | null> {
    try {
      const { data, error } = await supabase
        .from('langgraph_workflows')
        .select('*')
        .eq('name', name)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      throw error;
    }
  },

  async createWorkflow(name: string, context: string, workflowData: any): Promise<LangGraphWorkflow> {
    try {
      const { data, error } = await supabase
        .from('langgraph_workflows')
        .insert({
          name,
          context,
          data: workflowData,
          latest_version: 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  },

  async updateWorkflow(name: string, context: string, workflowData: any): Promise<LangGraphWorkflow> {
    try {
      const existing = await this.getWorkflowByName(name);
      const newVersion = existing ? (existing.latest_version || 1) + 1 : 1;

      const { data, error } = await supabase
        .from('langgraph_workflows')
        .update({
          context,
          data: workflowData,
          latest_version: newVersion,
        })
        .eq('name', name)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  },

  async deleteWorkflow(name: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('langgraph_workflows')
        .delete()
        .eq('name', name);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  },
};
