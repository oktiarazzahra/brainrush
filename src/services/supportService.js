import api from './api';

export const supportService = {
  // Submit support ticket
  submitTicket: async (ticketData) => {
    try {
      const response = await api.post('/support/tickets', {
        category: ticketData.category,
        subject: ticketData.subject,
        description: ticketData.description,
        email: ticketData.email,
        userAgent: navigator.userAgent
      });
      return response.data;
    } catch (error) {
      console.error('Submit ticket error:', error);
      throw error.response?.data || { message: 'Gagal mengirim laporan' };
    }
  },

  // Get my tickets (requires auth)
  getMyTickets: async () => {
    try {
      const response = await api.get('/support/my-tickets');
      return response.data;
    } catch (error) {
      console.error('Get my tickets error:', error);
      throw error.response?.data || { message: 'Gagal mengambil data ticket' };
    }
  },

  // Get ticket by ID (requires auth)
  getTicketById: async (ticketId) => {
    try {
      const response = await api.get(`/support/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Get ticket error:', error);
      throw error.response?.data || { message: 'Gagal mengambil data ticket' };
    }
  },

  // Get all tickets (admin only)
  getAllTickets: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/support/tickets?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get all tickets error:', error);
      throw error.response?.data || { message: 'Gagal mengambil data tickets' };
    }
  },

  // Update ticket (admin only)
  updateTicket: async (ticketId, updateData) => {
    try {
      const response = await api.put(`/support/tickets/${ticketId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update ticket error:', error);
      throw error.response?.data || { message: 'Gagal update ticket' };
    }
  },

  // Reply to ticket via Nodemailer (admin only)
  replyTicket: async (ticketId, replyData) => {
    try {
      const response = await api.post(`/support/tickets/${ticketId}/reply`, {
        subject: replyData.subject,
        message: replyData.message
      });
      return response.data;
    } catch (error) {
      console.error('Reply ticket error:', error);
      throw error.response?.data || { message: 'Gagal mengirim balasan' };
    }
  }
};
