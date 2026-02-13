const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // Expose APIs here if needed, e.g. for native notifications or system info
    // sendNotification: (title, body) => ipcRenderer.send('notify', { title, body })
});
