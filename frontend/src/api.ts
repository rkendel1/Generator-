import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'

export const getRepos = (lang?: string, search?: string) =>
  axios.get(`${API_URL}/repos`, { params: { lang, search } })

export const getIdeas = (repoId: string) =>
  axios.get(`${API_URL}/ideas/repo/${repoId}`)

export const triggerDeepDive = (ideaId: string) =>
  axios.post(`${API_URL}/ideas/${ideaId}/deepdive`)
