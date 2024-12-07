const script = import.meta.filename;
const inputFile = script.split(".")[0] + ".txt";
const input = Bun.file(inputFile);

const text = await input.text();

async function logPositions(guard: {
    x: number;
    y: number;
    direction: number
}, directions: any, obstacles: Map<number, Map<number, boolean>>, visited: Map<number, Map<number, boolean>>, visitedCount: number, width: number, height: number) {
    let out = "";
    const ySize = 15;
    const xSize = 130;
    for (let y = Math.max(guard.y - ySize, 0); y < Math.min(height, guard.y + ySize); y++) {
        for (let x = Math.max(guard.x - xSize, 0); x < Math.min(width, guard.x + xSize); x++) {
            if (guard.x === x && guard.y === y) {
                out += directions[guard.direction];
            } else if (obstacles.get(y)?.has(x)) {
                out += "#";
            } else if (visited.get(y)?.has(x)) {
                out += "*";
            } else {
                out += " ";
            }
        }
        out += "\r\n";
    }
    out += "_".repeat(width);
    out += "\r\n";
    out += visitedCount;
    console.clear();
    console.log(out);
    await new Promise<void>((resolve) => {
        const distances = [guard.y, height - guard.y, guard.x, width - guard.x];
        const timeout =  distances.some(d => d < 3) ? 1000 : 16;
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}

async function run() {
    const start = performance.now();
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

    const visited = new Map<number, Map<number, boolean>>();
    let visitedCount = 0;
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
            visited.set(guard.y, new Map<number, boolean>());
        }
        if (!visited.get(guard.y)!.has(guard.x)) {
            visited.get(guard.y)!.set(guard.x, true);
            visitedCount++;
        }

        //await logPositions(guard, directions, obstacles, visited, visitedCount, lines[0].length, lines.length);
    }

    const diff = performance.now() - start;
    return {
        result: visitedCount + 1,
        time: diff
    }
}

console.log(script.replace(".txt", "").split("\\").at(-1));
const { result, time } = await run();
console.log(`Result: ${result}`);
console.log("Measuring...");

let sumTime = 0;
const runCount = 1000;
for (let i = 0; i < runCount; i++) {
    const runTime = (await run()).time;
    sumTime += runTime;
}
console.log((sumTime / runCount).toFixed(2) + "ms per run");
