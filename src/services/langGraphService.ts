import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080';

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
      const response = await axios.get(`${API_BASE_URL}/api/flows`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  },

  async getWorkflowByName(name: string): Promise<LangGraphWorkflow | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/flows/${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      throw error;
    }
  },

  async createWorkflow(name: string, context: string, workflowData: any): Promise<LangGraphWorkflow> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/flows`, {
        name,
        context,
        data: workflowData,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  },

  async updateWorkflow(name: string, context: string, workflowData: any): Promise<LangGraphWorkflow> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/flows/${encodeURIComponent(name)}`, {
        name,
        context,
        data: workflowData,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  },

  async deleteWorkflow(name: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/flows/${encodeURIComponent(name)}`);
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  },
};
