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
    autoHideMenuBar: true,
    backgroundColor: "#0a0a0a",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Remove the default menu bar entirely
  Menu.setApplicationMenu(null);
  try {
    win.removeMenu();
  } catch (e) {
    // removeMenu is unavailable on older Electron versions
  }

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
