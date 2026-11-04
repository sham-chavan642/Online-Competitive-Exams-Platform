import { useState, useEffect, useCallback } from 'react';
import useFetch from './useFetch';

/**
 * useTopics — Fetch and manage topics (categories).
 *
 * Routes used:
 *  GET    /api/topics      → getAllTopics  (public)
 *  GET    /api/topics/:id  → getTopicById (public)
 *  POST   /api/topics      → createTopic  (admin only)
 *  PUT    /api/topics/:id  → updateTopic  (admin only)
 *  DELETE /api/topics/:id  → deleteTopic  (admin only)
 */
const useTopics = () => {
  const { request, loading, error } = useFetch();
  const [topics, setTopics]         = useState([]);
  const [topic, setTopic]           = useState(null);

  // GET /api/topics
  const getAllTopics = useCallback(async () => {
    const data = await request('/topics');
    setTopics(data);
    return data;
  }, [request]);

  // GET /api/topics/:id
  const getTopicById = useCallback(async (id) => {
    const data = await request(`/topics/${id}`);
    setTopic(data);
    return data;
  }, [request]);

  // POST /api/topics  (admin only)
  const createTopic = useCallback(async (topicData) => {
    const data = await request('/topics', {
      method: 'POST',
      body: JSON.stringify(topicData),
    });
    setTopics((prev) => [...prev, data]);
    return data;
  }, [request]);

  // PUT /api/topics/:id  (admin only)
  const updateTopic = useCallback(async (id, topicData) => {
    const data = await request(`/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(topicData),
    });
    setTopics((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  }, [request]);

  // DELETE /api/topics/:id  (admin only)
  const deleteTopic = useCallback(async (id) => {
    await request(`/topics/${id}`, { method: 'DELETE' });
    setTopics((prev) => prev.filter((t) => t.id !== id));
  }, [request]);

  // Auto-load all topics on mount
  useEffect(() => {
    getAllTopics();
  }, [getAllTopics]);

  return {
    topics,
    topic,
    loading,
    error,
    getAllTopics,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic,
  };
};

export default useTopics;
