const script = import.meta.filename;
const inputFile = script.split(".")[0] + ".txt";
const input = Bun.file(inputFile);

const text = await input.text();

function run() {
    const start = Bun.nanoseconds();
    const lines = text.split("\r\n");
    const emptyLineIndex = lines.indexOf("");
    const ruleMap = new Map<number, Map<number, boolean>>();
    for (let i = 0; i < emptyLineIndex; i++) {
        const rule = lines[i].split("|").map(sn => parseInt(sn));
        if (!ruleMap.has(rule[0])) {
            ruleMap.set(rule[0], new Map<number, boolean>());
        }
        ruleMap.get(rule[0])!.set(rule[1], true);
    }
    const updates = lines.slice(emptyLineIndex + 1);
    let sum = 0;

    for (const update of updates) {
        const numbers = update.split(",").map(n => parseInt(n));
        let isBad = false;

        for (let i = 0; i < numbers.length; i++) {
            let swapped = true, hasSwapped = false;
            while (swapped) {
                swapped = false;
                if (ruleMap.get(numbers[i + 1])?.has(numbers[i])) {
                    const cache = numbers[i];
                    numbers[i] = numbers[i + 1];
                    numbers[i + 1] = cache;
                    swapped = true;
                    hasSwapped = true;
                    isBad = true;
                }
            }
            if (hasSwapped) {
                i = -1;
            }
        }
        if (isBad) {
            const middle = numbers[Math.floor(numbers.length / 2)];
            sum += middle;
        }
    }

    const diff = Bun.nanoseconds() - start;
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
console.log((sumTime / runCount / 1000 / 1000).toFixed(2) + "ms per run");
