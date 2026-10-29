import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { initialWorkspace, starterAgents, starterBranches } from '@/data/seed';
import { defaultAgentPhases, type Agent, type AgentMessage, type AgentWorkRun, type CompanyBranch, type CompanyTask, type FounderProfile, type ModelSettings, type Routine, type Skill, type WorkspaceData } from '@/model/types';
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
  const branchesInput = Array.isArray(value.branches) ? value.branches : starterBranches;
  const branches: CompanyBranch[] = branchesInput.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const id = storedText(entry.id, '', 128);
    const name = storedText(entry.name, '', 100);
    if (!id || !name) return [];
    return [{ id, name, description: storedText(entry.description, '', 500), color: typeof entry.color === 'string' && /^#[\da-f]{6}$/i.test(entry.color) ? entry.color : '#8C8C8C', createdAt: storedText(entry.createdAt, 'Recently', 80) }];
  });
  const validBranchIds = new Set(branches.map((branch) => branch.id));
  const skillsInput = Array.isArray(value.skills) ? value.skills : [];
  const skills: Skill[] = skillsInput.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const id = storedText(entry.id, '', 128);
    const name = storedText(entry.name, '', 100);
    if (!id || !name) return [];
    return [{ id, name, description: storedText(entry.description, '', 500), instructions: storedText(entry.instructions, '', 6000), createdAt: storedText(entry.createdAt, 'Recently', 80) }];
  });
  const skillIds = new Set(skills.map((skill) => skill.id));
  const foundersInput = Array.isArray(value.founders) ? value.founders : [];
  const founders: FounderProfile[] = foundersInput.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const id = storedText(entry.id, '', 128);
    const name = storedText(entry.name, '', 100);
    if (!id || !name) return [];
    const attachedSkills = Array.isArray(entry.skillIds) ? entry.skillIds.filter((skillId): skillId is string => typeof skillId === 'string' && skillIds.has(skillId)).slice(0, 20) : [];
    return [{ id, name, title: storedText(entry.title, 'Founder', 120), company: storedText(entry.company, '', 120), about: storedText(entry.about, '', 1500), skillIds: attachedSkills, createdAt: storedText(entry.createdAt, 'Recently', 80) }];
  });
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
      skillIds: Array.isArray(entry.skillIds) ? entry.skillIds.filter((skillId): skillId is string => typeof skillId === 'string' && skillIds.has(skillId)).slice(0, 10) : [],
      branchId: typeof entry.branchId === 'string' && validBranchIds.has(entry.branchId) ? entry.branchId : starterAgents.find((agent) => agent.id === id && agent.branchId && validBranchIds.has(agent.branchId))?.branchId ?? branches[0]?.id ?? '',
      ...(typeof entry.managerId === 'string' ? { managerId: entry.managerId.slice(0, 128) } : {}),
      createdAt: storedText(entry.createdAt, 'Recently', 80),
    }];
  });
  const agentIds = new Set(agents.map((agent) => agent.id));
  const agentById = new Map(agents.map((agent) => [agent.id, agent]));
  const orgAgents = agents.map((agent) => {
    let managerId = agent.managerId;
    const manager = managerId ? agentById.get(managerId) : undefined;
    if (!manager || managerId === agent.id || manager.branchId !== agent.branchId) managerId = undefined;
    let cursor = managerId;
    const seen = new Set([agent.id]);
    while (cursor) {
      if (seen.has(cursor)) { managerId = undefined; break; }
      seen.add(cursor);
      cursor = agentById.get(cursor)?.managerId;
    }
    const { managerId: _discardedManagerId, ...withoutManager } = agent;
    return { ...withoutManager, ...(managerId ? { managerId } : {}) };
  });
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
  const companyTasksInput = Array.isArray(value.companyTasks) ? value.companyTasks : [];
  const companyTasks: CompanyTask[] = companyTasksInput.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const id = storedText(entry.id, '', 128);
    const request = storedText(entry.request, '', 5000);
    if (!id || !request) return [];
    const interrupted = entry.status === 'routing' || entry.status === 'working';
    const status: CompanyTask['status'] = interrupted || entry.status === 'failed' ? 'failed' : 'completed';
    const agentRuns: AgentWorkRun[] = Array.isArray(entry.agentRuns) ? entry.agentRuns.flatMap((run) => {
      if (!isRecord(run) || typeof run.agentId !== 'string' || !agentIds.has(run.agentId)) return [];
      const inProgress = run.status === 'queued' || run.status === 'running';
      const runStatus: AgentWorkRun['status'] = interrupted && inProgress ? 'failed' : run.status === 'queued' || run.status === 'running' || run.status === 'failed' ? run.status : 'completed';
      const result = typeof run.result === 'string' ? run.result.slice(0, 12000) : interrupted && inProgress ? 'The app closed before this agent reply finished.' : undefined;
      return [{ agentId: run.agentId, status: runStatus, ...(result ? { result } : {}) }];
    }).slice(0, 10) : [];
    return [{ id, request, createdAt: storedText(entry.createdAt, 'Recently', 80), status, agentRuns, ...(typeof entry.error === 'string' ? { error: entry.error.slice(0, 1000) } : interrupted ? { error: 'The app closed before this work finished.' } : {}) }];
  }).slice(0, 100);
  const model = normalizeModelSettings(isRecord(value.model) ? value.model as Partial<ModelSettings> : undefined);
  const oldImplicitOllama = model.provider === 'ollama' && model.endpoint === presetFor('ollama').endpoint && model.model === presetFor('ollama').model;
  return { companyName: storedText(value.companyName, initialWorkspace.companyName, 100), branches, companyTasks, agents: orgAgents, skills, founders, routines, conversations, model: oldImplicitOllama ? normalizeModelSettings(undefined) : model };
}

