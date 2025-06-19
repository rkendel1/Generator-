import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export interface Repo {
  id: string;
  name: string;
  url: string;
  summary?: string;
  language?: string;
  created_at?: string;
  trending_period: string;
  stargazers_count?: number;
  forks_count?: number;
  watchers_count?: number;
}

export type IdeaStatus = 'suggested' | 'deep_dive' | 'iterating' | 'considering' | 'closed';

export interface Idea {
  id: string;
  repo_id: string;
  title: string;
  hook?: string;
  value?: string;
  evidence?: string;
  differentiator?: string;
  call_to_action?: string;
  deep_dive?: DeepDive;
  score?: number;
  mvp_effort?: number;
  deep_dive_requested: boolean;
  created_at?: string;
  llm_raw_response?: string;
  deep_dive_raw_response?: string;
  status: IdeaStatus;
}

export interface DeepDive {
  product_clarity?: string;
  timing?: string;
  market_opportunity?: string;
  strategic_moat?: string;
  business_funding?: string;
  investor_scoring?: string;
  summary?: string;
  error?: string;
}

export interface DeepDiveResponse {
  status: string;
  deep_dive?: DeepDive;
  message?: string;
}

// API Functions
export const getRepos = async (lang?: string, search?: string, period?: string) => {
  try {
    const response = await api.get('/repos/', { 
      params: { 
        language: lang, 
        search,
        period: period || 'daily'
      } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching repos:', error);
    throw error;
  }
};

export const getIdeas = async (repoId: string) => {
  try {
    const response = await api.get(`/ideas/repo/${repoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ideas:', error);
    throw error;
  }
};

export const triggerDeepDive = async (ideaId: string) => {
  try {
    const response = await api.post(`/ideas/${ideaId}/deepdive`);
    return response.data;
  } catch (error) {
    console.error('Error triggering deep dive:', error);
    throw error;
  }
};

export const getStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export const getShortlist = async () => {
  try {
    const response = await api.get('/ideas/shortlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching shortlist:', error);
    throw error;
  }
};

export const addToShortlist = async (ideaId: string) => {
  try {
    const response = await api.post(`/ideas/${ideaId}/shortlist`);
    return response.data;
  } catch (error) {
    console.error('Error adding to shortlist:', error);
    throw error;
  }
};

export const removeFromShortlist = async (ideaId: string) => {
  try {
    const response = await api.delete(`/ideas/${ideaId}/shortlist`);
    return response.data;
  } catch (error) {
    console.error('Error removing from shortlist:', error);
    throw error;
  }
};

export const getDeepDiveVersions = async (ideaId: string) => {
  try {
    const response = await api.get(`/ideas/${ideaId}/deepdive_versions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching deep dive versions:', error);
    throw error;
  }
};

export const createDeepDiveVersion = async (ideaId: string, fields: any, llm_raw_response: string, rerun_llm = false) => {
  try {
    const response = await api.post(`/ideas/${ideaId}/deepdive_versions`, { fields, llm_raw_response, rerun_llm });
    return response.data;
  } catch (error) {
    console.error('Error creating deep dive version:', error);
    throw error;
  }
};

export const deleteDeepDiveVersion = async (ideaId: string, versionNumber: number) => {
  try {
    const response = await api.delete(`/ideas/${ideaId}/deepdive_versions/${versionNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting deep dive version:', error);
    throw error;
  }
};

export const getDeepDiveVersion = async (ideaId: string, versionNumber: number) => {
  try {
    const response = await api.get(`/ideas/${ideaId}/deepdive_versions/${versionNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching deep dive version:', error);
    throw error;
  }
};

export const restoreDeepDiveVersion = async (ideaId: string, versionNumber: number) => {
  try {
    const response = await api.post(`/ideas/${ideaId}/deepdive_versions/${versionNumber}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error restoring deep dive version:', error);
    throw error;
  }
};

export const getAllIdeas = async () => {
  try {
    const response = await api.get('/ideas/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all ideas:', error);
    throw error;
  }
};

// Data transformation functions to match frontend expectations
export const transformRepo = (repo: Repo) => ({
  id: repo.id,
  name: repo.name,
  description: repo.summary || '',
  language: repo.language || 'Unknown',
  url: repo.url || '',
  stargazers_count: repo.stargazers_count || 0,
  forks_count: repo.forks_count || 0,
  watchers_count: repo.watchers_count || 0,
  created_at: repo.created_at || new Date().toISOString().split('T')[0],
  trending_period: repo.trending_period || 'daily',
});

export const transformIdea = (idea: Idea) => ({
  id: idea.id,
  repo_id: idea.repo_id,
  title: idea.title || '',
  score: idea.score ?? 5,
  effort: idea.mvp_effort ?? 5,
  hook: idea.hook || '',
  value: idea.value || '',
  evidence: idea.evidence || '',
  differentiator: idea.differentiator || '',
  callToAction: idea.call_to_action || '',
  deepDiveGenerated: !!idea.deep_dive,
  deep_dive: idea.deep_dive,
  deep_dive_requested: idea.deep_dive_requested,
  created_at: idea.created_at,
  llm_raw_response: idea.llm_raw_response,
  deep_dive_raw_response: idea.deep_dive_raw_response,
  isError: idea.title && idea.title.startsWith('[ERROR]'),
  needsNewDeepDive: !(idea.deep_dive && Object.keys(idea.deep_dive).length > 0) && !idea.deep_dive_raw_response,
  status: idea.status,
});

export async function fetchIdeas(repoId: string): Promise<Idea[]> {
  const res = await fetch(`/api/ideas?repo_id=${repoId}`);
  if (!res.ok) throw new Error('Failed to fetch ideas');
  return res.json();
}

export async function updateIdeaStatus(id: string, status: IdeaStatus): Promise<Idea> {
  const res = await fetch(`/api/ideas/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
} 