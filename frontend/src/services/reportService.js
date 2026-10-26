import api from './api';

export const reportService = {
  getKpis: async () => {
    const response = await api.get('/reports/kpis');
    return response.data;
  },

  getStatusBreakdown: async () => {
    const response = await api.get('/reports/status-breakdown');
    return response.data;
  },

  getCategoryDistribution: async () => {
    const response = await api.get('/reports/category-distribution');
    return response.data;
  },

  getTrends: async () => {
    const response = await api.get('/reports/trends');
    return response.data;
  },

  getEmployeePerformance: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/reports/employee-performance', { params });
    return response.data;
  },

  exportCsv: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/reports/export-csv', {
      params,
      responseType: 'blob',
    });

    // Trigger browser file download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'complaints_report.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
