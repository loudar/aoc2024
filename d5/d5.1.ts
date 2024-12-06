const script = import.meta.filename;
const inputFile = script.split(".")[0] + ".txt";
const input = Bun.file(inputFile);

const text = await input.text();

function run() {
    const start = performance.now();
    const lines = text.split("\r\n");
    const emptyLineIndex = lines.indexOf("");
    const ruleMap = new Map<number, Map<number, boolean>>();
    for (let i = emptyLineIndex; i < lines.length; i++) {
        const rule = lines[i].split("|").map(sn => parseInt(sn));
        if (!ruleMap.has(rule[0])) {
            ruleMap.set(rule[0], new Map<number, boolean>());
        }
        ruleMap.get(rule[0])!.set(rule[1], true);
    }
    const updates = lines.slice(emptyLineIndex + 1);
    let sum = 0;

    updates: for (const update of updates) {
        const numbers = update.split(",").map(n => parseInt(n));

        for (let i = 0; i < numbers.length; i++) {
            if (ruleMap.get(numbers[i + 1])?.has(numbers[i])) {
                const middle = numbers[Math.floor(numbers.length / 2)];
                sum += middle;
                continue updates;
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
