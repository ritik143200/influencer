import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../data/config';
import {
  fallbackCategoryDirectory,
  fallbackCategorySummary
} from '../data/categoryFallback';

export const useCategoryDirectory = () => {
  const [directory, setDirectory] = useState(fallbackCategoryDirectory);
  const [summary, setSummary] = useState(fallbackCategorySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      setLoading(true);
      setError('');

      try {
        const [directoryResponse, summaryResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/categories`),
          fetch(`${API_BASE_URL}/api/categories/summary`)
        ]);

        const [directoryJson, summaryJson] = await Promise.all([
          directoryResponse.json(),
          summaryResponse.json()
        ]);

        if (!cancelled) {
          if (directoryResponse.ok && directoryJson?.success && Array.isArray(directoryJson.data)) {
            setDirectory(directoryJson.data);
          } else {
            setDirectory(fallbackCategoryDirectory);
          }

          if (summaryResponse.ok && summaryJson?.success && summaryJson?.data) {
            setSummary(summaryJson.data);
          } else {
            setSummary(fallbackCategorySummary);
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError('Failed to load categories. Using fallback experience.');
          setDirectory(fallbackCategoryDirectory);
          setSummary(fallbackCategorySummary);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    directory,
    summary,
    loading,
    error
  };
};
