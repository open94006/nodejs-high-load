import express from 'express';
import { monitorEventLoopDelay } from 'node:perf_hooks';

const loopDelay = monitorEventLoopDelay({ resolution: 10 });
loopDelay.enable();

const app = express.Router();

app.get('/metrics', (_req, res) => {
    res.json({
        pid: process.pid,
        loopLagMs: {
            mean: loopDelay.mean / 1e6,
            p99: loopDelay.percentile(99) / 1e6,
            max: loopDelay.max / 1e6,
        },
        rssMB: process.memoryUsage().rss / 1e6,
        cpu: process.cpuUsage(),
    });
    loopDelay.reset(); // 每次讀取後歸零，看到的是「這段時間」的數字
});

export default app;
