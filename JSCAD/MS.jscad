function getParameterDefinitions() {
  return [
    {
      name: 'Blattschraubenabstand', type: 'float', initial: 50,
      min: 20, max: 100, step: 1, caption: "Blattschraubenabstand (mm):"
    },
    {
      name: 'Blattzahl', type: 'choice', initial: 3,
      values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      captions: ["1-Blatt", "2-Blatt", "3-Blatt", "4-Blatt", "5-Blatt", "6-Blatt", "7-Blatt", "8-Blatt", "9-Blatt", "10-Blatt", "11-Blatt", "12-Blatt"],
      caption: "Anzahl der Blätter:"
    },
    {
      name: 'Mittelstueck_Breite', type: 'float', initial: 8,
      min: 1, max: 25, step: 1, caption: "Mittelstück Breite (mm):"
    },
    {
      name: 'Mittelstueck_Hoehe', 'type': 'float', initial: 8,
      min: 6, max: 12, step: 1, caption: "Mittelstück Höhe (mm):"
    },
    {
      name: 'Mitnehmerdurchmesser', type: 'float', initial: 8,
      min: 8, max: 20, step: 1, caption: "Mitnehmerdurchmesser (mm):"
    },
    {
      name: 'Motorwelle_Durchmesser', type: 'float', initial: 5,
      min: 1, max: 10, step: 0.1, caption: "Motorwelle Durchmesser (mm):"
    },
    {
      name: 'Bohrung_Lastauge_Durchmesser', type: 'float', initial: 2,
      min: 1, max: 8, step: 0.1, caption: "Bohrungsdurchmesser Lastauge (mm):"
    },
    {
      name: 'Halsbreite_Blatt', type: 'float', initial: 5,
      min: 1, max: 20, step: 0.1, caption: "Halsbreite der Blätter (mm):"
    },
    {
      name: 'Verwindung_Winkel', type: 'float', initial: 0,
      min: -30, max: 30, step: 1, caption: "Verwindungswinkel (°):"
    },
    {
      name: 'Spinnerkappe_Typ', type: 'choice', initial: 0,
      values: [0, 8, 10],
      captions: ["Keine Bohrungen", "16mm Schraubenabstand", "20mm Schraubenabstand"],
      caption: "Bohrungen für Spinnerkappe:"
    },
    {
      name: 'Mutter_Groesse_Wahl', type: 'choice', initial: 'none',
      values: ['none', 'M3', 'M4', 'M5', 'M6', 'M8'],
      captions: ["Keine Mutter", "M3", "M4", "M5", "M6", "M8"],
      caption: "Mutteraufnahme:"
    },
    {
      name: 'resolution', type: 'int', initial: 100,
      min: 32, max: 255, step: 1, caption: "Grafische Auflösung (32-255):"
    }
  ];
}

