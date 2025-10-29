function main(params){
var cube1 = CSG.cube({center: [0, 0,16], radius: [20, 0.01, 2]}); cube1=cube1.setColor([1.0,0.0,0.0]);
var cube2 = CSG.cube({center: [0, 0,12], radius: [20, 0.01, 2]}); cube2=cube2.setColor([1.0,0.6,0.0]);
var cube3 = CSG.cube({center: [0, 0, 8], radius: [20, 0.01, 2]}); cube3=cube3.setColor([1.0,1.0,0.0]);
var cube4 = CSG.cube({center: [0, 0, 4], radius: [20, 0.01, 2]}); cube4=cube4.setColor([0.0,1.0,0.0]);
var cube5 = CSG.cube({center: [0, 0, 0], radius: [20, 0.01, 2]}); cube5=cube5.setColor([0.0,0.0,1.0]);
var cube6 = CSG.cube({center: [0, 0,-4], radius: [20, 0.01, 2]}); cube6=cube6.setColor([0.5,0.0,0.5]);
var mast  = CSG.cylinder({start:[20, 0, 18], end:[20,0,-30], radius:0.8}); mast=mast.setColor([0.5,0.5,0.5]);
flag = cube1.union([cube2,cube3,cube4,cube5,cube6,mast]);
return [flag];
} 
