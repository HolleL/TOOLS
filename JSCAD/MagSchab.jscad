function getParameterDefinitions() {
return[
{	name: 'PolZ',	type: 'float',		initial: 14,	caption: "Anzahl der Magnete:"},
{	name: 'width',	type: 'float',		initial: 1.4,	caption: "Breite Abstandhalter:",		},
{	name: 'high',	type: 'float',		initial: 10,	caption: "Schablonenhoehe:"	},
{	name: 'AD',		type: 'float',		initial: 25,	caption: "Ausendurchmesser Grundkoerper",	},
{	name: 'ADM',	type: 'float',		initial: 27,	caption: "Ausendurchmesser Abstandhalter",	},
{	name: 'ID',		type: 'float',		initial: 22,	caption: "Innenlochung Durchmesser :",		},
{	name: 'MForm',	type: 'choice',		values: ["eckig", "rund"],		caption: "Magnetform: ",		},
];
}

function main(params){
if (params.MForm=="eckig"){var res=params.PolZ;} else {var res=250;}
var Innenbohrung    = CSG.cylinder({start: [0,0,params.high/1],  end: [0,0,params.high/-1], radius: params.ID/2, resolution: params.ID*8}); //Bohrung im Zylinder 
var Magnetschablone = CSG.cylinder({start: [0,0,params.high/2],  end: [0,0,params.high/-2], radius: params.AD/2, resolution: res}); //Grundkörper erstellen
   for(var i = 0; i < params.PolZ; i++){   //Magnete
     var angle = i*360/params.PolZ;
     var cube = CSG.cube({resolution:1}); 
     var cube = cube.scale([3,params.width/2, params.high/2]);
     var cube = cube.translate([(params.ADM/2)-3, 0,0]);
     var cube = cube.rotateZ(angle); 
   Magnetschablone = Magnetschablone.union(cube);
  }

Magnetschablone = Magnetschablone.subtract(Innenbohrung);
  Magnetschablone = Magnetschablone.setColor([0.5, 0.6, 1]);
return Magnetschablone;  //
}
