const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('workspaceAPI', {
  openWorkspace: (id, url) => ipcRenderer.invoke('workspace:open', { id, url }),
  hideWorkspace: () => ipcRenderer.invoke('workspace:hide'),
  translate: (text) => ipcRenderer.invoke('translate:text', text)
});