type WorkspaceContextValue = WorkspaceData & {
  ready: boolean;
  storageProblem: string | null;
  createAgent: (input: Pick<Agent, 'name' | 'role' | 'goal' | 'color'> & Partial<Pick<Agent, 'character' | 'phases' | 'skillIds' | 'branchId' | 'managerId'>>) => string;
  updateCompanyName: (name: string) => void;
  createBranch: (input: Omit<CompanyBranch, 'id' | 'createdAt'>) => string;
  createCompanyTask: (request: string) => string;
  updateCompanyTask: (id: string, patch: Partial<Pick<CompanyTask, 'status' | 'agentRuns' | 'error'>>) => void;
  createSkill: (input: Omit<Skill, 'id' | 'createdAt'>) => void;
  deleteSkill: (id: string) => void;
  createFounder: (input: Omit<FounderProfile, 'id' | 'createdAt'>) => void;
  updateFounder: (id: string, input: Omit<FounderProfile, 'id' | 'createdAt'>) => void;
  deleteFounder: (id: string) => void;
  toggleAgentSkill: (agentId: string, skillId: string) => void;
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
  const [storageProblem, setStorageProblem] = useState<string | null>(null);
  const hydrated = useRef(false);
  const persistenceEnabled = useRef(false);
  const pendingUpdates = useRef<((current: WorkspaceData) => WorkspaceData)[]>([]);

  const updateWorkspace = useCallback((update: (current: WorkspaceData) => WorkspaceData) => {
    if (!hydrated.current) {
      pendingUpdates.current.push(update);
      return;
    }
    setData(update);
  }, []);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (!alive) return;
      let loadedData = initialWorkspace;
      let canPersist = true;
      if (saved) {
        try {
          const parsed: unknown = JSON.parse(saved);
          if (isRecord(parsed)) {
            const collectionKeys = ['agents', 'branches', 'companyTasks', 'founders', 'routines', 'skills'];
            const validCollections = collectionKeys.every((key) => parsed[key] === undefined || Array.isArray(parsed[key]));
            const validObjects = ['conversations', 'model'].every((key) => parsed[key] === undefined || isRecord(parsed[key]));
            canPersist = validCollections && validObjects;
            loadedData = normalizeWorkspace(parsed);
          } else canPersist = false;
        } catch {
          canPersist = false;
        }
      }
      const queuedUpdates = pendingUpdates.current.splice(0);
      if (queuedUpdates.length) {
        loadedData = queuedUpdates.reduce((current, update) => update(current), loadedData);
      }
      persistenceEnabled.current = canPersist;
      setStorageProblem(canPersist ? null : 'Saved workspace data could not be read safely. Autosaving is paused to protect it. Reload to retry, or reset this device’s workspace in Settings.');
      setData(loadedData);
      hydrated.current = true;
      setReady(true);
    }).catch(() => {
      if (!alive) return;
      const queuedUpdates = pendingUpdates.current.splice(0);
      if (queuedUpdates.length) {
        setData(queuedUpdates.reduce((current, update) => update(current), initialWorkspace));
      }
      persistenceEnabled.current = false;
      setStorageProblem('Saved workspace data could not be read. Autosaving is paused to protect it. Reload to retry, or reset this device’s workspace in Settings.');
      hydrated.current = true;
      setReady(true);
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (hydrated.current && persistenceEnabled.current) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => undefined);
  }, [data]);

  const createAgent = useCallback((input: Pick<Agent, 'name' | 'role' | 'goal' | 'color'> & Partial<Pick<Agent, 'character' | 'phases' | 'skillIds' | 'branchId' | 'managerId'>>) => {
    const id = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const phases = (input.phases ?? defaultAgentPhases).map((phase) => phase.trim()).filter(Boolean).slice(0, 6);
    updateWorkspace((current) => {
      const branchId = current.branches.some((branch) => branch.id === input.branchId) ? input.branchId : current.branches[0]?.id ?? '';
      const managerId = current.agents.some((agent) => agent.id === input.managerId && agent.branchId === branchId) ? input.managerId : undefined;
      return {
        ...current,
        agents: [{ ...input, branchId, managerId, skillIds: (input.skillIds ?? []).filter((skillId) => current.skills.some((skill) => skill.id === skillId)).slice(0, 10), phases: phases.length ? phases : defaultAgentPhases, id, createdAt: 'Just now' }, ...current.agents],
        conversations: { ...current.conversations, [id]: [{ id: `${id}-welcome`, role: 'assistant', content: `I’m ${input.name}. I’m ready to help with ${input.goal.toLowerCase()}`, createdAt: 'Just now' }] },
      };
    });
    return id;
  }, [updateWorkspace]);

  const updateCompanyName = useCallback((name: string) => {
    const companyName = name.trim().slice(0, 100);
    if (companyName) updateWorkspace((current) => ({ ...current, companyName }));
  }, [updateWorkspace]);

  const createBranch = useCallback((input: Omit<CompanyBranch, 'id' | 'createdAt'>) => {
    const id = `branch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    updateWorkspace((current) => ({ ...current, branches: [...current.branches, { ...input, id, createdAt: 'Just now' }] }));
    return id;
  }, [updateWorkspace]);

  const createCompanyTask = useCallback((request: string) => {
    const id = `work-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    updateWorkspace((current) => ({ ...current, companyTasks: [{ id, request: request.trim().slice(0, 5000), createdAt: 'Just now', status: 'routing' as const, agentRuns: [] }, ...current.companyTasks].slice(0, 100) }));
    return id;
  }, [updateWorkspace]);

  const updateCompanyTask = useCallback((id: string, patch: Partial<Pick<CompanyTask, 'status' | 'agentRuns' | 'error'>>) => {
    updateWorkspace((current) => ({ ...current, companyTasks: current.companyTasks.map((task) => task.id === id ? { ...task, ...patch } : task) }));
  }, [updateWorkspace]);

  const createSkill = useCallback((input: Omit<Skill, 'id' | 'createdAt'>) => {
    updateWorkspace((current) => ({ ...current, skills: [{ ...input, id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: 'Just now' }, ...current.skills] }));
  }, [updateWorkspace]);

  const deleteSkill = useCallback((id: string) => {
    updateWorkspace((current) => ({
      ...current,
      skills: current.skills.filter((skill) => skill.id !== id),
      agents: current.agents.map((agent) => ({ ...agent, skillIds: (agent.skillIds ?? []).filter((skillId) => skillId !== id) })),
      founders: current.founders.map((founder) => ({ ...founder, skillIds: founder.skillIds.filter((skillId) => skillId !== id) })),
    }));
  }, [updateWorkspace]);

  const createFounder = useCallback((input: Omit<FounderProfile, 'id' | 'createdAt'>) => {
    updateWorkspace((current) => ({
      ...current,
      founders: [{ ...input, skillIds: input.skillIds.filter((skillId) => current.skills.some((skill) => skill.id === skillId)).slice(0, 20), id: `founder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: 'Just now' }, ...current.founders],
    }));
  }, [updateWorkspace]);

  const updateFounder = useCallback((id: string, input: Omit<FounderProfile, 'id' | 'createdAt'>) => {
    updateWorkspace((current) => ({
      ...current,
      founders: current.founders.map((founder) => founder.id !== id ? founder : {
        ...founder,
        ...input,
        skillIds: input.skillIds.filter((skillId) => current.skills.some((skill) => skill.id === skillId)).slice(0, 20),
      }),
    }));
  }, [updateWorkspace]);

  const deleteFounder = useCallback((id: string) => {
    updateWorkspace((current) => ({ ...current, founders: current.founders.filter((founder) => founder.id !== id) }));
  }, [updateWorkspace]);

  const toggleAgentSkill = useCallback((agentId: string, skillId: string) => {
    updateWorkspace((current) => {
      if (!current.skills.some((skill) => skill.id === skillId)) return current;
      return { ...current, agents: current.agents.map((agent) => {
        if (agent.id !== agentId) return agent;
        const assigned = agent.skillIds ?? [];
        return { ...agent, skillIds: assigned.includes(skillId) ? assigned.filter((id) => id !== skillId) : assigned.length < 10 ? [...assigned, skillId] : assigned };
      }) };
    });
  }, [updateWorkspace]);

  const addMessage = useCallback((agentId: string, message: AgentMessage) => {
    updateWorkspace((current) => ({ ...current, conversations: { ...current.conversations, [agentId]: [...(current.conversations[agentId] ?? []), message] } }));
  }, [updateWorkspace]);

  const createRoutine = useCallback((input: Omit<Routine, 'id' | 'enabled'>) => {
    updateWorkspace((current) => ({ ...current, routines: [{ ...input, id: `routine-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, enabled: true }, ...current.routines] }));
  }, [updateWorkspace]);

  const toggleRoutine = useCallback((id: string) => {
    updateWorkspace((current) => ({ ...current, routines: current.routines.map((routine) => routine.id === id ? { ...routine, enabled: !routine.enabled } : routine) }));
  }, [updateWorkspace]);

  const saveModel = useCallback((model: ModelSettings) => updateWorkspace((current) => ({ ...current, model })), [updateWorkspace]);
  const resetWorkspace = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    persistenceEnabled.current = true;
    setStorageProblem(null);
    updateWorkspace(() => initialWorkspace);
  }, [updateWorkspace]);

  const value = useMemo(() => ({ ...data, ready, storageProblem, createAgent, updateCompanyName, createBranch, createCompanyTask, updateCompanyTask, createSkill, deleteSkill, createFounder, updateFounder, deleteFounder, toggleAgentSkill, addMessage, createRoutine, toggleRoutine, saveModel, resetWorkspace }), [data, ready, storageProblem, createAgent, updateCompanyName, createBranch, createCompanyTask, updateCompanyTask, createSkill, deleteSkill, createFounder, updateFounder, deleteFounder, toggleAgentSkill, addMessage, createRoutine, toggleRoutine, saveModel, resetWorkspace]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return context;
}