function main(params) {
  var resolution = params.resolution;
  var finalModel = new CSG();

  // --- Feste Werte für Spinnerkappen-Bohrungen ---
  const SPINNERKAPPE_KERN_DURCHMESSER = 2;
  const SPINNERKAPPE_SENKUNG_DURCHMESSER = 4;
  const SPINNERKAPPE_GEWINDE_TIEFE = 2;

  // --- Mutter-Lookup-Tabelle ---
  const mutternDaten = {
    'M3': { s: 5.5, m: 2.4, e: 6.01 },
    'M4': { s: 7.0, m: 3.2, e: 7.66 },
    'M5': { s: 8.0, m: 4.0, e: 8.79 },
    'M6': { s: 10.0, m: 5.0, e: 11.05 },
    'M8': { s: 13.0, m: 6.5, e: 14.38 }
  };
  const MUTTER_PASSUNG_OFFSET = 0.2;
  const MUTTER_HOEHEN_FAKTOR = 0.75;

  // --- Mitnehmer (zentraler Zylinder) ---
  var mitnehmer = CSG.cylinder({
    start: [0, 0, -params.Mittelstueck_Hoehe / 2],
    end: [0, 0, params.Mittelstueck_Hoehe / 2],
    radius: params.Mitnehmerdurchmesser / 2,
    resolution: resolution
  });
  finalModel = finalModel.union(mitnehmer);

  // --- Bohrungen für die Spinnerkappe ---
  var spinnerkappen_bohrungen = new CSG();
  var spinnerKernBohrungsRadius = SPINNERKAPPE_KERN_DURCHMESSER / 2;
  var spinnerSenkungsRadius = SPINNERKAPPE_SENKUNG_DURCHMESSER / 2;

  var spinnerKernBohrungsLaenge = params.Mittelstueck_Hoehe * 3;
  var baseKernBohrung = CSG.cylinder({
    start: [0, 0, -spinnerKernBohrungsLaenge / 2],
    end: [0, 0, spinnerKernBohrungsLaenge / 2],
    radius: spinnerKernBohrungsRadius,
    resolution: resolution
  });

  var senkungsStartZ = -params.Mittelstueck_Hoehe / 2 - 0.1;
  var senkungsEndZ = params.Mittelstueck_Hoehe / 2 - SPINNERKAPPE_GEWINDE_TIEFE;

  var baseSenkungsBohrung = CSG.cylinder({
    start: [0, 0, senkungsStartZ],
    end: [0, 0, senkungsEndZ],
    radius: spinnerSenkungsRadius,
    resolution: resolution
  });

  // --- Schleife für jedes Blatt ---
  for (var a = 0; a < params.Blattzahl; a++) {
    var angle = a * 360 / params.Blattzahl;
    var armLaenge = params.Blattschraubenabstand / 2;

    var halterarm = CSG.cube({
      radius: [armLaenge / 2, params.Mittelstueck_Breite / 2, params.Mittelstueck_Hoehe / 2],
      center: [armLaenge / 2, 0, 0]
    });

    var lastaugeRadius = params.Mittelstueck_Hoehe / 2;
    var lastauge = CSG.cylinder({
      start: [armLaenge, -params.Mittelstueck_Breite / 2, 0],
      end: [armLaenge, params.Mittelstueck_Breite / 2, 0],
      radius: lastaugeRadius,
      resolution: resolution
    });

    var bohrungRadius = params.Bohrung_Lastauge_Durchmesser / 2;
    var bohrungLaenge = params.Mittelstueck_Breite * 2;
    var bohrungen = new CSG();
    var baseBohrung = CSG.cylinder({
      start: [0, -bohrungLaenge / 2, 0],
      end: [0, bohrungLaenge / 2, 0],
      radius: bohrungRadius,
      resolution: resolution
    });

    var verwindungsDrehpunktX = armLaenge;
    var verwindungsDrehpunktZ = 0;

    var bohrung1 = baseBohrung.translate([armLaenge, 0, 0]);
    bohrung1 = bohrung1.translate([-verwindungsDrehpunktX, 0, -verwindungsDrehpunktZ]);
    bohrung1 = bohrung1.rotateX(params.Verwindung_Winkel);
    bohrung1 = bohrung1.translate([verwindungsDrehpunktX, 0, verwindungsDrehpunktZ]);
    bohrungen = bohrungen.union(bohrung1);

    var leafCutout = CSG.cube({
        radius: [10, params.Halsbreite_Blatt / 2, params.Mittelstueck_Hoehe / 2 + 1],
        center: [armLaenge + 5, 0, 0]
    });

    leafCutout = leafCutout.translate([-verwindungsDrehpunktX, -0, -verwindungsDrehpunktZ]);
    leafCutout = leafCutout.rotateX(params.Verwindung_Winkel);
    leafCutout = leafCutout.translate([verwindungsDrehpunktX, 0, verwindungsDrehpunktZ]);

    var bladeSegment = halterarm.union(lastauge);
    bladeSegment = bladeSegment.subtract(bohrungen);
    bladeSegment = bladeSegment.subtract(leafCutout);

    var rotatedBladeSegment = bladeSegment.rotateZ(angle);
    finalModel = finalModel.union(rotatedBladeSegment);

    if (params.Spinnerkappe_Typ > 0) {
      var spinnerBohrAbstand = params.Spinnerkappe_Typ;
      var currentArmSpinnerBohrungen = new CSG();
      var kernbohrung = baseKernBohrung.translate([spinnerBohrAbstand, 0, 0]);
      currentArmSpinnerBohrungen = currentArmSpinnerBohrungen.union(kernbohrung);
      var senkung = baseSenkungsBohrung.translate([spinnerBohrAbstand, 0, 0]);
      currentArmSpinnerBohrungen = currentArmSpinnerBohrungen.union(senkung);
      spinnerkappen_bohrungen = spinnerkappen_bohrungen.union(currentArmSpinnerBohrungen.rotateZ(angle));
    }
  }

  var motorwelle_bohrung = CSG.cylinder({
    start: [0, 0, -params.Mittelstueck_Hoehe * 3],
    end: [0, 0, params.Mittelstueck_Hoehe * 3],
    radius: params.Motorwelle_Durchmesser / 2,
    resolution: resolution
  });
  finalModel = finalModel.subtract(motorwelle_bohrung);

  finalModel = finalModel.subtract(spinnerkappen_bohrungen);

  // --- Mutteraufnahme (separat und oben platziert) ---
  if (params.Mutter_Groesse_Wahl !== 'none') {
    const mutterInfo = mutternDaten[params.Mutter_Groesse_Wahl];

    if (mutterInfo) {
      const mutternSchluesselweite = mutterInfo.s;
      const mutternHoeheEffektiv = mutterInfo.m * MUTTER_HOEHEN_FAKTOR;
      const mutternEckmass = mutterInfo.e;

      var mutterGeometriePositiv = CSG.cylinder({
        start: [0, 0, params.Mittelstueck_Hoehe / 2],
        end: [0, 0, params.Mittelstueck_Hoehe / 2 + mutternHoeheEffektiv],
        radius: (mutternEckmass / 2) + MUTTER_PASSUNG_OFFSET + 0.1,
        resolution: resolution
      });

      var mutterSechskantLoch = CSG.cylinder({
        start: [0, 0, params.Mittelstueck_Hoehe / 2],
        end: [0, 0, params.Mittelstueck_Hoehe / 2 + mutternHoeheEffektiv + 0.1],
        radius: (mutternSchluesselweite / 2) + MUTTER_PASSUNG_OFFSET,
        resolution: 6
      });

      var mutteraufnahmeKoerper = mutterGeometriePositiv.subtract(mutterSechskantLoch);

      finalModel = finalModel.union(mutteraufnahmeKoerper);
    }
  }

  return [finalModel.setColor([0.5, 0.6, 1])];
}
