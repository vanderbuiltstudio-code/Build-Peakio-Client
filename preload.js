const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('peakio', {
  toggleFps: () => ipcRenderer.invoke('toggle-fps'),
  getFpsState: () => ipcRenderer.invoke('get-fps-state'),
  onFpsState: (cb) => ipcRenderer.on('fps-state', (_e, state) => cb(state))
});
