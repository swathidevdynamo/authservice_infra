import express from 'express';

// Import the provision script
import { provision } from './scripts/provision.js';
import logger from './utils/logger.js';

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("Identity Provider Initialization Service is running");
})

const PORT = process.env.PORT || 5000; 
app.listen(PORT, async () => {
    try {
        await provision();
        logger.info(`Initialization completed successfully. Service running on port ${PORT}`);
    } catch (error) {
        logger.error('Initialization failed:', error);
        process.exit(1);
    }
});