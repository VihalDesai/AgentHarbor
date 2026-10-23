import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { initialWorkspace } from '@/data/seed';
import type { Agent, AgentMessage, ModelSettings, Routine, WorkspaceData } from '@/model/types';

const STORAGE_KEY = 'agent-harbor.workspace.v1';
type WorkspaceContextValue = WorkspaceData & {
  ready: boolean;
  createAgent: (input: Pick<Agent, 'name' | 'role' | 'goal' | 'color'>) => string;
  addMessage: (agentId: string, message: AgentMessage) => void;
  createRoutine: (input: Omit<Routine, 'id' | 'enabled'>) => void;
  toggleRoutine: (id: string) => void;
  saveModel: (settings: ModelSettings) => void;
  resetWorkspace: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<WorkspaceData>(initialWorkspace);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (!alive) return;
      if (saved) {
        try { setData({ ...initialWorkspace, ...JSON.parse(saved) }); } catch { /* keep the starter workspace */ }
      }
      hydrated.current = true;
      setReady(true);
    }).catch(() => {
      hydrated.current = true;
      setReady(true);
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (hydrated.current) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => undefined);
  }, [data]);

  const createAgent = useCallback((input: Pick<Agent, 'name' | 'role' | 'goal' | 'color'>) => {
    const id = `agent-${Date.now()}`;
    const agent: Agent = { ...input, id, createdAt: 'Just now' };
    setData((current) => ({
      ...current,
      agents: [agent, ...current.agents],
      conversations: { ...current.conversations, [id]: [{ id: `${id}-welcome`, role: 'assistant', content: `I’m ${agent.name}. I’m ready to help with ${agent.goal.toLowerCase()}`, createdAt: 'Just now' }] },
    }));
    return id;
  }, []);

  const addMessage = useCallback((agentId: string, message: AgentMessage) => {
    setData((current) => ({ ...current, conversations: { ...current.conversations, [agentId]: [...(current.conversations[agentId] ?? []), message] } }));
  }, []);

  const createRoutine = useCallback((input: Omit<Routine, 'id' | 'enabled'>) => {
    setData((current) => ({ ...current, routines: [{ ...input, id: `routine-${Date.now()}`, enabled: true }, ...current.routines] }));
  }, []);

  const toggleRoutine = useCallback((id: string) => {
    setData((current) => ({ ...current, routines: current.routines.map((routine) => routine.id === id ? { ...routine, enabled: !routine.enabled } : routine) }));
  }, []);

  const saveModel = useCallback((model: ModelSettings) => setData((current) => ({ ...current, model })), []);
  const resetWorkspace = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setData(initialWorkspace);
  }, []);

  const value = useMemo(() => ({ ...data, ready, createAgent, addMessage, createRoutine, toggleRoutine, saveModel, resetWorkspace }), [data, ready, createAgent, addMessage, createRoutine, toggleRoutine, saveModel, resetWorkspace]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return context;
}
