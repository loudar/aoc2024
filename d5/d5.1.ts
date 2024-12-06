const script = import.meta.filename;
const inputFile = script.split(".")[0] + ".txt";
const input = Bun.file(inputFile);

const text = await input.text();

function run() {
    const start = performance.now();
    const lines = text.split("\r\n");
    const emptyLineIndex = lines.indexOf("");
    const rules = lines.slice(0, emptyLineIndex).map(l => l.split("|").map(sn => parseInt(sn)));
    const updates = lines.slice(emptyLineIndex + 1);
    let sum = 0;

    updates: for (const update of updates) {
        const numbers = update.split(",").map(n => parseInt(n));
        const relevantRules = rules.filter(r => r.every(rn => numbers.includes(rn)));

        for (const rule of relevantRules) {
            const aIndex = numbers.indexOf(rule[0]);
            const bIndex = numbers.indexOf(rule[1]);
            if (bIndex < aIndex) {
                continue updates;
            }
        }
        const middle = numbers[Math.floor(numbers.length / 2)]
        sum += middle;
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
