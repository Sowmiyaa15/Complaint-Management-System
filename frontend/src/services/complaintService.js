import api from './api';

export const complaintService = {
  submitComplaint: async (title, description, category, files = []) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    }

    const response = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getComplaints: async (params = {}) => {
    const response = await api.get('/complaints', { params });
    return response.data;
  },

  getMyComplaints: async (params = {}) => {
    const response = await api.get('/complaints/my', { params });
    return response.data;
  },

  getAssignedComplaints: async (params = {}) => {
    const response = await api.get('/complaints/assigned', { params });
    return response.data;
  },

  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  updateComplaintDetails: async (id, data) => {
    const response = await api.put(`/complaints/${id}`, data);
    return response.data;
  },

  assignComplaint: async (id, employeeId) => {
    const response = await api.put(`/complaints/${id}/assign`, { employeeId });
    return response.data;
  },

  updateStatus: async (id, status, comment = '') => {
    const response = await api.put(`/complaints/${id}/status`, { status, comment });
    return response.data;
  },

  addInternalNote: async (id, note) => {
    const response = await api.post(`/complaints/${id}/notes`, { note });
    return response.data;
  },

  getInternalNotes: async (id) => {
    const response = await api.get(`/complaints/${id}/notes`);
    return response.data;
  },

  deleteComplaint: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },
};
