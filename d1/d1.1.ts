const script = import.meta.filename;
const inputFile = script.split(".")[0] + ".txt";
const input = Bun.file(inputFile);

const text = await input.text();

function run() {
    const start = performance.now();

    const lineLength = 15;
    const lines = Math.round(text.length / lineLength);
    const contentLength = lineLength - 2;
    const first = Array(lines);
    const second = Array(lines);

    for (let i = 0; i < lines; i++) {
        const line = text.substring(i * lineLength, (i * lineLength) + contentLength);
        first[i] = parseInt(line.slice(0, 5));
        second[i] = parseInt(line.slice(8));
    }

    first.sort();
    second.sort();

    let sum = 0;
    for (let i = 0; i < lines; i++) {
        sum += Math.abs(first[i] - second[i]);
    }

    const diff = performance.now() - start;
    return {
        result: sum,
        time: diff
    }
}

console.log(script.replace(".txt", "").split("\\").at(-1));
const { result, time } = run();
console.log(`Sum: ${result}`);
console.log("Measuring...");

let sumTime = 0;
const runCount = 10000;
for (let i = 0; i < runCount; i++) {
    const runTime = run().time;
    sumTime += runTime;
}
console.log((sumTime / runCount).toFixed(2) + "ms per run");
