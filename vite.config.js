import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createMotionRelay } from './server/motion-relay.mjs'

const certDir = path.resolve('.cert');
const httpsKeyPath = path.join(certDir, 'motion-lab-local-key.pem');
const httpsCertPath = path.join(certDir, 'motion-lab-local-cert.pem');

const getLanAddresses = () => Object.values(os.networkInterfaces())
  .flat()
  .filter(Boolean)
  .filter(address => address.family === 'IPv4' && !address.internal)
  .map(address => address.address);

const getHttpsOptions = () => {
  if (!fs.existsSync(httpsKeyPath) || !fs.existsSync(httpsCertPath)) {
    return false;
  }

  return {
    key: fs.readFileSync(httpsKeyPath),
    cert: fs.readFileSync(httpsCertPath),
  };
};

const motionRelayPlugin = () => ({
  name: 'motion-relay',
  configureServer(server) {
    const getOrigins = () => {
      const serverAddress = server.httpServer?.address();
      const configuredPort = server.config.server.port;
      const port = typeof serverAddress === 'object' && serverAddress?.port
        ? serverAddress.port
        : configuredPort || 5173;
      const protocol = server.config.server.https ? 'https' : 'http';
      const lanOrigins = getLanAddresses().map(address => `${protocol}://${address}:${port}`);

      return {
        localOrigin: `${protocol}://localhost:${port}`,
        lanOrigins,
        preferredOrigin: lanOrigins[0] || `${protocol}://localhost:${port}`,
        secure: protocol === 'https',
      };
    };

    const relay = createMotionRelay({ getOrigins });
    server.middlewares.use(relay.handleRequest);
    server.httpServer?.on('upgrade', relay.handleUpgrade);
    server.httpServer?.once('close', relay.close);
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), motionRelayPlugin()],
  base: '/',
  server: {
    host: '0.0.0.0',
    https: getHttpsOptions(),
  },
  build: {
    chunkSizeWarningLimit: 550,
  },
})
