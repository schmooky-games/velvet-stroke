precision mediump float;
  attribute vec2 position;
  uniform float aspectRatio;
  void main() {
    gl_Position = vec4(position.x, position.y * aspectRatio, 0, 1);
  }