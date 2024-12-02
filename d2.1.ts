const script = import.meta.filename;
const inputFile = script.split(".")[0] + ".txt";
const input = Bun.file(inputFile);

const text = await input.text();

function run() {
    const start = performance.now();
    const lines = text.split("\r\n");

    let safe = 0;
    reports: for (let i = 0; i < lines.length; i++) {
        const levels = lines[i].split(" ").map(i => parseInt(i));
        let lineSign = 0;
        for (let j = 0; j < levels.length - 1; j++) {
            const diff = levels[j] - levels[j + 1];
            const abs = Math.abs(diff);
            if (abs > 3 || abs === 0) {
                continue reports;
            }
            const sign = Math.sign(diff);
            if (lineSign !== 0 && sign != lineSign) {
                continue reports;
            }
            if (lineSign === 0) {
                lineSign = sign;
            }
        }
        safe++;
    }

    const diff = performance.now() - start;
    return {
        result: safe,
        time: diff
    }
}

console.log(script.replace(".txt", "").split("\\").at(-1));
const { result, time } = run();
console.log(`Result: ${result}`);
console.log("Measuring...");

let sumTime = 0;
const runCount = 10000;
for (let i = 0; i < runCount; i++) {
    const runTime = run().time;
    sumTime += runTime;
}
console.log((sumTime / runCount).toFixed(2) + "ms per run");
