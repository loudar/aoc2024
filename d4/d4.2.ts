const script = import.meta.filename;
const inputFile = script.split(".")[0] + ".txt";
const input = Bun.file(inputFile);

const text = await input.text();

function run() {
    const start = performance.now();
    let sum = 0;
    const xmas = "MAS";
    const xrev = "SAM";
    const padding = xmas.length - 1;

    const lines = text.split("\r\n");
    for (let y = 0; y < lines.length; y++) {
        const line = lines[y];
        for (let x = 0; x < line.length; x++) {
            if (y < lines.length - padding) {
                if (x < line.length - padding) { // only search for diagonal occurrences if there's enough space
                    const matches = [0, 0, 0, 0];
                    const rightX = x + padding;
                    for (let i = 0; i < xmas.length; i++) {
                        if (lines[y + i][x + i] === xmas[i]) {
                            matches[0]++;
                        }
                        if (lines[y + i][x + i] === xrev[i]) {
                            matches[1]++;
                        }
                        if (lines[y + i][rightX - i] === xmas[i]) {
                            matches[2]++;
                        }
                        if (lines[y + i][rightX - i] === xrev[i]) {
                            matches[3]++;
                        }
                    }
                    if (matches[0] === xmas.length || matches[1] === xmas.length) {
                        if (matches[2] === xmas.length || matches[3] === xmas.length) {
                            sum++;
                        }
                    }
                }
            }
        }
    }

    const diff = performance.now() - start;
    return {
        result: sum,
        time: diff
    }
}

console.log(script.replace(".txt", "").split("\\").at(-1));
const { result, time } = run();
console.log(`Result: ${result}`);
console.log("Measuring...");

let sumTime = 0;
const runCount = 1000;
for (let i = 0; i < runCount; i++) {
    const runTime = run().time;
    sumTime += runTime;
}
console.log((sumTime / runCount).toFixed(2) + "ms per run");
