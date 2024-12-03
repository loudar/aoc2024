const script = import.meta.filename;
const inputFile = script.split(".")[0] + ".txt";
const input = Bun.file(inputFile);

const text = await input.text();

function run() {
    const start = performance.now();

    const matches = text.match(/(mul\(\d+,\d+\))/gm);
    if (!matches) {
        throw new Error("No matches found");
    }

    let sum = 0;
    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const commaIndex = match.indexOf(",");
        sum += parseInt(match.substring(4, commaIndex)) * parseInt(match.substring(commaIndex + 1, match.length - 1));
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
const runCount = 10000;
for (let i = 0; i < runCount; i++) {
    const runTime = run().time;
    sumTime += runTime;
}
console.log((sumTime / runCount).toFixed(2) + "ms per run");
