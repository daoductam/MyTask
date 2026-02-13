const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let backendProcess;
let tray = null;

// Replace isDev with !app.isPackaged for better reliability
const isDev = !app.isPackaged;

// Path to the backend JAR
// In dev: Point to the Maven target directory
// In prod: Point to the resources directory inside the app
const getBackendJarPath = () => {
    if (isDev) {
        return path.join(__dirname, '..', '..', 'my-task-be', 'target', 'my-task-be-0.0.1-SNAPSHOT.jar');
    }
    return path.join(process.resourcesPath, 'backend', 'my-task-be.jar');
};

const startBackend = () => {
    const jarPath = getBackendJarPath();
    console.log('Starting backend from:', jarPath);

    if (fs.existsSync(jarPath)) {
        backendProcess = spawn('java', ['-jar', jarPath]);

        backendProcess.stdout.on('data', (data) => {
            console.log(`Backend: ${data}`);
        });

        backendProcess.stderr.on('data', (data) => {
            console.error(`Backend Error: ${data}`);
        });

        backendProcess.on('close', (code) => {
            console.log(`Backend process exited with code ${code}`);
        });
    } else {
        console.error('Backend JAR not found at:', jarPath);
    }
};

const killBackend = () => {
    if (backendProcess) {
        console.log('Кilling backend process...');
        backendProcess.kill();
        backendProcess = null;
    }
};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "LifeDash",
        icon: path.join(__dirname, 'assets', 'icon.png'), // Need to add an icon later
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
        },
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Open DevTools for debugging
    mainWindow.webContents.openDevTools();

    // Minimize to tray logic
    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
}

// Create Tray Icon
function createTray() {
    // Requires an icon file. For now we will skip if icon missing or use simple setup
    // const iconPath = path.join(__dirname, 'assets', 'icon.png');
    // tray = new Tray(iconPath);
    // const contextMenu = Menu.buildFromTemplate([
    //     { label: 'Show App', click: () => mainWindow.show() },
    //     { label: 'Quit', click: () => {
    //         app.isQuiting = true;
    //         app.quit();
    //     }}
    // ]);
    // tray.setToolTip('LifeDash');
    // tray.setContextMenu(contextMenu);
    // tray.on('click', () => mainWindow.show());
}

app.whenReady().then(() => {
    startBackend();
    createWindow();
    // createTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('before-quit', () => {
    killBackend();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
