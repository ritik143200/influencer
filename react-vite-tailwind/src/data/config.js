export const defaultConfig = {
  background_color: '#050816',
  text_color: '#f8fafc',
  font_family: 'Outfit',
  primary_action: '#8b5cf6',
  secondary_action: '#22d3ee'
};

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002').replace(/\/$/, '');
