import { supabase } from '../lib/supabaseClient';

export interface LangGraphWorkflow {
  id: string;
  name: string;
  description: string;
  graph_data: any;
  created_at: string;
  updated_at: string;
}

export const langGraphService = {
  async getAllWorkflows(): Promise<LangGraphWorkflow[]> {
    const { data, error } = await supabase
      .from('langgraph_workflows')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getWorkflowById(id: string): Promise<LangGraphWorkflow | null> {
    const { data, error } = await supabase
      .from('langgraph_workflows')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createWorkflow(name: string, description: string, graphData: any): Promise<LangGraphWorkflow> {
    const { data, error } = await supabase
      .from('langgraph_workflows')
      .insert([
        {
          name,
          description,
          graph_data: graphData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateWorkflow(id: string, name: string, description: string, graphData: any): Promise<LangGraphWorkflow> {
    const { data, error } = await supabase
      .from('langgraph_workflows')
      .update({
        name,
        description,
        graph_data: graphData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteWorkflow(id: string): Promise<void> {
    const { error } = await supabase
      .from('langgraph_workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
