import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
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
}

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

// Data transformation functions to match frontend expectations
export const transformRepo = (repo: Repo) => ({
  id: repo.id,
  name: repo.name,
  description: repo.summary || '',
  language: repo.language || 'Unknown',
  stargazers_count: 0, // Not available in backend
  forks_count: 0, // Not available in backend
  watchers_count: 0, // Not available in backend
  created_at: repo.created_at || new Date().toISOString().split('T')[0]
});

export const transformIdea = (idea: Idea) => ({
  title: idea.title,
  score: idea.score || 5,
  effort: idea.mvp_effort || 5,
  hook: idea.hook || '',
  value: idea.value || '',
  evidence: idea.evidence || '',
  differentiator: idea.differentiator || '',
  callToAction: idea.call_to_action || '',
  deepDiveGenerated: !!idea.deep_dive,
  generatedAt: idea.created_at,
  id: idea.id,
  deep_dive: idea.deep_dive
}); 