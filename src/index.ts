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
    
  drawCurve([[100,400],[600,200], [100, 100], [1200,100]], r);
  })
  
}

function drawCurve(coordinates: [number,number][], r: REGL.Regl){
  let lineCount = coordinates.length-1;
  let i = 0
  for(;i<lineCount;i++){
    
    console.group(`${i+1} line`)
    const positions: [number,number][] = [];
    let g = 0;
    const currentLine = coordinates.slice(i,i+2);
    for(; g < 2; g++){
      const currentCoordinates = currentLine[g];
   
      const clipedCoordinates = pixelToClipSpace(currentCoordinates[0], currentCoordinates[1]+2, r);
      console.log(clipedCoordinates)
      positions.push(clipedCoordinates);
    }
  
    g=0;
    for(; g < 2; g++){
      const currentCoordinates = currentLine[g];
      const clipedCoordinates = pixelToClipSpace(currentCoordinates[0], currentCoordinates[1]-2, r);
      console.log(clipedCoordinates)
      positions.push(clipedCoordinates);
    }

    // positions.push(pixelToClipSpace(coordinates[0][0], coordinates[0][1]-5, r));

    // positions.push(pixelToClipSpace(coordinates[1][0], coordinates[1][1]-5, r));

    // positions.push(pixelToClipSpace(coordinates[0][0], coordinates[0][1]+5, r));
    
    // positions.push(pixelToClipSpace(coordinates[1][0], coordinates[1][1]+5, r));
    

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
    console.groupEnd();
  }
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