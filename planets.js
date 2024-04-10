const PLANETS = [199, 299, 399, 499, 599, 699, 799, 899];
const TIMEFRAME = getTimeframe();

const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;

let planetData = [];

const dist_slider = document.getElementById("dist_slider");
const rad_slider = document.getElementById("rad_slider");
const dist_value = document.getElementById("dist_val");
const rad_value = document.getElementById("rad_val");

dist_value.textContent = dist_slider.value;
rad_value.textContent = rad_slider.value;

let dist_scale = 1000 * dist_slider.value;
let rad_scale = 10 * rad_slider.value;

dist_slider.addEventListener("input", () => {
  dist_value.textContent = dist_slider.value;
  dist_scale = 1000 * dist_slider.value;
});
rad_slider.addEventListener("input", () => {
  rad_value.textContent = rad_slider.value;
  rad_scale = 10 * rad_slider.value;
});

function getTimeframe() {
  const DATE = new Date();
  const FORMATTER = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

  return {
    end: FORMATTER.format(DATE).split("/").join("-"),
    start: FORMATTER.format(DATE.setDate(DATE.getDate() - 1))
      .split("/")
      .join("-"),
  };
}

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

for (let i = 0; i < PLANETS.length; i++) {
  fetchPlanet(PLANETS[i])
    .then((data) => {
      const nameRegex = /(?<=Target body name: )\w+/g;
      const radRegex = /(?<=Vol\. Mean Radius \(km\)\s*=\s*)\d+/gi;
      const coordsRegex = /[XY] = ?(-?\d\.\d+E\+\d*)(?=.*\s*.*EOE)/g;
      planetData.push({
        planet: data.match(nameRegex)[0],
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
  createCanvas(WIDTH, HEIGHT);
}

function draw() {
  background(220);
  translate(WIDTH / 2, HEIGHT / 2);
  circle(0, 0, 695700 / rad_scale);
  for (let i = 0; i < planetData.length; i++) {
    let X = planetData[i].coords.x / dist_scale;
    let Y = planetData[i].coords.y / dist_scale;
    let R = planetData[i].radius / rad_scale;
    fill(255);
    circle(X, Y, R * 2);
    fill(0);
    text(planetData[i].planet, X, Y - (10 + R));
  }
}
