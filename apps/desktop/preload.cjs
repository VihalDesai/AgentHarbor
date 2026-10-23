const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('agentHarbor', {
  complete: (payload) => ipcRenderer.invoke('agentharbor:model', payload),
});
