module.exports = {
  server: {
    command: 'npm run preview',
    port: 4173,
    host: '127.0.0.1',       // Force Jest-Puppeteer to look at IPv4
    launchTimeout: 45000,    // Give it 45 seconds to spin up safely
    usedPortAction: 'error', // Crash immediately if the port is accidentally trapped by an old process
  },
  launch: {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
};