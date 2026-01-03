const { contextBridge, ipcRenderer } = require('electron');

console.log('=== PRELOAD SCRIPT STARTING ===');
console.log('contextBridge available:', typeof contextBridge);
console.log('ipcRenderer available:', typeof ipcRenderer);

try {
  contextBridge.exposeInMainWorld('electronAPI', {
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    selectFile: (filters) => ipcRenderer.invoke('select-file', filters),
    saveFile: (defaultPath) => ipcRenderer.invoke('save-file', defaultPath),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
    openExternal: (url) => ipcRenderer.invoke('open-external', url)
  });

  console.log('✓ electronAPI successfully exposed to renderer');
} catch (error) {
  console.error('✗ Failed to expose electronAPI:', error);
}

console.log('=== PRELOAD SCRIPT COMPLETED ===');