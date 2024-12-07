import {logPositions} from "./logPositions.ts";

const script = import.meta.filename;
const inputFile = script.split(".")[0] + ".txt";
const input = Bun.file(inputFile);

const text = await input.text();

async function run() {
    const start = Bun.nanoseconds();
    const lines = text.split("\r\n");
    const guard = { x: -1, y: -1, direction: -1 };
    const directionMap: { [key: string]: { x: number, y: number } } = {
        "v": { x: 0, y: 1 },
        "<": { x: -1, y: 0 },
        "^": { x: 0, y: -1 },
        ">": { x: 1, y: 0 },
    };
    const directions = Object.keys(directionMap);
    const obstacles = new Map<number, Map<number, boolean>>();
    lines.map((l, y) => {
        const map = new Map<number, boolean>();
        for (let i = 0; i < l.length; i++) {
            if (l.at(i) === "#") {
                map.set(i, true);
            } else if (Object.keys(directionMap).includes(l.at(i) ?? "")) {
                guard.x = i;
                guard.y = y;
                guard.direction = directions.indexOf(l.at(i) ?? "");
            }
        }
        obstacles.set(y, map);
    });

    const visited = new Map<number, Map<number, [boolean, number]>>();
    const possibleOptions = new Map<number, Map<number, boolean>>();
    let visitedCount = 0, possibleOptionsCount = 0;
    while (guard.x > -1 && guard.x < lines[0].length && guard.y > -1 && guard.y < lines.length) {
        const direction = directionMap[directions[guard.direction]];
        const targetPos = {
            x: guard.x + direction.x,
            y: guard.y + direction.y
        };
        if (targetPos.x < 0 || targetPos.x >= lines[0].length || targetPos.y < 0 || targetPos.y >= lines.length) {
            break;
        }
        if (obstacles.get(targetPos.y)!.has(targetPos.x)) {
            guard.direction = directions[guard.direction + 1] ? guard.direction + 1 : 0;
            continue;
        }

        guard.x = targetPos.x;
        guard.y = targetPos.y;
        if (!visited.has(guard.y)) {
            visited.set(guard.y, new Map<number, [boolean, number]>());
        }
        if (!visited.get(guard.y)!.has(guard.x)) {
            visited.get(guard.y)!.set(guard.x, [true, guard.direction]);
            visitedCount++;
        }

        const turnRightOnceDir = guard.direction === (directions.length - 1) ? 0 : guard.direction + 1;
        const checkDirection = directionMap[directions[turnRightOnceDir]];
        const target = {
            x: guard.x + checkDirection.x,
            y: guard.y + checkDirection.y
        };
        if (visited.get(target.y)!.has(target.x)) {
            if (visited.get(target.y)!.get(target.x)![1] === turnRightOnceDir) {
                const option = {
                    x: guard.x + direction.x,
                    y: guard.y + direction.y,
                };
                if (!possibleOptions.has(option.y)) {
                    possibleOptions.set(option.y, new Map<number, boolean>);
                }
                if (!possibleOptions.get(option.y)!.has(option.x)) {
                    possibleOptions.get(option.y)!.set(option.x, true);
                    possibleOptionsCount++;
                }
            }
        }

        await logPositions(guard, directions, obstacles, visited, visitedCount, possibleOptions, lines[0].length, lines.length);
    }

    const diff = Bun.nanoseconds() - start;
    return {
        result: possibleOptionsCount,
        time: diff
    }
}

console.log(script.replace(".txt", "").split("\\").at(-1));
const { result, time } = await run();
console.log(`Result: ${result}`);
/*
console.log("Measuring...");
let sumTime = 0;
const runCount = 1000;
for (let i = 0; i < runCount; i++) {
    const runTime = run().time;
    sumTime += runTime;
}
console.log((sumTime / runCount / 1000 / 1000).toFixed(2) + "ms per run");
*/