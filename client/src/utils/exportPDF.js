import api from '../api/axios';

export const downloadReport = async (format, params = {}) => {
  const response = await api.get('/reports/export', {
    params: { format, ...params },
    responseType: 'blob',
  });
  const ext = format === 'pdf' ? 'pdf' : 'xlsx';
  const blob = new Blob([response.data], { type: response.headers['content-type'] });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads_report.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
};
