import {logPositions} from "./logPositions.ts";
import * as fs from "node:fs";

const script = import.meta.filename;
const inputFile = script.split(".")[0] + ".txt";
const input = Bun.file(inputFile);

const text = await input.text();

function outOfBounds(position: {x: number, y: number}, x: number, y: number) {
    return position.x < 0 || position.x >= x || position.y < 0 || position.y >= y;
}

function addPossibleOption(possibleOptions: Map<number, Map<number, boolean>>,
                           visited: Map<number, Map<number, number[]>>, t: {
    x: number;
    y: number
}, possibleOptionsCount: number) {
    if (visited.get(t.y)?.has(t.x)) { // Don't add obstacles in places where the guard already went
        return possibleOptionsCount;
    }

    if (!possibleOptions.has(t.y)) {
        possibleOptions.set(t.y, new Map<number, boolean>);
    }
    if (!possibleOptions.get(t.y)!.has(t.x)) {
        possibleOptions.get(t.y)!.set(t.x, true);
        possibleOptionsCount++;
    }
    return possibleOptionsCount;
}

function addPositionAndDirectionToMap(map: Map<number, Map<number, [boolean, number]>>, position: {
    x: number;
    y: number
}, direction: number) {
    if (!map.has(position.y)) {
        map.set(position.y, new Map<number, [boolean, number]>());
    }
    if (!map.get(position.y)!.has(position.x)) {
        map.get(position.y)!.set(position.x, [true, direction]);
    }
}

function addDirectionAtPositionToMap(map: Map<number, Map<number, number[]>>, position: {
    x: number;
    y: number
}, direction: number) {
    if (!map.has(position.y)) {
        map.set(position.y, new Map<number, number[]>());
    }
    let added = false;
    if (!map.get(position.y)!.has(position.x)) {
        map.get(position.y)!.set(position.x, [direction]);
        added = true;
    } else {
        map.get(position.y)!.get(position.x)!.push(direction);
    }
    return added;
}

function hasDirectionAtPosition(map: Map<number, Map<number, number[]>>, position: {x: number, y: number}, direction: number) {
    const entry = map.get(position.y)?.get(position.x);
    return entry && entry.includes(direction);
}

