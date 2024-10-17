import REGL from 'regl';
import vertexShader from './vertexShader.vert?raw';
import fragmentShader from './fragmentShader.frag?raw';


main();

//
// start here
//
function main() {
  const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
  
  // Initialize regl
  const regl = REGL(canvas);
  
  // Define the vertex shader
  const vertexShader = `
  precision mediump float;
  attribute vec2 position;
  uniform float aspectRatio;
  void main() {
    gl_Position = vec4(position.x, position.y * aspectRatio, 0, 1);
  }
`;
  
// Define the fragment shader
const fragmentShader = `
  precision mediump float;
  uniform vec3 color;
  uniform vec2 resolution;
  uniform vec2 startPoint;
  uniform vec2 endPoint;
  uniform float circleRadius;
  
  float drawCircle(vec2 point, vec2 center, float radius) {
    float d = distance(point, center);
    return smoothstep(radius - 0.01, radius, d) - smoothstep(radius, radius + 0.01, d);
  }
  
  void main() {
    vec2 st = gl_FragCoord.xy / resolution;
    vec2 lineStart = startPoint / resolution;
    vec2 lineEnd = endPoint / resolution;
    
    // Draw the line
    vec2 lineVec = lineEnd - lineStart;
    vec2 pointVec = st - lineStart;
    float lineLength = length(lineVec);
    float t = clamp(dot(pointVec, lineVec) / (lineLength * lineLength), 0.0, 1.0);
    vec2 closestPoint = lineStart + t * lineVec;
    float lineWidth = 0.005;
    float line = smoothstep(lineWidth, 0.0, distance(st, closestPoint));
    
    // Draw circles at the ends
    float startCircle = drawCircle(st, lineStart, circleRadius);
    float endCircle = drawCircle(st, lineEnd, circleRadius);
    
    // Combine line and circles
    float shape = max(line, max(startCircle, endCircle));
    
    gl_FragColor = vec4(color * shape, shape);
  }
`;
  
// Define the draw command
const draw = regl({
  frag: fragmentShader,
  vert: vertexShader,
  attributes: {
    position: [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ],
  },
  uniforms: {
    color: [0.0, 0.5, 1.0],
    resolution: ({ viewportWidth, viewportHeight }) => [viewportWidth, viewportHeight],
    aspectRatio: ({ viewportWidth, viewportHeight }) => viewportHeight / viewportWidth,
    startPoint: [200, 150],
    endPoint: [600, 450],
    circleRadius: 0.02,
  },
  count: 4,
  primitive: 'triangle strip',
});
  
// Main render loop
regl.frame(() => {
  regl.clear({
    color: [1, 1, 1, 1],
    depth: 1,
  });
  
  draw();
});
}