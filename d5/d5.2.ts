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
    const badUpdates = [];

    updates: for (const update of updates) {
        const numbers = update.split(",").map(n => parseInt(n));
        const relevantRules = rules.filter(r => r.every(rn => numbers.includes(rn)));

        for (const rule of relevantRules) {
            const aIndex = numbers.indexOf(rule[0]);
            const bIndex = numbers.indexOf(rule[1]);
            if (bIndex < aIndex) {
                badUpdates.push({relevantRules, numbers});
                continue updates;
            }
        }
    }

    for (const {relevantRules, numbers} of badUpdates) {
        for (let i = 0; i < numbers.length; i++) {
            let swapped = true, hasSwapped = false;
            while (swapped) {
                swapped = false;
                const rule = relevantRules.find(rn => rn[1] === numbers[i] && rn[0] === numbers[i + 1]);
                if (rule) {
                    numbers[i] = rule[0];
                    numbers[i + 1] = rule[1];
                    swapped = true;
                    hasSwapped = true;
                }
            }
            if (hasSwapped) {
                i = -1;
            }
        }

        const middle = numbers[Math.floor(numbers.length / 2)];
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
/*
let sumTime = 0;
const runCount = 1000;
for (let i = 0; i < runCount; i++) {
    const runTime = run().time;
    sumTime += runTime;
}
console.log((sumTime / runCount).toFixed(2) + "ms per run");
*/