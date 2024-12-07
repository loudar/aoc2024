export async function logPositions(guard: {
    x: number;
    y: number;
    direction: number;
}, directions: any, obstacles: Map<number, Map<number, boolean>>, visited: Map<number, Map<number, [boolean, number]>>, visitedCount: number, possibleOptions: Map<number, Map<number, boolean>>, width: number, height: number) {
    let out = "";
    const ySize = 15;
    const xSize = 130;
    for (let y = Math.max(guard.y - ySize, 0); y < Math.min(height, guard.y + ySize); y++) {
        for (let x = Math.max(guard.x - xSize, 0); x < Math.min(width, guard.x + xSize); x++) {
            if (guard.x === x && guard.y === y) {
                out += directions[guard.direction];
            } else if (obstacles.get(y)?.has(x)) {
                out += "#";
            } else if (possibleOptions.get(y)?.has(x)) {
                out += "O";
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
        const timeout = distances.some(d => d < 3) ? 1000 : 16;
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}