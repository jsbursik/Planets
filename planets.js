const PLANETS = [199, 299, 399, 499, 599, 699, 799, 899];
const TIMEFRAME = getTimeframe();

let planetData = [];

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
    x: parseFloat(c[0].match(r)[1] / 10000000),
    y: parseFloat(c[1].match(r)[1] / 10000000),
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
      const coordsRegex = /[XY] = ?(-?\d\.\d+E\+\d*)(?=.*\s*.*EOE)/g;
      const name = data.match(nameRegex)[0];
      const coords = data.match(coordsRegex);
      planetData.push({
        planet: name,
        coords: parseCoords(coords),
      });
      console.log(planetData[planetData.length - 1]);
    })
    .catch((err) => {
      console.error(err);
    });
}

function setup() {
  createCanvas(200, 200);
}

function draw() {
  background(220);
  translate(width / 2, height / 2);
  fill(255);
  for (let i = 0; i < planetData.length; i++) {
    circle(planetData[i].coords.x, planetData[i].coords.y, 10);
  }
}
