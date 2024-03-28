const PLANETS = {
  Mercury: "199",
  Venus: "299",
  Earth: "399",
  Mars: "499",
  Jupiter: "599",
  Saturn: "699",
  Uranus: "799",
  Neptune: "899",
};

let planetData = [];

const regex = /(?:[XY] = ?-?\d+.\d+E\+\d+ ){2}/g;

async function fetchPlanets(p) {
  const res = await fetch(
    `https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27${p}%27&OBJ_DATA=%27YES%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27@Sun%27&START_TIME=%272024-03-27%27&STOP_TIME=%272024-03-28%27&VEC_TABLE=%271%27`
  );
  const data = await res.text();
  if (data.includes("Unexpected Server Error")) {
    fetchPlanets(p);
  } else {
    planetData.push(data);
    console.log(regex.exec(data)[0]);
  }
}

for (let i in PLANETS) {
  fetchPlanets(PLANETS[i]);
}
