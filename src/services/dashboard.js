import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

export async function getDashboard() {
  const { data } = await api.get('/dashboard')
  return data
}
