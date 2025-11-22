/**
 * API Service for Lecture Assistant
 * Handles all backend API calls
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface StartResearchResponse {
  research_id: string;
  status: string;
  message: string;
}

export interface CheckpointData {
  research_id: string;
  checkpoint_id: string;
  checkpoint_name: string;
  data: any;
  status: string;
}

export interface StatusResponse {
  research_id: string;
  status: string;
  current_checkpoint: string | null;
  error: string | null;
}

export interface BriefResponse {
  research_id: string;
  brief: any;
  status: string;
}

export const researchApi = {
  /**
   * Start a new research session
   */
  startResearch: async (topic: string): Promise<StartResearchResponse> => {
    const response = await api.post('/api/start-research', { topic });
    return response.data;
  },

  /**
   * Get current status of research session
   */
  getStatus: async (researchId: string): Promise<StatusResponse> => {
    const response = await api.get(`/api/status/${researchId}`);
    return response.data;
  },

  /**
   * Get checkpoint data for human review
   */
  getCheckpoint: async (researchId: string): Promise<CheckpointData> => {
    const response = await api.get(`/api/checkpoint/${researchId}`);
    return response.data;
  },

  /**
   * Respond to a checkpoint with human decision
   */
  respondToCheckpoint: async (
    researchId: string,
    decision: string,
    customFeedback?: string,
    approvedClaims?: number[],
    rejectedClaims?: number[]
  ): Promise<any> => {
    const response = await api.post(`/api/checkpoint/${researchId}/respond`, {
      decision,
      custom_feedback: customFeedback,
      approved_claims: approvedClaims,
      rejected_claims: rejectedClaims,
    });
    return response.data;
  },

  /**
   * Get final research brief
   */
  getBrief: async (researchId: string): Promise<BriefResponse> => {
    const response = await api.get(`/api/brief/${researchId}`);
    return response.data;
  },

  /**
   * Get execution logs
   */
  getLogs: async (researchId: string): Promise<any> => {
    const response = await api.get(`/api/logs/${researchId}`);
    return response.data;
  },
};

export default api;
