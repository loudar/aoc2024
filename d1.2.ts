const script = import.meta.filename;
const inputFile = script.split(".")[0] + ".txt";
const input = Bun.file(inputFile);

const text = await input.text();

function run() {
    const start = performance.now();
    const lines = text.split("\r\n");

    const list: number[] = Array.from([]);
    const counts = new Map<number, number>();

    for (let i = 0; i < lines.length; i++) {
        list.push(parseInt(lines[i].slice(0, 5)));
        const second = parseInt(lines[i].slice(8));
        counts.set(second, (counts.get(second) ?? 0) + 1);
    }

    let sum = 0;
    for (let i = 0; i < lines.length; i++) {
        sum += list[i] * (counts.get(list[i]) ?? 0);
    }
    return {
        result: sum,
        time: performance.now() - start
    };
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
