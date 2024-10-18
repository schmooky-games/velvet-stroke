import REGL from 'regl';
import vertexShader from './vertexShader.glsl?raw';
import fragmentShader from './fragmentShader.glsl?raw';


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
      alpha: false
    }
  });
  
  // Define the vertices for the white line using two points
  // A line is represented by two triangles for simplicity, forming a very thin rectangle
  const positions = [
    [-0.5, 0], // first point of the line
    [0.5, 0.5],  // second point of the line
    [-0.5, 0.01], // slightly above the first point to create thickness
    [0.5, 0.51]
      // slightly above the second point to create thickness
  ]; 
  
  // Initialize the draw command
  const drawLine = r({
    // Define how many vertices to use for each primitive
    count: 4,
  
    // The primitive type is 'triangles' since we're constructing two triangles for the line
    primitive: 'triangle strip',
  
    // Pass the vertices for the triangle's positions
    attributes: {
      position: positions
    },
  
    // The vertex and fragment shaders (GLSL code) to draw the white line
    vert: vertexShader,

    frag: fragmentShader,
  });
  
  r.frame(()=>{
    r.clear({color:[0,0,0,1]});
    //drawLine();
    
  drawCurve([[100,400],[1200,400]], r);
  })
  
}

function drawCurve(coordinates: [number,number][], r: REGL.Regl){
  const positions: [number,number][] = [];
  let i = 0
  for(; i < coordinates.length; i++){
    const currentCoordinates = coordinates[i];
    const clipedCoordinates = pixelToClipSpace(currentCoordinates[0]+1, currentCoordinates[1]+1, r);
    positions.push(clipedCoordinates); 
  }

  let g = coordinates.length-1;
  for(; g >= 0; g--){
    const currentCoordinates = coordinates[g];
    const clipedCoordinates = pixelToClipSpace(currentCoordinates[0]-1, currentCoordinates[1]-1, r);
    positions.push(clipedCoordinates); 
  }

  const drawLine = r({
    // Define how many vertices to use for each primitive
    count: 4,
  
    // The primitive type is 'triangles' since we're constructing two triangles for the line
    primitive: 'triangle strip',
  
    // Pass the vertices for the triangle's positions
    attributes: {
      position: positions
    },
  
    // The vertex and fragment shaders (GLSL code) to draw the white line
    vert: vertexShader,

    frag: fragmentShader,
  });

  drawLine();

}

/**
 * Converts pixel coordinates to clip space coordinates.
 * @param x - The x coordinate in pixels.
 * @param y - The y coordinate in pixels.
 * @param regl - The regl instance.
 * @returns An array with the clip space x and y coordinates.
 */
function pixelToClipSpace(x: number, y: number, regl: REGL.Regl): [number, number] {
  // Get the current viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Convert to clip space
  const clipX = (2 * x / viewportWidth) - 1;
  const clipY = 1 - (2 * y / viewportHeight);  // Y is inverted in clip space
    
  return [clipX, clipY];
}