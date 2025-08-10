import { useEffect, useState, useCallback } from 'react';
import { 
  initDatabase, 
  getTodos, 
  addTodo, 
  toggleTodo, 
  deleteTodo,
  getSiteId,
  getDbVersion,
  type Todo 
} from '@/services/database';

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [siteId, setSiteId] = useState<string>('');
  const [dbVersion, setDbVersion] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        const id = await getSiteId();
        const version = await getDbVersion();
        setSiteId(id);
        setDbVersion(version);
        setIsInitialized(true);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to initialize database:', err);
      }
    };
    init();
  }, []);

  const refreshDbVersion = useCallback(async () => {
    try {
      const version = await getDbVersion();
      setDbVersion(version);
    } catch (err) {
      console.error('Failed to get db version:', err);
    }
  }, []);

  return {
    isInitialized,
    error,
    siteId,
    dbVersion,
    refreshDbVersion,
  };
};

export const useTodos = () => {
  const { isInitialized } = useDatabase();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Move loadTodos logic directly into useEffect to avoid circular dependency
  useEffect(() => {
    if (!isInitialized) return;
    
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const data = await getTodos();
        setTodos(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to load todos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [isInitialized]);

  // Create a stable loadTodos function for manual refreshes
  const loadTodos = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      setLoading(true);
      const data = await getTodos();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load todos:', err);
    } finally {
      setLoading(false);
    }
  }, [isInitialized]);

  const add = useCallback(async (text: string) => {
    if (!isInitialized) return;
    
    try {
      await addTodo(text);
      // Reload todos directly
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to add todo:', err);
    }
  }, [isInitialized]);

  const toggle = useCallback(async (id: string) => {
    if (!isInitialized) return;
    
    try {
      await toggleTodo(id);
      // Reload todos directly
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to toggle todo:', err);
    }
  }, [isInitialized]);

  const remove = useCallback(async (id: string) => {
    if (!isInitialized) return;
    
    try {
      await deleteTodo(id);
      // Reload todos directly
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to delete todo:', err);
    }
  }, [isInitialized]);

  return {
    todos,
    loading,
    error,
    addTodo: add,
    toggleTodo: toggle,
    deleteTodo: remove,
    refresh: loadTodos,
  };
};