export const networkNodes:readonly (readonly [number,number])[]=[
  [0,0],[-10.5,-5.4],[-4,-8.4],[3.8,-6.8],[-13.5,1.4],[5.1,.8],[-10.2,6.8],[-3.9,8],[4.8,6.5],
];
export const networkConnections:readonly (readonly [number,number])[]=[
  [0,1],[0,2],[0,3],[0,4],[0,5],[1,2],[2,3],[1,4],[4,6],[6,7],[7,8],[5,8],[0,7],
];
const minX=Math.min(...networkNodes.map(node=>node[0])),maxX=Math.max(...networkNodes.map(node=>node[0]));
const minZ=Math.min(...networkNodes.map(node=>node[1])),maxZ=Math.max(...networkNodes.map(node=>node[1]));
export const networkPlanPoint=(index:number)=>({x:90+(networkNodes[index][0]-minX)/(maxX-minX)*540,y:140+(networkNodes[index][1]-minZ)/(maxZ-minZ)*360});
