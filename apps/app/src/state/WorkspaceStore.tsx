import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { initialWorkspace } from '@/data/seed';
import { defaultAgentPhases, type Agent, type AgentMessage, type ModelSettings, type Routine, type WorkspaceData } from '@/model/types';
import { normalizeModelSettings, presetFor } from '@/services/providers';
import { characterForName, isCharacterId } from '@/services/characters';

const STORAGE_KEY = 'agent-harbor.workspace.v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function storedText(value: unknown, fallback: string, maxLength: number) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, maxLength) : fallback;
}

function normalizeWorkspace(value: unknown): WorkspaceData {
  if (!isRecord(value)) return initialWorkspace;
  const agentsInput = Array.isArray(value.agents) ? value.agents : initialWorkspace.agents;
  const agents: Agent[] = agentsInput.flatMap((entry, index) => {
    if (!isRecord(entry)) return [];
    const name = storedText(entry.name, '', 60);
    const id = storedText(entry.id, '', 128);
    if (!name || !id) return [];
    const defaultAgent = initialWorkspace.agents[index % initialWorkspace.agents.length];
    const phases = Array.isArray(entry.phases) ? entry.phases.filter((phase): phase is string => typeof phase === 'string' && Boolean(phase.trim())).map((phase) => phase.trim().slice(0, 120)).slice(0, 6) : [];
    return [{
      id,
      name,
      role: storedText(entry.role, 'Personal assistant', 160),
      goal: storedText(entry.goal, 'Help me move work forward.', 2000),
      color: typeof entry.color === 'string' && /^#[\da-f]{6}$/i.test(entry.color) ? entry.color : defaultAgent.color,
      character: isCharacterId(entry.character) ? entry.character : characterForName(name),
      phases: phases.length ? phases : [...defaultAgentPhases],
      createdAt: storedText(entry.createdAt, 'Recently', 80),
    }];
  });
  const agentIds = new Set(agents.map((agent) => agent.id));
  const routinesInput = Array.isArray(value.routines) ? value.routines : initialWorkspace.routines;
  const routines: Routine[] = routinesInput.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const id = storedText(entry.id, '', 128);
    const agentId = storedText(entry.agentId, '', 128);
    const name = storedText(entry.name, '', 100);
    if (!id || !name || !agentIds.has(agentId)) return [];
    return [{ id, agentId, name, description: storedText(entry.description, '', 500), schedule: storedText(entry.schedule, 'Unscheduled', 100), enabled: entry.enabled === true }];
  });
  const conversations: WorkspaceData['conversations'] = {};
  const savedConversations = isRecord(value.conversations) ? value.conversations : {};
  for (const agent of agents) {
    const savedMessages = savedConversations[agent.id];
    const source = Array.isArray(savedMessages) ? savedMessages : initialWorkspace.conversations[agent.id] ?? [];
    conversations[agent.id] = source.flatMap((entry) => {
      if (!isRecord(entry) || (entry.role !== 'user' && entry.role !== 'assistant')) return [];
      const content = storedText(entry.content, '', 100000);
      const id = storedText(entry.id, '', 200);
      if (!content || !id) return [];
      const mode = entry.mode === 'provider' || entry.mode === 'local' || entry.mode === 'preview' ? entry.mode : undefined;
      return [{ id, role: entry.role, content, createdAt: storedText(entry.createdAt, 'Recently', 80), ...(mode ? { mode } : {}) }];
    });
  }
  const model = normalizeModelSettings(isRecord(value.model) ? value.model as Partial<ModelSettings> : undefined);
  const oldImplicitOllama = model.provider === 'ollama' && model.endpoint === presetFor('ollama').endpoint && model.model === presetFor('ollama').model;
  return { agents, routines, conversations, model: oldImplicitOllama ? normalizeModelSettings(undefined) : model };
}

type WorkspaceContextValue = WorkspaceData & {
  ready: boolean;
  createAgent: (input: Pick<Agent, 'name' | 'role' | 'goal' | 'color'> & Partial<Pick<Agent, 'character' | 'phases'>>) => string;
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
        try {
          setData(normalizeWorkspace(JSON.parse(saved)));
        } catch { /* keep the starter workspace */ }
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

  const createAgent = useCallback((input: Pick<Agent, 'name' | 'role' | 'goal' | 'color'> & Partial<Pick<Agent, 'character' | 'phases'>>) => {
    const id = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const phases = (input.phases ?? defaultAgentPhases).map((phase) => phase.trim()).filter(Boolean).slice(0, 6);
    const agent: Agent = { ...input, phases: phases.length ? phases : defaultAgentPhases, id, createdAt: 'Just now' };
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
    setData((current) => ({ ...current, routines: [{ ...input, id: `routine-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, enabled: true }, ...current.routines] }));
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
