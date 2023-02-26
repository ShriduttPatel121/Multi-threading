const { Worker } = require("worker_threads");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const LIBUV_THREADS = 8;

function calculateCount() {
    return new Promise((resolve, reject) => {
        let counter = 0;
        for (let i = 0; i < 20_000_000_000; i++) {
            counter++;
        }
        resolve(counter);
    });
}

function createCounterWorker() {
    return new Promise(function(resolve, reject) {
        const worker = new Worker("./worker.js", {
            workerData: {
                thread_count: LIBUV_THREADS
            }
        });
        worker.on("message", (counter) => {
            resolve(counter);
        });

        worker.on("error", (error) => {
            reject(error);
        })
    });
}

app.get("/non-blocking/", (req, res) => {
    console.log("🚀 ~ file: app.js:17 ~ app.get ~ req:")
    res.status(200).send("This page is non-blocking");
});

app.get("/blocking", async (req, res) => {
    try {
        const counterPromises = [];
        console.log("🚀 ~ file: app.js:43 ~ app.get ~ LIBUV_THREADS:", LIBUV_THREADS);
        for (let i = 0; i < LIBUV_THREADS; i++) {
            counterPromises.push(createCounterWorker());
        }
        const start = Date.now();
        const resultArr = await Promise.all(counterPromises);
        const end = Date.now();
        console.log("PROCESS TIMING: ====>  ", end - start, "😎😎");
        return res.status(200).send(`Counter calculated in 😇😎😎 ${resultArr.reduce((acc, curVal) => acc + curVal, 0)}`);
    } catch(error) {
        return res.status(500).send("Counter request failed 😱😱😱")
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});