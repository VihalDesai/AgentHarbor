const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('agentHarbor', {
  complete: (payload) => ipcRenderer.invoke('agentharbor:model', payload),
  hasApiKey: (provider) => ipcRenderer.invoke('agentharbor:key:has', provider),
  setApiKey: (provider, key) => ipcRenderer.invoke('agentharbor:key:set', provider, key),
  removeApiKey: (provider) => ipcRenderer.invoke('agentharbor:key:remove', provider),
});
