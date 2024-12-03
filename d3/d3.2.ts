const script = import.meta.filename;
const inputFile = script.split(".")[0] + ".txt";
const input = Bun.file(inputFile);

const text = await input.text();

function run() {
    const start = performance.now();

    const matches = text.matchAll(/(mul\(\d+,\d+\))/gm);
    if (!matches) {
        throw new Error("No matches found");
    }

    const enabler = "do()";
    const disabler = "don't()";
    let sum = 0;
    matches: for (const match of matches) {
        for (let i = match.index - enabler.length; i > 0; i--) {
            const disabledCheck = text.substring(i, i + disabler.length);
            if (disabledCheck === disabler) {
                continue matches;
            }
            const enabledCheck = text.substring(i, i + enabler.length);
            if (enabledCheck === enabler) {
                break;
            }
        }

        if (match[0]) {
            const matchString = match[0];
            const commaIndex = matchString.indexOf(",");
            const first = matchString.substring(4, commaIndex);
            const second = matchString.substring(commaIndex + 1, matchString.length - 1);
            sum += parseInt(first) * parseInt(second);
        } else {
            throw new Error("No match in match? Fuck???");
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
