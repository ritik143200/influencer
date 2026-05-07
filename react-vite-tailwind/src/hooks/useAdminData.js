import { useState, useEffect, useCallback, useRef } from 'react';
import { adminApi, invalidateCache } from '../services/adminApiService';

/**
 * useAdminData
 * Central data hook for the Admin Dashboard.
 * Features:
 *  - Per-tab lazy loading (only fetches when tab first becomes active)
 *  - Tracks which tabs have been loaded to avoid duplicate fetches
 *  - Background refresh without showing full-screen spinner
 *  - Optimistic state updates for mutations
 *  - Exposes per-resource loading flags for skeleton loaders
 */
export function useAdminData() {
  // ── data state ──────────────────────────────────────────────────────────────
  const [overview, setOverview]       = useState(null);
  const [users, setUsers]             = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [inquiries, setInquiries]     = useState([]);
  const [contacts, setContacts]       = useState([]);
  const [notifications, setNotifications] = useState([]);

  // ── loading state ────────────────────────────────────────────────────────────
  const [loadingOverview, setLoadingOverview]         = useState(false);
  const [loadingUsers, setLoadingUsers]               = useState(false);
  const [loadingInfluencers, setLoadingInfluencers]   = useState(false);
  const [loadingInquiries, setLoadingInquiries]       = useState(false);
  const [loadingContacts, setLoadingContacts]         = useState(false);

  // ── error state ──────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState({});

  // ── loaded-tab tracking (avoids double-fetches) ───────────────────────────
  const loadedTabs = useRef(new Set());

  const setError = (key, msg) =>
    setErrors(prev => ({ ...prev, [key]: msg }));
  const clearError = (key) =>
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });

  // ── fetch helpers ────────────────────────────────────────────────────────────

  const fetchOverview = useCallback(async (silent = false) => {
    if (!silent) setLoadingOverview(true);
    clearError('overview');
    try {
      const data = await adminApi.getOverview();
      setOverview(data);
    } catch (e) {
      setError('overview', e.message);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoadingUsers(true);
    clearError('users');
    try {
      const data = await adminApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('users', e.message);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchInfluencers = useCallback(async (silent = false) => {
    if (!silent) setLoadingInfluencers(true);
    clearError('influencers');
    try {
      const data = await adminApi.getInfluencers();
      setInfluencers(data);
    } catch (e) {
      setError('influencers', e.message);
    } finally {
      setLoadingInfluencers(false);
    }
  }, []);

  const fetchInquiries = useCallback(async (silent = false) => {
    if (!silent) setLoadingInquiries(true);
    clearError('inquiries');
    try {
      const data = await adminApi.getInquiries();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('inquiries', e.message);
    } finally {
      setLoadingInquiries(false);
    }
  }, []);

  const fetchContacts = useCallback(async (silent = false) => {
    if (!silent) setLoadingContacts(true);
    clearError('contacts');
    try {
      const data = await adminApi.getContacts();
      setContacts(data);
    } catch (e) {
      setError('contacts', e.message);
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await adminApi.getNotifications();
      setNotifications(data);
    } catch (_) { /* silent */ }
  }, []);

  // ── tab-based lazy loading ───────────────────────────────────────────────────

  const loadTab = useCallback((tab) => {
    if (loadedTabs.current.has(tab)) return; // already loaded
    loadedTabs.current.add(tab);

    switch (tab) {
      case 'overview':     fetchOverview();     break;
      case 'users':        fetchUsers();        break;
      case 'influencers':
      case 'featured':     fetchInfluencers();  break;
      case 'inquiries':    fetchInquiries();    break;
      case 'contacts':     fetchContacts();     break;
      default: break;
    }
  }, [fetchOverview, fetchUsers, fetchInfluencers, fetchInquiries, fetchContacts]);

  // Force-refresh a tab (bypass cache)
  const refreshTab = useCallback((tab) => {
    invalidateCache(tab === 'overview' ? 'overview' : `${tab}`);
    loadedTabs.current.delete(tab);

    switch (tab) {
      case 'overview':     fetchOverview(true);     break;
      case 'users':        fetchUsers(true);        break;
      case 'influencers':
      case 'featured':     fetchInfluencers(true);  break;
      case 'inquiries':    fetchInquiries(true);    break;
      case 'contacts':     fetchContacts(true);     break;
      default: break;
    }
  }, [fetchOverview, fetchUsers, fetchInfluencers, fetchInquiries, fetchContacts]);

  // Initial load — notifications & overview on mount
  useEffect(() => {
    fetchNotifications();
    loadTab('overview');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── optimistic mutation helpers ─────────────────────────────────────────────

  const updateInquiryInState = useCallback((id, updatedData) => {
    setInquiries(prev =>
      prev.map(i => (i._id === id || i.id === id) ? updatedData : i));
  }, []);

  const updateUserInState = useCallback((id, updatedData) => {
    setUsers(prev =>
      prev.map(u => (u._id === id || u.id === id) ? updatedData : u));
  }, []);

  const removeUserFromState = useCallback((id) => {
    setUsers(prev => prev.filter(u => u._id !== id && u.id !== id));
  }, []);

  const updateInfluencerInState = useCallback((id, updatedData) => {
    setInfluencers(prev =>
      prev.map(i => (i._id === id || i.id === id) ? updatedData : i));
  }, []);

  const updateContactInState = useCallback((id, updatedData) => {
    setContacts(prev =>
      prev.map(c => (c._id === id || c.id === id) ? updatedData : c));
  }, []);

  const markNotificationReadInState = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsReadInState = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  return {
    // data
    overview,
    users,
    influencers,
    inquiries,
    contacts,
    notifications,

    // loading per resource
    loadingOverview,
    loadingUsers,
    loadingInfluencers,
    loadingInquiries,
    loadingContacts,

    // errors
    errors,

    // actions
    loadTab,
    refreshTab,
    fetchNotifications,

    // state patchers (for optimistic updates)
    updateInquiryInState,
    updateUserInState,
    removeUserFromState,
    updateInfluencerInState,
    updateContactInState,
    markNotificationReadInState,
    markAllNotificationsReadInState,
    setInfluencers,
    setInquiries,
  };
}