async function logAndWait(guard: {
    x: number;
    y: number;
    direction: number
}, directions: string[], obstacles: Map<number, Map<number, boolean>>, visited: Map<number, Map<number, number[]>>, checkedPositions: Map<number, Map<number, number[]>>, visitedCount: number, possibleOptions: Map<number, Map<number, boolean>>, target: {
    x: number;
    y: number
}, tmpGuard: { x: number; y: number; direction: number }, lines: string[]) {
    await logPositions(guard, directions, obstacles, visited, checkedPositions, visitedCount, possibleOptions, {
        ...target,
        direction: tmpGuard.direction
    }, lines[0].length, lines.length, lines.length, lines[0].length);
    await new Promise(resolve => process.stdin.once("data", resolve));
}

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

    const visited = new Map<number, Map<number, number[]>>();
    addDirectionAtPositionToMap(visited, guard, guard.direction);
    const possibleOptions = new Map<number, Map<number, boolean>>();
    let visitedCount = 1, possibleOptionsCount = 0;
    let tmpGuard = structuredClone(guard);

    while (!outOfBounds(guard, lines[0].length, lines.length)) {
        const direction = directionMap[directions[guard.direction]];
        const targetPos = {
            x: guard.x + direction.x,
            y: guard.y + direction.y
        };
        if (outOfBounds(targetPos, lines[0].length, lines.length)) {
            break;
        }

        // Check if placing an obstacle in front would create a loop
        let checkDirIndex = guard.direction === (directions.length - 1) ? 0 : guard.direction + 1;
        let checkDirection = directionMap[directions[checkDirIndex]];
        tmpGuard.x = guard.x;
        tmpGuard.y = guard.y;
        tmpGuard.direction = checkDirIndex;
        if (!obstacles.get(targetPos.y)?.has(targetPos.x)) {
            let checkI = 0;
            const checkedPositions = new Map<number, Map<number, number[]>>();
            while (true) {
                checkI++;
                const target = {
                    x: tmpGuard.x + checkDirection.x * checkI,
                    y: tmpGuard.y + checkDirection.y * checkI
                };
                if (outOfBounds(target, lines[0].length, lines.length)) {
                    break;
                }

                if (possibleOptions.get(targetPos.y)?.has(targetPos.x)) {
                    //console.log(`already had ${targetPos.y} | ${targetPos.x}`);
                    break;
                }

                if (obstacles.get(target.y)?.has(target.x)) { // we've hit an obstacle, turn tmpGuard right and modify direction
                    tmpGuard.x = target.x - checkDirection.x;
                    tmpGuard.y = target.y - checkDirection.y;
                    tmpGuard.direction = directions[tmpGuard.direction + 1] ? tmpGuard.direction + 1 : 0;
                    checkDirection = directionMap[directions[tmpGuard.direction]];
                    checkI = 0;
                    if (hasDirectionAtPosition(visited, tmpGuard, tmpGuard.direction)) { // add option if after turning we're immediately on track
                        possibleOptionsCount = addPossibleOption(possibleOptions, visited, targetPos, possibleOptionsCount);
                        //await logAndWait(guard, directions, obstacles, visited, checkedPositions, visitedCount, possibleOptions, tmpGuard, tmpGuard, lines);
                        break;
                    }
                    continue;
                }

                if (hasDirectionAtPosition(visited, target, tmpGuard.direction)) { // for cases where you're running into a line from before and would just continue it
                    possibleOptionsCount = addPossibleOption(possibleOptions, visited, targetPos, possibleOptionsCount);
                    //await logAndWait(guard, directions, obstacles, visited, checkedPositions, visitedCount, possibleOptions, target, tmpGuard, lines);
                    break;
                } else {
                    const checkedPos = checkedPositions.get(target.y)?.get(target.x);
                    if (checkedPos && checkedPos.includes(tmpGuard.direction)) { // for loops that occur while moving tmpGuard without ever touching original lines
                        possibleOptionsCount = addPossibleOption(possibleOptions, visited, targetPos, possibleOptionsCount);
                        //await logAndWait(guard, directions, obstacles, visited, checkedPositions, visitedCount, possibleOptions, target, tmpGuard, lines);
                        break;
                    }
                }
                addDirectionAtPositionToMap(checkedPositions, target, tmpGuard.direction);
            }
        }

        // Actually walk forward / turn
        if (obstacles.get(targetPos.y)!.has(targetPos.x)) {
            guard.direction = directions[guard.direction + 1] ? guard.direction + 1 : 0;
            continue;
        }

        guard.x = targetPos.x;
        guard.y = targetPos.y;
        if (addDirectionAtPositionToMap(visited, guard, guard.direction)) {
            visitedCount++;
        }
        //await logPositions(guard, directions, obstacles, visited, visitedCount, possibleOptions, null, lines[0].length, lines.length);
    }

    //fs.writeFileSync("d6out.txt", await logPositions(guard, directions, obstacles, visited, null, visitedCount, possibleOptions, null, lines[0].length, lines.length, 1000, 1000));

    const diff = Bun.nanoseconds() - start;
    return {
        result: possibleOptionsCount,
        time: diff
    }
}

console.log(script.replace(".txt", "").split("\\").at(-1));
console.time("firstRun");
const { result, time } = await run();
console.timeEnd("firstRun");
console.log(`Result: ${result}`);
/*
console.log("Measuring...");
let sumTime = 0;
const runCount = 1000;
for (let i = 0; i < runCount; i++) {
    const runTime = (await run()).time;
    sumTime += runTime;
}
console.log((sumTime / runCount / 1000 / 1000).toFixed(2) + "ms per run");
*/