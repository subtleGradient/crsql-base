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
    try {
      await addTodo(text);
      await loadTodos();
    } catch (err) {
      setError(err as Error);
      console.error('Failed to add todo:', err);
    }
  }, [loadTodos]);

  const toggle = useCallback(async (id: string) => {
    try {
      await toggleTodo(id);
      await loadTodos();
    } catch (err) {
      setError(err as Error);
      console.error('Failed to toggle todo:', err);
    }
  }, [loadTodos]);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteTodo(id);
      await loadTodos();
    } catch (err) {
      setError(err as Error);
      console.error('Failed to delete todo:', err);
    }
  }, [loadTodos]);

  useEffect(() => {
    if (isInitialized) {
      loadTodos();
    }
  }, [isInitialized, loadTodos]);

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