export async function logPositions(
    guard: {
        x: number;
        y: number;
        direction: number
    },
    directions: any,
    obstacles: Map<number, Map<number, boolean>>,
    visited: Map<number, Map<number, [boolean, number]>>,
    checkedPositions: Map<number, Map<number, [boolean, number]>>,
    visitedCount: number,
    possibleOptions: Map<number, Map<number, boolean>>,
    highlightedPosition: { x: number, y: number, direction: number } | null,
    width: number, height: number,
    ySize: number = 15, xSize: number = 130, defaultTimeout = 16) {
    let out = "";
    const ref = highlightedPosition ?? guard;
    for (let y = Math.max(ref.y - ySize, 0); y < Math.min(height, ref.y + ySize); y++) {
        for (let x = Math.max(ref.x - xSize, 0); x < Math.min(width, ref.x + xSize); x++) {
            if (possibleOptions.get(y)?.has(x)) {
                out += "O";
            } else if (guard.x === x && guard.y === y) {
                out += directions[guard.direction];
            } else if (highlightedPosition && highlightedPosition.x === x && highlightedPosition.y === y) {
                out += directions[highlightedPosition.direction];
            } else if (obstacles.get(y)?.has(x)) {
                out += "#";
            } else if (visited.get(y)?.has(x)) {
                out += ".";
            } else if (checkedPositions.get(y)?.has(x)) {
                out += directions[checkedPositions.get(y)!.get(x)![1]];
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
    return await new Promise<string>((resolve) => {
        const distances = [guard.y, height - guard.y, guard.x, width - guard.x];
        let timeout = distances.some(d => d < 3) ? 1000 : defaultTimeout;
        if (defaultTimeout) {
            timeout = defaultTimeout;
        }
        setTimeout(() => {
            resolve(out);
        }, timeout);
    });
}
