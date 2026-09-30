import api from './api';

export const rideService = {
  // Fetch rides with optional filters (route, time, status, driver)
  async getRides(params = {}) {
    const response = await api.get('/rides', { params });
    return response.data;
  },

  // Fetch a single ride by ID
  async getRideById(id) {
    const response = await api.get(`/rides/${id}`);
    return response.data;
  },

  // Post a new ride
  async createRide(rideData) {
    const response = await api.post('/rides', rideData);
    return response.data;
  },

  // Update existing ride (Driver only)
  async updateRide(id, rideData) {
    const response = await api.put(`/rides/${id}`, rideData);
    return response.data;
  },

  // Cancel ride (Driver only)
  async cancelRide(id) {
    const response = await api.delete(`/rides/${id}`);
    return response.data;
  },

  // Join a ride (Passenger)
  async joinRide(id) {
    const response = await api.post(`/rides/${id}/join`);
    return response.data;
  },

  // Get all join requests for a specific ride (Driver only)
  async getRideRequests(id) {
    const response = await api.get(`/rides/${id}/requests`);
    return response.data;
  },

  // Accept or Reject a join request (Driver only)
  async updateRideRequestStatus(rideId, requestId, status) {
    const response = await api.patch(`/rides/${rideId}/requests/${requestId}`, { status });
    return response.data;
  }
};
