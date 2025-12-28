const scene = document.getElementById("scene");
scene.width = 800;
scene.height = 800;
const ctx = scene.getContext("2d");

// TODO: fullscreen & aspect ratio

const TEXT = "#EFEFEF";
const BACKGROUND = "#0F0F0F";
const FOREGROUND_BOX = "#8F8F8F";
const FOREGROUND_LINE = "#AFAFAF";

function project({ x, y, z }) {
    return {
        x: x / z,
        y: y / z,
    };
}

function drawBackground() {
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, scene.width, scene.height);
}

function drawPoint({ x, y }) {
    const POINT_SIZE = 10;
    const HALF_SIZE = POINT_SIZE / 2;
    ctx.fillStyle = FOREGROUND_LINE;
    ctx.fillRect(x - HALF_SIZE, y - HALF_SIZE, POINT_SIZE, POINT_SIZE);
}

function drawLine(p1, p2) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = FOREGROUND_LINE;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function drawRect(p1, p2, p3, p4) {
    ctx.fillStyle = FOREGROUND_BOX;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.fill();
}

function drawText(text, { x, y }) {
    const FONT_SIZE = 16;
    ctx.fillStyle = TEXT;
    ctx.font = `${FONT_SIZE}px monospace`;
    ctx.fillText(text, x, y + FONT_SIZE);
}

function toScreen({ x, y }) {
    return {
        x: (x + 1) / 2 * scene.width,
        y: (1 - (y + 1) / 2) * scene.height,
    };
}

function translateZ({ x, y, z }, deltaZ) {
    return { x, y, z: z + deltaZ };
}

function rotateXZ({ x, y, z }, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: x * cos - z * sin,
        y,
        z: x * sin + z * cos,
    }
}

function offsetBy(p1, p2) {
    return {
        x: p1.x + p2.x,
        y: p1.y + p2.y,
        z: p1.z + p2.z,
    };
}

const Player = {
    camera: {
        x: 0,
        y: 0,
        z: 0,
    },
}

document.addEventListener("keydown", (e) => {
    switch (e.code) {
        case "KeyA": {
            Player.camera.x += 1;
            break;
        }
        case "KeyD": {
            Player.camera.x -= 1;
            break;
        }
        case "KeyW": {
            Player.camera.z -= 1;
            break;
        }
        case "KeyS": {
            Player.camera.z += 1;
            break;
        }
        case "Space": {
            Player.camera.y -= 1;
            break;
        }
        case "ShiftLeft": {
            Player.camera.y += 1;
            break;
        }
    }
});

let elements = [structuredClone(Cube), structuredClone(Penger)];
elements[0].pos = { x: 0, y: 0, z: 3 };
elements[1].pos = { x: 2, y: 0, z: 3 };

const MAXSAMPLES = 100;
let timeIndex = 0;
let timeSum = 0;
let timeList = new Array(MAXSAMPLES).fill(0);
let lastTime = 0;

function calculateFPS(deltaTime) {
    timeSum -= timeList[timeIndex];
    timeSum += deltaTime;
    timeList[timeIndex] = deltaTime;
    timeIndex = (timeIndex + 1) % MAXSAMPLES;
    const avgFrameTime = timeSum / MAXSAMPLES;
    return avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 0;
}

function frame(timestamp) {
    drawBackground();
    if (lastTime == 0) {
        lastTime = timestamp;
    }

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    const currentFPS = calculateFPS(deltaTime);
    for (const element of elements) {
        if (-Player.camera.z >= element.pos.z)
            continue;

        switch (element.type) {
            case "cube": {
                for (const face of element.box) {
                    const first = element.vertices[face[0]];
                    const second = element.vertices[face[1]];
                    const third = element.vertices[face[2]];
                    const fourth = element.vertices[face[3]];
                    drawRect(
                        toScreen(project(offsetBy(offsetBy(first, element.pos), Player.camera))),
                        toScreen(project(offsetBy(offsetBy(second, element.pos), Player.camera))),
                        toScreen(project(offsetBy(offsetBy(third, element.pos), Player.camera))),
                        toScreen(project(offsetBy(offsetBy(fourth, element.pos), Player.camera))),
                    );
                }
                break;
            }
            case "wiremodel": {
                for (const face of element.wireframe) {
                    for (let i = 0; i < face.length; ++i) {
                        const first = element.vertices[face[i]];
                        const second = element.vertices[face[(i + 1) % face.length]];
                        drawLine(
                            toScreen(project(offsetBy(offsetBy(rotateXZ(first, element.rotate), element.pos), Player.camera))),
                            toScreen(project(offsetBy(offsetBy(rotateXZ(second, element.rotate), element.pos), Player.camera))),
                        );
                    }
                }
                break;
            }
            default: {
                for (const face of element.wireframe) {
                    for (let i = 0; i < face.length; ++i) {
                        const first = element.vertices[face[i]];
                        const second = element.vertices[face[(i + 1) % face.length]];
                        drawLine(
                            toScreen(project(offsetBy(offsetBy(first, element.pos), Player.camera))),
                            toScreen(project(offsetBy(offsetBy(second, element.pos), Player.camera))),
                        );
                    }
                }
                break;
            }
        }
    }
    drawText(`x: ${-Player.camera.x}, y: ${-Player.camera.y}, z: ${-Player.camera.z}`, { x: 2, y: 2 });
    drawText(`fps: ${currentFPS}`, { x: 2, y: 20 });
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
