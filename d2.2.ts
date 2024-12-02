const script = import.meta.filename;
const inputFile = script.split(".")[0] + ".txt";
const input = Bun.file(inputFile);

const text = await input.text();

function run() {
    const start = performance.now();
    const lines = text.split("\r\n");

    let safe = 0;
    reports: for (let i = 0; i < lines.length; i++) {
        let levels = lines[i].split(" ").map(i => parseInt(i));
        const originalLevels = [...levels];
        let removedIndex = -1;
        let lineSign = 0;
        let count = levels.length - 1;

        for (let j = 0; j < count; j++) {
            const diff = levels[j] - levels[j + 1];
            const abs = Math.abs(diff);
            const sign = Math.sign(diff);

            if (abs > 3 || abs === 0 || (lineSign !== 0 && sign != lineSign)) {
                if (removedIndex < levels.length) {
                    removedIndex += 1;
                    levels = originalLevels.toSpliced(removedIndex, 1);
                    count = levels.length - 1;
                    j = -1;
                    lineSign = 0;
                    continue;
                } else {
                    continue reports;
                }
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
