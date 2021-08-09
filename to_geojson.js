const fs = require("fs").promises;
const fetch = require("node-fetch");


function nodesToArray(nodes) {
  const arr = [];
  for (let i = 0; i < nodes.length; i += 2) {
    const n1 = parseFloat(nodes[i]);
    const n0 = parseFloat(nodes[i+1]);
    arr.push([n0, n1])
  }
  return arr;

}

function poiToFeature(poi) {
  const s = "";
  const nodes = poi.nodes.split(",");
  const f = {
    type: "Feature",
    properties: {
      name: poi.name,
    },
    geometry: {
      type: undefined,
      coordinates: []
    }
  }
  if (poi.polygon) {
    f.geometry.type = "Polygon";
    f.geometry.coordinates = [nodesToArray(nodes)]
  } else if(nodes.length > 2) {
    // it's a line
    f.geometry.type = "LineString";
    f.geometry.coordinates = nodesToArray(nodes)
  } else {
    // it's a point
    f.geometry.type = "Point"
    f.geometry.coordinates = nodesToArray(nodes)[0]
  }
  return f;
}

(async () => {
    try {
        const raceTag = process.argv.slice(2)[0];
        if (!raceTag) {
            throw new Error("No race tag was provided");
        }
        console.log(`Load ${raceTag}`);

        const race = require(`./race_${raceTag}.json`);

        const features = race["poi"]["lines"].map(poiToFeature);

        const fc = {
          type: "FeatureCollection",
          features: features
        };
        
        const fileName = `race_${raceTag}.geojson`;
        await fs.writeFile(fileName, JSON.stringify(fc, undefined, 4));
        console.log(`Converted ${raceTag}'s race geometries to ${fileName}`);

    } catch (e) {
        console.error(e)
    }

})();