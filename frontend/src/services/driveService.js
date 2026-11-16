import api from './api'

export const driveService = {
  async getDrives(params = {}) {
    const response = await api.get('/drives', { params })
    return response.data
  },

  async createDrive(data) {
    const response = await api.post('/drives', data)
    return response.data
  },

  async getDrive(id) {
    const response = await api.get(`/drives/${id}`)
    return response.data
  },

  async updateDrive(id, data) {
    const response = await api.put(`/drives/${id}`, data)
    return response.data
  },

  async updateDriveStatus(id, status) {
    const response = await api.patch(`/drives/${id}/status`, { status })
    return response.data
  },

  async checkEligibility(id) {
    const response = await api.get(`/drives/${id}/check-eligibility`)
    return response.data
  },

  // Backward-compatible aliases for existing frontend calls referencing driveService
  async getMyApplications() {
    const response = await api.get('/applications/me')
    return response.data
  },

  async applyToDrive(driveId) {
    const response = await api.post('/applications', { drive_id: driveId })
    return response.data
  },

  async getNotifications() {
    const response = await api.get('/notifications')
    return response.data
  },

  async getPlacementSummary() {
    const response = await api.get('/reports/summary')
    return response.data
  },

  async getDepartmentWiseStats() {
    const response = await api.get('/reports/departments')
    return response.data
  },

  async getApplicationFunnel(driveId = null) {
    const params = driveId ? { drive_id: driveId } : {}
    const response = await api.get('/reports/funnel', { params })
    return response.data
  },

  async getUnplacedStudents(params = {}) {
    const response = await api.get('/reports/unplaced', { params })
    return response.data
  },
}

export const applicationService = {
  async applyForDrive(driveId) {
    const response = await api.post('/applications', { drive_id: driveId })
    return response.data
  },

  async applyToDrive(driveId) {
    const response = await api.post('/applications', { drive_id: driveId })
    return response.data
  },

  async getApplications(params = {}) {
    const response = await api.get('/applications', { params })
    return response.data
  },

  async getMyApplications() {
    const response = await api.get('/applications/me')
    return response.data
  },

  async getApplication(id) {
    const response = await api.get(`/applications/${id}`)
    return response.data
  },

  async updateApplicationStatus(id, statusData) {
    const response = await api.patch(`/applications/${id}/status`, statusData)
    return response.data
  },

  async withdrawApplication(id) {
    const response = await api.post(`/applications/${id}/withdraw`)
    return response.data
  },
}

export const offerService = {
  async issueOffer(offerData) {
    const response = await api.post('/offers', offerData)
    return response.data
  },

  async getOffers(params = {}) {
    const response = await api.get('/offers', { params })
    return response.data
  },

  async getOffer(id) {
    const response = await api.get(`/offers/${id}`)
    return response.data
  },

  async respondToOffer(id, status, remarks = '') {
    const response = await api.post(`/offers/${id}/respond`, {
      status,
      student_remarks: remarks,
    })
    return response.data
  },
}

export const notificationService = {
  async getNotifications() {
    const response = await api.get('/notifications')
    return response.data
  },

  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`)
    return response.data
  },

  async markAllAsRead() {
    const response = await api.post('/notifications/read-all')
    return response.data
  },
}

export const reportService = {
  async getSummary() {
    const response = await api.get('/reports/summary')
    return response.data
  },

  async getDepartmentStats() {
    const response = await api.get('/reports/departments')
    return response.data
  },

  async getCompanyStats() {
    const response = await api.get('/reports/companies')
    return response.data
  },

  async getPackageStats() {
    const response = await api.get('/reports/packages')
    return response.data
  },

  async getFunnelStats(driveId = null) {
    const params = driveId ? { drive_id: driveId } : {}
    const response = await api.get('/reports/funnel', { params })
    return response.data
  },

  async getUnplacedStudents(params = {}) {
    const response = await api.get('/reports/unplaced', { params })
    return response.data
  },

  async getPendingInterviews() {
    const response = await api.get('/reports/pending-interviews')
    return response.data
  },

  async getPendingOffers() {
    const response = await api.get('/reports/pending-offers')
    return response.data
  },
}
