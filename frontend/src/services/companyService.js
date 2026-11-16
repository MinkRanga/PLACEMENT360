import api from './api'

export const companyService = {
  async getCompanies(params = {}) {
    const response = await api.get('/companies', { params })
    return response.data
  },

  async createCompany(data) {
    const response = await api.post('/companies', data)
    return response.data
  },

  async getCompany(id) {
    const response = await api.get(`/companies/${id}`)
    return response.data
  },

  async updateCompany(id, data) {
    const response = await api.put(`/companies/${id}`, data)
    return response.data
  },

  async getCompanyRecruiters(id) {
    const response = await api.get(`/companies/${id}/recruiters`)
    return response.data
  },

  async getCompanyDrives(id) {
    const response = await api.get(`/companies/${id}/drives`)
    return response.data
  },
}
