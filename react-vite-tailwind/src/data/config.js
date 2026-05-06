export const defaultConfig = {
  background_color: '#ffffff',
  text_color: '#1a1a1a',
  font_family: 'Inter',
  primary_action: '#9333ea', // Purple tone based on the loader
  secondary_action: '#c084fc'
};

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://viralmantrix.com').replace(/\/$/, '');
