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