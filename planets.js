const fs = require("fs");

const PLANETS = [199, 299, 399, 499, 599, 699, 799, 899];

const regex = /[XY] = ?-?\d\.\d+E\+\d*(?=.*\s*.*EOE)/g;

let planetCoords = [];

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
      console.log(i + ":" + data.match(regex));
    })
    .catch((err) => {
      console.error(err);
    });
}
