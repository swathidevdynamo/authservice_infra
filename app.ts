import express from 'express';

// Import the provision script
import { provision } from './scripts/provision.js';
import logger from './utils/logger.js';

const app = express();

app.use(express.json());

// Readiness state
let provisioned = false;
let lastProvisionedAt: string | undefined;

// The '/healthz' endpoint is used for readiness checks by other services.
app.get("/healthz", (_req, res) => {
  if (provisioned) {
    return res.status(200).json({ status: 'ready', provisioned: true, lastProvisionedAt });
  }
  return res.status(503).json({ status: 'not-ready', provisioned: false });
});

const PORT = process.env.PORT || 5000; 
app.listen(PORT, async () => {
  try {
    await provision();
    provisioned = true;
    lastProvisionedAt = new Date().toISOString();
    logger.info(`Initialization completed successfully. Service running on port ${PORT}`);
  } catch (error) {
    logger.error('Initialization failed:', error);
    process.exit(1);
  }
});