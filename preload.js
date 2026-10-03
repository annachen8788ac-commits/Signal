const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('signalMulti', {
  listProfiles: () => ipcRenderer.invoke('profiles:list'),
  createProfile: payload => ipcRenderer.invoke('profiles:create', payload),
  deleteProfile: id => ipcRenderer.invoke('profiles:delete', id),
  startProfile: id => ipcRenderer.invoke('profiles:start', id),
  stopProfile: id => ipcRenderer.invoke('profiles:stop', id),
  stopAll: () => ipcRenderer.invoke('profiles:stopAll'),
  openProfileFolder: id => ipcRenderer.invoke('profiles:openFolder', id),
  chooseExecutable: () => ipcRenderer.invoke('profiles:chooseExecutable'),
  setProfileExecutable: (id, exe) => ipcRenderer.invoke('profiles:setExecutable', { id, exe }),
  openExternal: url => ipcRenderer.invoke('openExternal', url),
  onProfileStateChanged: callback => ipcRenderer.on('profiles:changed', () => callback())
});
