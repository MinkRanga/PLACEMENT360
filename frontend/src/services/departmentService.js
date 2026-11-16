import api from './api'

export const departmentService = {
  async getDepartments() {
    const response = await api.get('/departments')
    return response.data
  },

  async createDepartment(data) {
    const response = await api.post('/departments', data)
    return response.data
  },

  async getDepartment(id) {
    const response = await api.get(`/departments/${id}`)
    return response.data
  },

  async updateDepartment(id, data) {
    const response = await api.put(`/departments/${id}`, data)
    return response.data
  },
}
