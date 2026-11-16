import api from './api'

export const studentService = {
  async getStudents(params = {}) {
    const response = await api.get('/students', { params })
    return response.data
  },

  async getMyProfile() {
    const response = await api.get('/students/me')
    return response.data
  },

  async updateMyProfile(data) {
    const response = await api.put('/students/me', data)
    return response.data
  },

  async getStudent(id) {
    const response = await api.get(`/students/${id}`)
    return response.data
  },

  async updateStudentAdmin(id, data) {
    const response = await api.put(`/students/${id}`, data)
    return response.data
  },

  async updatePlacementStatus(id, placementData) {
    const response = await api.patch(`/students/${id}/placement-status`, placementData)
    return response.data
  },

  async deactivateStudent(id) {
    const response = await api.patch(`/students/${id}/deactivate`)
    return response.data
  },
}
