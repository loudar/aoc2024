import {logPositions} from "./logPositions.ts";
import * as fs from "node:fs";

const script = import.meta.filename;
const inputFile = script.split(".")[0] + ".txt";
const input = Bun.file(inputFile);

const text = await input.text();

function outOfBounds(position: {x: number, y: number}, x: number, y: number) {
    return position.x < 0 || position.x >= x || position.y < 0 || position.y >= y;
}

function applyPositionMap(toApply: Map<number, Map<number, [boolean, number]>>, applyTarget: Map<number, Map<number, [boolean, number]>>) {
    toApply.forEach((value, yKey) => {
        if (!applyTarget.has(yKey)) {
            applyTarget.set(yKey, value);
        } else {
            value.forEach((value, xKey) => {
                if (!applyTarget.get(yKey)!.has(xKey)) {
                    applyTarget.get(yKey)!.set(xKey, value);
                }
            });
        }
    });
}

function addPossibleOption(possibleOptions: Map<number, Map<number, boolean>>, targetPos: {
    x: number;
    y: number
}, possibleOptionsCount: number) {
    if (!possibleOptions.has(targetPos.y)) {
        possibleOptions.set(targetPos.y, new Map<number, boolean>);
    }
    if (!possibleOptions.get(targetPos.y)!.has(targetPos.x)) {
        possibleOptions.get(targetPos.y)!.set(targetPos.x, true);
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

function hasDirectionAtPosition(map: Map<number, Map<number, [boolean, number]>>, position: {x: number, y: number}, direction: number) {
    const entry = map.get(position.y)?.get(position.x);
    return !!(entry && entry[1] === direction);

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

    const visited = new Map<number, Map<number, [boolean, number]>>();
    addPositionAndDirectionToMap(visited, guard, guard.direction);
    const possibleOptions = new Map<number, Map<number, boolean>>();
    let visitedCount = 1, possibleOptionsCount = 0;
    let tmpGuard = structuredClone(guard);

    while (guard.x > -1 && guard.x < lines[0].length && guard.y > -1 && guard.y < lines.length) {
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
            const checkedPositions = new Map<number, Map<number, [boolean, number]>>();
            while (true) {
                checkI++;
                const target = {
                    x: tmpGuard.x + checkDirection.x * checkI,
                    y: tmpGuard.y + checkDirection.y * checkI
                };
                if (outOfBounds(target, lines[0].length, lines.length)) {
                    break;
                }
                if (obstacles.get(target.y)?.has(target.x)) {
                    tmpGuard.x = target.x - checkDirection.x;
                    tmpGuard.y = target.y - checkDirection.y;
                    tmpGuard.direction = directions[tmpGuard.direction + 1] ? tmpGuard.direction + 1 : 0;
                    checkDirection = directionMap[directions[tmpGuard.direction]];
                    checkI = 0;
                    continue;
                }

                /*if (resetCount > 1000) {
                    await logPositions(guard, directions, obstacles, visited, visitedCount, possibleOptions, {
                        ...target,
                        direction: tmpGuard.direction
                    }, lines[0].length, lines.length, 15, 130, 5);
                }*/
                if (visited.get(target.y)?.has(target.x) && visited.get(target.y)?.get(target.x)![1] === tmpGuard.direction) {
                    possibleOptionsCount = addPossibleOption(possibleOptions, targetPos, possibleOptionsCount);
                    break;
                } else {
                    const checkedPos = checkedPositions.get(target.y)?.get(target.x);
                    if (checkedPos && checkedPos[1] === tmpGuard.direction) {
                        possibleOptionsCount = addPossibleOption(possibleOptions, targetPos, possibleOptionsCount);
                        break;
                    }
                }
                addPositionAndDirectionToMap(checkedPositions, target, tmpGuard.direction);
            }
        }

        // Actually walk forward / turn
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
        //await logPositions(guard, directions, obstacles, visited, visitedCount, possibleOptions, null, lines[0].length, lines.length);
    }

    //fs.writeFileSync("d6out.txt", await logPositions(guard, directions, obstacles, visited, visitedCount, possibleOptions, null, lines[0].length, lines.length, 15, 130));

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