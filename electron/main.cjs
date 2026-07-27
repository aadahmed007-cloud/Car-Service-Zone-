const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const iconPath = path.join(__dirname, '..', 'build', 'icon.ico');

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    autoHideMenuBar: true,
    ...(fs.existsSync(iconPath) ? { icon: iconPath } : {}),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // شريط القوائم (File/Edit/View) مش محتاجينه في تطبيق إداري داخلي
  Menu.setApplicationMenu(null);

  // تحميل نسخة الـ build النهائية (اللي بيطلعها "npm run build")
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  // لو حبيت تفتح أدوات المطور للتصحيح، شيل التعليق عن السطر ده:
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
