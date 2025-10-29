function getParameterDefinitions() {
return[
{ name: 'ZYL_1_D', type: 'float', initial: 15, caption: "Zylinderdurchmesser Oben:", },
{ name: 'ZYL_1_L', type: 'float', initial: 20, caption: "Zylinderl&#228;nge Oben:",	},
{ name: 'ZYL_2_D', type: 'float', initial: 19, caption: "Zylinderdurchmesser Unten:", },
{ name: 'ZYL_2_L', type: 'float', initial: 13, caption: "Zylinderl&#228;nge Unten:", },
{ name: 'BOHR_D',  type: 'float', initial: 10, caption: "Bohrung Durchmesser :", },
{ name: 'resolut', type: 'float', initial: 99, caption: "Aufloesung (32-255) :", }
];}
function main(params){
var ZYLINDER_1  = CSG.cylinder({start: [0,0,0], end: [0,(params.ZYL_1_L)*+1,0], radius:(params.ZYL_1_D)/2, resolution: params.resolut});
var ZYLINDER_2  = CSG.cylinder({start: [0,0,0], end: [0,(params.ZYL_2_L)*-1,0], radius:(params.ZYL_2_D)/2, resolution: params.resolut});
var ZYLINDER_G  = ZYLINDER_1.union(ZYLINDER_2);
    ZYLINDER_G = ZYLINDER_G.setColor([1, 1, 0.9]);
if(params.BOHR_D > 0){
var BOHRUNG    = CSG.cylinder({start: [0,-100,0], end: [0,100,0], radius:(params.BOHR_D)/2, resolution: 100});
var GESAMTTEIL = ZYLINDER_G.subtract(BOHRUNG);
}else{
var GESAMTTEIL = ZYLINDER_G;
}
return [GESAMTTEIL];
}
