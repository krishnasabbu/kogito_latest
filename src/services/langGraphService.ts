import { supabase } from '../lib/supabaseClient';
import axios from 'axios';

const BACKEND_API_URL = 'http://localhost:8000';

export interface LangGraphWorkflow {
  name: string;
  context?: string;
  latest_version: number;
  created_at: string;
  data: any;
}

async function useBackendFallback(): Promise<boolean> {
  try {
    const { error } = await supabase.from('langgraph_workflows').select('id').limit(1);
    return !!error;
  } catch {
    return true;
  }
}

export const langGraphService = {
  async getAllWorkflows(): Promise<LangGraphWorkflow[]> {
    const useFallback = await useBackendFallback();

    if (useFallback) {
      try {
        console.log('Using Python backend fallback for getAllWorkflows');
        const response = await axios.get(`${BACKEND_API_URL}/api/flows`);
        return response.data.map((flow: any) => ({
          name: flow.name,
          context: flow.context?.description || '',
          latest_version: flow.latest_version,
          created_at: flow.created_at,
          data: flow.data
        }));
      } catch (error) {
        console.error('Backend fallback failed:', error);
        return [];
      }
    }

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
    const useFallback = await useBackendFallback();

    if (useFallback) {
      try {
        console.log('Using Python backend fallback for getWorkflowByName');
        const response = await axios.get(`${BACKEND_API_URL}/api/flows/${name}`);
        return {
          name: response.data.name,
          context: response.data.context?.description || '',
          latest_version: response.data.version,
          created_at: response.data.created_at,
          data: response.data.data
        };
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        console.error('Backend fallback failed:', error);
        return null;
      }
    }

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
    const useFallback = await useBackendFallback();

    if (useFallback) {
      try {
        console.log('Using Python backend fallback for createWorkflow');
        const response = await axios.post(`${BACKEND_API_URL}/api/flows`, {
          name,
          data: workflowData,
          context: { description: context }
        });
        return {
          name: response.data.name,
          context,
          latest_version: response.data.version,
          created_at: new Date().toISOString(),
          data: workflowData
        };
      } catch (error) {
        console.error('Backend fallback failed:', error);
        throw error;
      }
    }

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
    const useFallback = await useBackendFallback();

    if (useFallback) {
      try {
        console.log('Using Python backend fallback for updateWorkflow');
        const response = await axios.post(`${BACKEND_API_URL}/api/flows`, {
          name,
          data: workflowData,
          context: { description: context }
        });
        return {
          name: response.data.name,
          context,
          latest_version: response.data.version,
          created_at: new Date().toISOString(),
          data: workflowData
        };
      } catch (error) {
        console.error('Backend fallback failed:', error);
        throw error;
      }
    }

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
    const useFallback = await useBackendFallback();

    if (useFallback) {
      console.log('Using Python backend - delete not implemented in backend API');
      throw new Error('Delete operation not supported in fallback mode');
    }

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
