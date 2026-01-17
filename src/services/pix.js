import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

export async function generatePix(candidatoId, cpfHash, value, nickname, voteId) {
  return api.post('/pix', { candidatoId, cpfHash, value, nickname, voteId })
}

