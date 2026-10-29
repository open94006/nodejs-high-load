import express from 'express';
import cors from 'cors';
import testRouter from './routes/test.route.js';
import metricsRouter from './routes/metrics.route.js';
import orderRouter from './routes/order.route.js';

const app = express();
const PORT = 5100;

const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(testRouter);
app.use(metricsRouter);
app.use(orderRouter);

app.listen(PORT, () => {
    console.log(`[pid ${process.pid}] Server is running at http://localhost:${PORT}`);
});
