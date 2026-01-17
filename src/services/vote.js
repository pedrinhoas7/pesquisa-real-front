import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

export async function vote(candidatoId, cpfHash, nickname, isPublicVote) {
  return api.post('/vote', { candidatoId, cpfHash, nickname, isPublicVote })
}

