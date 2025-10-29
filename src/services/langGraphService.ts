import { supabase } from '../lib/supabaseClient';

export interface LangGraphWorkflow {
  name: string;
  latest_version: number;
  created_at: string;
  data: any;
}

export const langGraphService = {
  async getAllWorkflows(): Promise<LangGraphWorkflow[]> {
    const { data, error } = await supabase
      .from('langgraph_workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getWorkflowByName(name: string): Promise<LangGraphWorkflow | null> {
    const { data, error } = await supabase
      .from('langgraph_workflows')
      .select('*')
      .eq('name', name)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createWorkflow(name: string, workflowData: any): Promise<LangGraphWorkflow> {
    const { data, error } = await supabase
      .from('langgraph_workflows')
      .insert([
        {
          name,
          latest_version: 1,
          data: workflowData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateWorkflow(name: string, workflowData: any): Promise<LangGraphWorkflow> {
    const existing = await this.getWorkflowByName(name);
    const newVersion = existing ? existing.latest_version + 1 : 1;

    const { data, error } = await supabase
      .from('langgraph_workflows')
      .update({
        latest_version: newVersion,
        data: workflowData,
      })
      .eq('name', name)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteWorkflow(name: string): Promise<void> {
    const { error } = await supabase
      .from('langgraph_workflows')
      .delete()
      .eq('name', name);

    if (error) throw error;
  },
};
