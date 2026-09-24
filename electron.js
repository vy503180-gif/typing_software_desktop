const { app, BrowserWindow, Menu, protocol, net } = require("electron");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

const isDev = !app.isPackaged;

protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

function createWindow() {
  // In packaged app, unpacked assets are outside asar
  let iconPath;
  if (isDev) {
    iconPath = path.join(__dirname, "assets", "icon.ico");
  } else {
    // electron-builder unpacks these to resources/app.asar.unpacked/
    iconPath = path.join(path.dirname(app.getPath("exe")), "resources", "app.asar.unpacked", "assets", "icon.ico");
    // Fallback if above doesn't work
    const fs = require("fs");
    if (!fs.existsSync(iconPath)) {
      iconPath = path.join(__dirname, "assets", "icon.ico");
    }
  }

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    resizable: true,
    icon: iconPath,
    title: "Antriksh Typing Master",
    autoHideMenuBar: false,
    backgroundColor: "#0a0a0a",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Custom menu bar with app name
  const menuTemplate = [
    {
      label: "Antriksh Typing Master",
      submenu: [
        { label: "About Antriksh Typing Master", role: "about" },
        { type: "separator" },
        { label: "Quit", accelerator: "CmdOrCtrl+Q", click: () => app.quit() },
      ],
    },
    {
      label: "View",
      submenu: [
        { label: "Reload", accelerator: "CmdOrCtrl+R", click: () => win.reload() },
        { label: "Toggle Developer Tools", accelerator: "F12", click: () => win.webContents.toggleDevTools() },
        { type: "separator" },
        { label: "Actual Size", accelerator: "CmdOrCtrl+0", click: () => win.webContents.setZoomLevel(0) },
        { label: "Zoom In", accelerator: "CmdOrCtrl+=", click: () => win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 0.5) },
        { label: "Zoom Out", accelerator: "CmdOrCtrl+-", click: () => win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 0.5) },
        { type: "separator" },
        { label: "Toggle Full Screen", accelerator: "F11", click: () => win.setFullScreen(!win.isFullScreen()) },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Set window icon
  try {
    win.setIcon(iconPath);
  } catch (e) {
    // Icon setting might fail, that's ok
  }

  // Load app
  if (isDev) {
    win.loadURL("http://localhost:8081");
  } else {
    win.loadURL("app://bundle/index.html");
  }
}

app.whenReady().then(() => {
  // Serve the web build via a custom app:// scheme so that absolute
  // asset paths (e.g. /assets/... used by @expo/vector-icons fonts)
  // resolve correctly instead of breaking under file://.
  const distDir = path.join(__dirname, "dist");
  protocol.handle("app", (request) => {
    const url = new URL(request.url);
    let rel = decodeURIComponent(url.pathname);
    if (rel === "/" || rel === "") rel = "/index.html";
    let filePath = path.join(distDir, rel.replace(/^\/+/, ""));
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, "index.html");
    }
    return net.fetch(pathToFileURL(filePath).toString());
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
