
 precision mediump float;
 attribute vec2 position;
 void main() {
  // Convert from 2D position to clip space (range -1 to 1)
  gl_Position = vec4(position, 0, 1.0);
}