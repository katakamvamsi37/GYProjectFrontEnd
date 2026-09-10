import apiClient from './client';

export const getProfile = (userId) => apiClient.get(`/profiles/${userId}/`);
export const updateProfile = (userId, payload, avatar) => {
  if (!avatar) return apiClient.patch(`/profiles/${userId}/`, payload);
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
  formData.append('avatar', avatar);
  return apiClient.patch(`/profiles/${userId}/`, formData);
};
