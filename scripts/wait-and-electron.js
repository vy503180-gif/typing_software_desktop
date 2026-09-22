const { exec } = require("child_process");
const http = require("http");

const PORT = 8081;
const MAX_WAIT = 60000;
const startTime = Date.now();

function checkServer() {
  const req = http.get(`http://localhost:${PORT}`, (res) => {
    if (res.statusCode === 200) {
      console.log("Server is ready. Starting Electron...");
      const electron = exec("npx electron electron.js", { cwd: path.join(__dirname, "..") });
      electron.stdout.pipe(process.stdout);
      electron.stderr.pipe(process.stderr);
      electron.on("close", () => process.exit());
    } else {
      retry();
    }
  });
  req.on("error", retry);
  req.setTimeout(2000, () => { req.destroy(); retry(); });
}

function retry() {
  if (Date.now() - startTime > MAX_WAIT) {
    console.error("Server did not start within 60 seconds");
    process.exit(1);
  }
  setTimeout(checkServer, 2000);
}

console.log(`Waiting for Expo server on port ${PORT}...`);
checkServer();
