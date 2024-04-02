const fs = require("fs");

const PLANETS = [199, 299, 399, 499, 599, 699, 799, 899];

const regex = /[XY] = ?(-?\d\.\d+E\+\d*)(?=.*\s*.*EOE)/g;

let planetCoords = [];

function parseCoords(c) {
  // Example Coords: X = 1.339879730370736E+08 Y =-1.595979233568153E+08
  const r = /[XY] = ?(-?\d+.\d+E\+\d+)/;
  return {
    x: parseFloat(c[0].match(r)[1]),
    y: parseFloat(c[1].match(r)[1]),
  };
}

async function fetchPlanet(p) {
  return fetch(
    `https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27${p}%27&OBJ_DATA=%27YES%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27@Sun%27&START_TIME=%272024-03-27%27&STOP_TIME=%272024-03-28%27&VEC_TABLE=%271%27`
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch ${p}`);
      }
      return res.text();
    })
    .catch((err) => {
      //console.error(err);
      return fetchPlanet(p);
    });
}

for (let i = 0; i < PLANETS.length; i++) {
  fetchPlanet(PLANETS[i])
    .then((data) => {
      const coords = data.match(regex);
      console.log(parseCoords(coords));
    })
    .catch((err) => {
      console.error(err);
    });
}
