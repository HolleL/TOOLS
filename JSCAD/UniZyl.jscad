function getParameterDefinitions() {
  return [
    { name: 'ZYL_1_D', type: 'float', initial: 15, caption: "Zylinder-Rot &#x2300;:", },
    { name: 'ZYL_1_L', type: 'float', initial: 20, caption: "Zylinder-Rot Länge:", },
    { name: 'ZYL_2_D', type: 'float', initial: 19, caption: "Zylinder-Grau &#x2300;:", },
    { name: 'ZYL_2_L', type: 'float', initial: 13, caption: "Zylinder-Grau Länge:", },
    { name: 'ZYL_3_D', type: 'float', initial: 22, caption: "Zylinder-Blau &#x2300;:", },
    { name: 'ZYL_3_L', type: 'float', initial: 15, caption: "Zylinder-Blau Länge:", },

    { name: 'BOHR_1_D', type: 'float', initial: 10, caption: "Durchgehende Bohrung &#x2300;:", },
    { name: 'BOHR_2_D', type: 'float', initial: 12, caption: "Stufenbohrung an Rot &#x2300;:", },
    { name: 'BOHR_2_L', type: 'float', initial: 5, caption: "Stufenbohrung an Rot Tiefe:", },
    { name: 'BOHR_3_D', type: 'float', initial: 12, caption: "Stufenbohrung an Blau &#x2300;:", },
    { name: 'BOHR_3_L', type: 'float', initial: 5, caption: "Stufenbohrung an Blau Tiefe:", },
    
    { name: 'resolut', type: 'float', initial: 99, caption: "Auflösung (32-255) :", }
  ];
}

function main(params) {
  const EPSILON = 0.001; // Für Längen und minimalen Radius der Hauptzylinder
  const EPSILON_SUB = 0.0001; // Für Radien bei Subtraktion (Bohrungen)

  // --- Hauptzylinder ---
  // Zylinder 1 (oben) - Fest auf ROT
  var ZYLINDER_1 = CSG.cylinder({
    start: [0, 0, 0],
    end: [0, params.ZYL_1_L + EPSILON, 0],
    radius: (params.ZYL_1_D / 2) + EPSILON,
    resolution: params.resolut
  }).setColor([1.0, 0.5, 0.5]); // ROT

  // Zylinder 2 (mitte) - Fest auf GRAU
  var ZYLINDER_2 = CSG.cylinder({
    start: [0, 0, 0],
    end: [0, -(params.ZYL_2_L + EPSILON), 0],
    radius: (params.ZYL_2_D / 2) + EPSILON,
    resolution: params.resolut
  }).setColor([0.7,0.7,0.7]); // GRau

  // Zylinder 3 (unten) - Fest auf BLAU
  // Stelle sicher, dass die Länge (params.ZYL_3_L) immer > 0 ist, wenn sie zur Berechnung verwendet wird
  var effectiveZYL3L = Math.max(params.ZYL_3_L, EPSILON); // Verwende Math.max, um 0 zu verhindern
  var ZYLINDER_3 = CSG.cylinder({
    start: [0, -(params.ZYL_2_L + EPSILON), 0],
    end: [0, -(params.ZYL_2_L + effectiveZYL3L + EPSILON), 0], // Hier die Änderung
    radius: (params.ZYL_3_D / 2) + EPSILON,
    resolution: params.resolut
  }).setColor([0.5, 0.6, 1]); // BLAU
  
  // Vereinige alle Hauptzylinder
  var GESAMTTEIL = ZYLINDER_1.union(ZYLINDER_2).union(ZYLINDER_3);

  // --- Bohrungen ---
  var BOHRUNGEN = new CSG(); // Sammelobjekt für alle Bohrungen

  // 1. Durchgehende Bohrung
  if (params.BOHR_1_D > 0) { 
    var BOHR_DURCHGEHEND = CSG.cylinder({
      start: [0, -(params.ZYL_2_L + params.ZYL_3_L + 100), 0],
      end: [0, params.ZYL_1_L + 100 + EPSILON, 0],
      radius: params.BOHR_1_D / 2 + EPSILON_SUB,
      resolution: params.resolut
    }).setColor([0.7,0.7,0.7]); // GRau
    BOHRUNGEN = BOHRUNGEN.union(BOHR_DURCHGEHEND);
  }

  // 2. Gestufte Bohrung (oben - von ZYL_1)
  if (params.BOHR_2_D > 0 && params.BOHR_2_L > 0) {
    var gestufteBohrungOben = CSG.cylinder({
      start: [0, params.ZYL_1_L + EPSILON, 0],
      end: [0, (params.ZYL_1_L - params.BOHR_2_L) - EPSILON, 0],
      radius: params.BOHR_2_D / 2 + EPSILON_SUB,
      resolution: params.resolut
    });
    BOHRUNGEN = BOHRUNGEN.union(gestufteBohrungOben);
  }

  // 3. Gestufte Bohrung (unten - von ZYL_3)
  // Auch hier die Anpassung, um sicherzustellen, dass params.BOHR_3_L > 0 ist, wenn verwendet
  var effectiveBOHR3L = Math.max(params.BOHR_3_L, EPSILON); // Sicherstellen, dass Tiefe nie 0 ist
  if (params.BOHR_3_D > 0 && effectiveBOHR3L > 0) {
    var deepestY = -(params.ZYL_2_L + params.ZYL_3_L);
    var gestufteBohrungUnten = CSG.cylinder({
      start: [0, deepestY - EPSILON, 0],
      end: [0, (deepestY + effectiveBOHR3L) + EPSILON, 0], // Hier die Änderung
      radius: params.BOHR_3_D / 2 + EPSILON_SUB,
      resolution: params.resolut
    });
    BOHRUNGEN = BOHRUNGEN.union(gestufteBohrungUnten);
  }
  
  // Subtrahiere alle gesammelten Bohrungen vom Hauptkörper
  if (BOHRUNGEN instanceof CSG) {
    GESAMTTEIL = GESAMTTEIL.subtract(BOHRUNGEN);
  }

  return [GESAMTTEIL];
}
