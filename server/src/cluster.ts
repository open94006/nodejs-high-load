import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';

// 核心數
const WORKERS = Number(process.env.WORKERS ?? 4);

if (cluster.isPrimary) {
    console.log(`primary ${process.pid}：啟動 ${WORKERS} 個 worker（本機共 ${availableParallelism()} 核）`);

    for (let i = 0; i < WORKERS; i++) cluster.fork();

    // worker 掛掉就無條件重啟；如果啟動時就失敗（例如 DB 連不上）會不停重啟，正式環境要加次數限制
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} 結束（code=${code}, signal=${signal}），重新啟動`);
        cluster.fork();
    });
} else {
    // 直接載入原本的 app，app.listen(5100) 會自動共用同一個 port
    await import('./index.js');
}
