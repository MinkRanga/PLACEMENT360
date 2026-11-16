import api from './api'

export const authService = {
  // Login with username (email) and password via OAuth2 form data
  async login(email, password) {
    const params = new URLSearchParams()
    params.append('username', email.trim().toLowerCase())
    params.append('password', password)

    const response = await api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  // Student registration
  async registerStudent(studentData) {
    const response = await api.post('/auth/register/student', studentData)
    return response.data
  },

  // Recruiter registration
  async registerRecruiter(recruiterData) {
    const response = await api.post('/auth/register/recruiter', recruiterData)
    return response.data
  },

  // TPO Admin registration
  async registerAdmin(adminData) {
    const response = await api.post('/auth/register/admin', adminData)
    return response.data
  },

  // Get current session metadata
  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return response.data
  },
}
