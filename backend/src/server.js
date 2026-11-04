require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const app = require('./app');

// Keep this aligned with frontend/vite.config.js proxy target (default 5001).
const PORT = Number(process.env.PORT) || 5001;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other process or set PORT to an available port and update the Vite proxy target.`);
    } else {
        console.error('Failed to start backend:', error);
    }
    process.exitCode = 1;
});
