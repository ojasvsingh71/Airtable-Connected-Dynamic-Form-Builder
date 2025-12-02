require('dotenv').config();
const app = require('./app');
const connectDb = require('./config/db');


const PORT = process.env.PORT || 4000;


connectDb().then(() => {
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
            const alt = Number(PORT) + 1;
            console.warn(`Port ${PORT} in use — trying ${alt}`);
            // attempt to listen on alternate port
            try {
                app.listen(alt, () => console.log(`Server running on port ${alt}`));
            } catch (e) {
                console.error('Failed to bind alternate port', e);
                process.exit(1);
            }
        } else {
            console.error('Server error', err);
            process.exit(1);
        }
    });
}).catch(err => {
    console.error('Failed to connect DB', err);
    process.exit(1);
});