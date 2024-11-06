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
  // const positions = [
  //   [-0.5, 0], // first point of the line
  //   [0.5, 0.5],  // second point of the line
  //   [-0.5, 0.01], // slightly above the first point to create thickness
  //   [0.5, 0.51]
  //     // slightly above the second point to create thickness
  // ]; 
  
  // // Initialize the draw command
  // const drawLine = r({
  //   // Define how many vertices to use for each primitive
  //   count: 4,
  
  //   // The primitive type is 'triangles' since we're constructing two triangles for the line
  //   primitive: 'triangle strip',
  
  //   // Pass the vertices for the triangle's positions
  //   attributes: {
  //     position: positions
  //   },
  
  //   // The vertex and fragment shaders (GLSL code) to draw the white line
  //   vert: vertexShader,

  //   frag: fragmentShader,
  // });
  const positions: [number,number][] = [[100,200],[300,200],[400,100],[400,200]];
  let t = 0
  r.frame(()=>{
    r.clear({color:[0,0,0,1]});
  drawCurve(positions, 2, r);
  positions[0][0] += 11 * Math.cos(t*0.1);
  positions[1][0] += 11 * Math.cos(t*0.1);
  positions[2][0] += 11 * Math.cos(t*0.1);
  positions[2][1] += 11 * Math.sin(t*0.1);

  t = t == 2000? 0 : t+1;
  })
  
}

function drawCurve(coordinates: [number,number][], lineWidth:number, r: REGL.Regl){
  let lineCount = coordinates.length-1;
  let i = 0


  for(;i<lineCount;i++){
    console.group(`${i+1} line`)
    const positions: [number,number][] = [];
    // let g = 0;
    const currentLine = coordinates.slice(i,i+2);
    
    // const angle = angleFromSlope(currentLine[0],currentLine[1]);
    // const widthX = Math.sin(angle)*lineWidth/2;
    // const widthY = Math.cos(angle)*lineWidth/2;

    console.log(currentLine[0],currentLine[1])
    const pizdec = cordsWithWidth(currentLine[0], lineWidth/2, currentLine[1]);

    console.log(pizdec);
    positions.push(pixelToClipSpace(pizdec.p1, r));
    positions.push(pixelToClipSpace(pizdec.p2, r));
    positions.push(pixelToClipSpace(pizdec.p3, r));
    positions.push(pixelToClipSpace(pizdec.p4, r));


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

// function angleFromSlope(pos1:[number,number], pos2:[number,number]){
//   const slope = (pos2[1]-pos1[1])/(pos2[0]-pos1[0]);


//   const acrttan = Math.atan(slope);

//   const angle = acrttan;
//   console.log("angle from slope",angle)
//   return Math.abs(angle);
// }

function cordsWithWidth(pos1:[number,number],width:number, pos2: [number,number]){
  if(pos1[0]-pos2[0] !== 0){
    const c1 = [pos1[0],pos1[1]+width]
    const c2 = [pos1[0],pos1[1]-width]
  
    const c3 = [pos2[0],pos2[1]+width]
    const c4 = [pos2[0],pos2[1]-width]
    
    return {p1:c1, p2:c3, p3:c2, p4:c4};
  }
  else{
    
    const m1= (pos1[1]-pos2[1])/(pos1[0]-pos2[0]);
    const m2 = -1/m1;
  
    const c1 = [pos1[0]+width/Math.sqrt(1+m2*m2),pos1[1]+width*m2/Math.sqrt(1+m2*m2)]
    const c2 = [pos1[0]-width/Math.sqrt(1+m2*m2),pos1[1]-width*m2/Math.sqrt(1+m2*m2)]
  
    const c3 = [pos2[0]+width/Math.sqrt(1+m2*m2),pos2[1]+width*m2/Math.sqrt(1+m2*m2)]
    const c4 = [pos2[0]-width/Math.sqrt(1+m2*m2),pos2[1]-width*m2/Math.sqrt(1+m2*m2)]
  
    return {p1:c1, p2:c3, p3:c2, p4:c4};
  }
}

/**
 * Converts pixel coordinates to clip space coordinates.
 * @param x - The x coordinate in pixels.
 * @param y - The y coordinate in pixels.
 * @param regl - The regl instance.
 * @returns An array with the clip space x and y coordinates.
 */
function pixelToClipSpace(pos:number[], regl: REGL.Regl): [number, number] {
  // Get the current viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Convert to clip space
  const clipX = (2 * pos[0] / viewportWidth) - 1;
  const clipY = 1 - (2 * pos[1] / viewportHeight);  // Y is inverted in clip space
    
  return [clipX, clipY];
}