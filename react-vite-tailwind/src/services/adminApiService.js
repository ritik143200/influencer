/**
 * adminApiService.js
 * Centralised API client for all Admin Panel calls.
 * Includes:
 *  - In-memory cache with configurable TTL
 *  - Request deduplication (inflight-map)
 *  - Auth-header injection from localStorage
 *  - Typed error throwing
 */

import { API_BASE_URL } from '../data/config';

// ─── helpers ──────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem('userToken') || '';

const authHeaders = (extra = {}) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
  ...extra,
});

// ─── in-memory cache ──────────────────────────────────────────────────────────

const cache = new Map();           // key → { data, ts }
const DEFAULT_TTL = 2 * 60 * 1000; // 2 minutes

export const invalidateCache = (keyPrefix = null) => {
  if (!keyPrefix) {
    cache.clear();
    return;
  }
  for (const k of cache.keys()) {
    if (k.startsWith(keyPrefix)) cache.delete(k);
  }
};

const getCached = (key, ttl = DEFAULT_TTL) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = (key, data) => cache.set(key, { data, ts: Date.now() });

// ─── request deduplication ────────────────────────────────────────────────────

const inflight = new Map(); // key → Promise

const dedupedFetch = async (key, fetchFn, ttl = DEFAULT_TTL) => {
  const cached = getCached(key, ttl);
  if (cached !== null) return cached;

  if (inflight.has(key)) return inflight.get(key);

  const promise = fetchFn().then(data => {
    setCache(key, data);
    inflight.delete(key);
    return data;
  }).catch(err => {
    inflight.delete(key);
    throw err;
  });

  inflight.set(key, promise);
  return promise;
};

// ─── core fetch wrapper ────────────────────────────────────────────────────────

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body.message || msg;
    } catch (_) { /* ignore */ }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return res.json();
};

// ─── API methods ──────────────────────────────────────────────────────────────

export const adminApi = {
  // Overview analytics (cached 2 min)
  getOverview: () =>
    dedupedFetch('overview', () =>
      apiFetch('/api/admin/overview').then(d => d.data), 2 * 60 * 1000),

  // Users - server-side pagination
  getUsers: (params = {}) => {
    const qs = new URLSearchParams({ page: 1, limit: 100, ...params }).toString();
    return dedupedFetch(`users:${qs}`, () =>
      apiFetch(`/api/admin/users?${qs}`).then(d => d.data ?? d));
  },

  // Inquiries - server-side pagination
  getInquiries: (params = {}) => {
    const qs = new URLSearchParams({ page: 1, limit: 100, ...params }).toString();
    return dedupedFetch(`inquiries:${qs}`, () =>
      apiFetch(`/api/admin/inquiries?${qs}`).then(d => d.data ?? d));
  },

  // Influencers
  getInfluencers: () =>
    dedupedFetch('influencers', () =>
      apiFetch('/api/influencer').then(d => {
        const arr = Array.isArray(d.data) ? d.data
          : Array.isArray(d) ? d
            : Array.isArray(d.artists) ? d.artists : [];
        return arr.filter(i => i && i.email);
      })),

  // Contacts
  getContacts: () =>
    dedupedFetch('contacts', () =>
      apiFetch('/api/contacts').then(d => d.data ?? [])),

  // Notifications
  getNotifications: () =>
    apiFetch('/api/admin/notifications').then(d => Array.isArray(d) ? d : []),

  // ── mutations (always bypass cache & invalidate) ──

  updateInquiryStatus: async (id, action) => {
    const d = await apiFetch(`/api/admin/inquiries/${id}/${action}`, { method: 'PATCH' });
    invalidateCache('inquiries');
    invalidateCache('overview');
    return d.data;
  },

  forwardInquiry: async (id, recipients) => {
    const d = await apiFetch(`/api/admin/inquiries/${id}/forward`, {
      method: 'POST',
      body: JSON.stringify({ recipients }),
    });
    invalidateCache('inquiries');
    invalidateCache('overview');
    return d.data;
  },

  assignInquiry: async (id, artistId, notes = '') => {
    const d = await apiFetch(`/api/admin/inquiries/${id}/assign/${artistId}`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
    invalidateCache('inquiries');
    invalidateCache('overview');
    return d.data;
  },

  updateUserStatus: async (userId, action) => {
    const d = await apiFetch(`/api/admin/users/${userId}/${action}`, {
      method: 'POST',
    });
    invalidateCache('users');
    invalidateCache('overview');
    return d; // returns updated user directly
  },

  deleteUser: async (userId) => {
    await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    invalidateCache('users');
    invalidateCache('overview');
  },

  toggleInfluencerStatus: async (id, isActive) => {
    const d = await apiFetch(`/api/admin/influencer/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
    invalidateCache('influencers');
    invalidateCache('overview');
    return d.data;
  },

  updateContactStatus: async (id, status) => {
    const d = await apiFetch(`/api/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    invalidateCache('contacts');
    return d.data;
  },

  markNotificationRead: async (id) => {
    await apiFetch(`/api/admin/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllNotificationsRead: async () => {
    await apiFetch('/api/admin/notifications/read-all', { method: 'PATCH' });
  },
};
