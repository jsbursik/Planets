const PLANETS = [199, 299, 399, 499, 599, 699, 799, 899];
const TIMEFRAME = getTimeframe();

const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;

const DARK_MODE_TOGGLE = document.getElementById("dark-mode-toggle");
let darkMode = DARK_MODE_TOGGLE.checked;

let planetData = [{ body: "Sun", radius: 695700, coords: { x: 0, y: 0 } }];

let dist_scale = HEIGHT / 15.8;
let rad_scale = HEIGHT / 183.4;

function getTimeframe() {
  const DATE = new Date("2021-12-18");
  console.log(DATE);
  const FORMATTER = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

  return {
    end: FORMATTER.format(DATE).split("/").join("-"),
    start: FORMATTER.format(DATE.setDate(DATE.getDate() - 1))
      .split("/")
      .join("-"),
  };
}

async function fetchPlanet(p) {
  return fetch(
    `https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27${p}%27&OBJ_DATA=%27YES%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27@Sun%27&START_TIME=%27${TIMEFRAME.start}%27&STOP_TIME=%27${TIMEFRAME.end}%27&VEC_TABLE=%271%27`
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch ${p}`);
      }
      return res.text();
    })
    .catch(() => {
      return fetchPlanet(p);
    });
}

function parseCoords(c) {
  // Example Coords: X = 1.339879730370736E+08 Y =-1.595979233568153E+08
  const reg = /[XY] = ?(-?\d+.\d+E\+\d+)/;

  return {
    x: parseFloat(c[0].match(reg)[1]),
    y: parseFloat(c[1].match(reg)[1]),
  };
}

// Logarithmic scaling doesn't look good, need to replace this.
function scaleDistance(coord) {
  if (coord == 0) return 0;
  let scale = 10000000;
  return coord < 0 ? Math.log(abs(coord / scale)) * -1 * dist_scale : Math.log(coord / scale) * dist_scale;
}

// Same as above...
function scaleRadius(radius) {
  let scale = 1000;
  return Math.log((radius / scale) * 2) * rad_scale;
}

for (let i = 0; i < PLANETS.length; i++) {
  fetchPlanet(PLANETS[i])
    .then((data) => {
      const nameRegex = /(?<=Target body name: )\w+/g;
      const radRegex = /(?<=Vol\. Mean Radius \(km\)\s*=\s*)\d+/gi;
      const coordsRegex = /[XY] = ?(-?\d\.\d+E\+\d*)(?=.*\s*.*EOE)/g;
      planetData.push({
        body: data.match(nameRegex)[0],
        radius: data.match(radRegex)[0],
        coords: parseCoords(data.match(coordsRegex)),
      });
      console.log(planetData[planetData.length - 1]);
    })
    .catch((err) => {
      console.error(err);
    });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  darkMode = DARK_MODE_TOGGLE.checked;
  background(darkMode ? 0 : 255);
  translate(windowWidth / 2, windowHeight / 2);
  for (let i = 0; i < planetData.length; i++) {
    let X = scaleDistance(planetData[i].coords.x);
    let Y = scaleDistance(planetData[i].coords.y);
    let D = scaleRadius(planetData[i].radius);
    // Draw Bodies
    fill(darkMode ? 0 : 255);
    strokeWeight(2);
    stroke(darkMode ? 255 : 0);
    circle(X, Y, D);
    //Draw Labels
    noStroke();
    fill(darkMode ? 255 : 0);
    text(planetData[i].body, X, Y - (10 + D / 2));
  }
}

function windowResized() {
  dist_scale = windowHeight / 15.8;
  rad_scale = windowHeight / 183.4;
  resizeCanvas(windowWidth, windowHeight);
}
