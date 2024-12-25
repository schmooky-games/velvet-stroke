import REGL from "regl";
import vertexShader from "./vertexShader.glsl?raw";
import fragmentShader from "./fragmentShader.glsl?raw";

main();

//
// start here
//
function main() {
  const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

  const r = REGL({
    container: document.body,
    attributes: {
      // Enable alpha blending for transparent pixels
      alpha: false,
    },
  });

  const positions: [number, number][] = [
    [100, 200],
    [300, 200],
    [400, 100],
    [400, 200],
  ];
  let t = 0;
  r.frame(() => {
    r.clear({ color: [0, 0, 0, 1] });

    const center = positions[3]; // Fourth point as the center
    const radius = Math.sqrt(
      (positions[2][0] - center[0]) ** 2 + (positions[2][1] - center[1]) ** 2
    );
    const btw03 = Math.sqrt(
      (positions[0][0] - center[0]) ** 2 + (positions[0][1] - center[1]) ** 2
    );

    console.log("Before", positions[0][0], center[0], btw03);

    // Update third position to orbit around the fourth point
    positions[2][0] = center[0] + radius * Math.cos(t * 0.1);
    positions[2][1] = center[1] + radius * Math.sin(t * 0.1);

    positions[0][0] = radius * Math.cos(t * 0.1);

    positions[1][0] = positions[2][0] - radius;

    drawCurve(positions, 2, r);

    t = (t + 1) % 2000; // Loop animation

    console.log("Calc", positions[2][0], btw03, positions[0][0]);
  });
}

function drawCurve(
  coordinates: [number, number][],
  lineWidth: number,
  r: REGL.Regl
) {
  let lineCount = coordinates.length - 1;
  let i = 0;

  for (; i < lineCount; i++) {
    // console.group(`${i + 1} line`);
    const positions: [number, number][] = [];
    // let g = 0;
    const currentLine = coordinates.slice(i, i + 2);

    // console.log(currentLine[0], currentLine[1]);
    const pizdec = cordsWithWidth(
      currentLine[0],
      lineWidth / 2,
      currentLine[1]
    );

    // console.log(pizdec);
    positions.push(pixelToClipSpace(pizdec.p1, r));
    positions.push(pixelToClipSpace(pizdec.p2, r));
    positions.push(pixelToClipSpace(pizdec.p3, r));
    positions.push(pixelToClipSpace(pizdec.p4, r));

    const drawLine = r({
      // Define how many vertices to use for each primitive
      count: 4,

      // The primitive type is 'triangles' since we're constructing two triangles for the line
      primitive: "triangle strip",

      // Pass the vertices for the triangle's positions
      attributes: {
        position: positions,
      },

      // The vertex and fragment shaders (GLSL code) to draw the white line
      vert: vertexShader,

      frag: fragmentShader,
    });

    drawLine();
    console.groupEnd();
  }
}

function cordsWithWidth(
  pos1: [number, number],
  width: number,
  pos2: [number, number]
) {
  if (pos1[0] - pos2[0] !== 0) {
    const c1 = [pos1[0], pos1[1] + width];
    const c2 = [pos1[0], pos1[1] - width];

    const c3 = [pos2[0], pos2[1] + width];
    const c4 = [pos2[0], pos2[1] - width];

    return { p1: c1, p2: c3, p3: c2, p4: c4 };
  } else {
    const m1 = (pos1[1] - pos2[1]) / (pos1[0] - pos2[0]);
    const m2 = -1 / m1;

    const c1 = [
      pos1[0] + width / Math.sqrt(1 + m2 * m2),
      pos1[1] + (width * m2) / Math.sqrt(1 + m2 * m2),
    ];
    const c2 = [
      pos1[0] - width / Math.sqrt(1 + m2 * m2),
      pos1[1] - (width * m2) / Math.sqrt(1 + m2 * m2),
    ];

    const c3 = [
      pos2[0] + width / Math.sqrt(1 + m2 * m2),
      pos2[1] + (width * m2) / Math.sqrt(1 + m2 * m2),
    ];
    const c4 = [
      pos2[0] - width / Math.sqrt(1 + m2 * m2),
      pos2[1] - (width * m2) / Math.sqrt(1 + m2 * m2),
    ];

    return { p1: c1, p2: c3, p3: c2, p4: c4 };
  }
}

/**
 * Converts pixel coordinates to clip space coordinates.
 * @param x - The x coordinate in pixels.
 * @param y - The y coordinate in pixels.
 * @param regl - The regl instance.
 * @returns An array with the clip space x and y coordinates.
 */
function pixelToClipSpace(pos: number[], regl: REGL.Regl): [number, number] {
  // Get the current viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Convert to clip space
  const clipX = (2 * pos[0]) / viewportWidth - 1;
  const clipY = 1 - (2 * pos[1]) / viewportHeight; // Y is inverted in clip space

  return [clipX, clipY];
}
