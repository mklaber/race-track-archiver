const fs = require("fs").promises;
const { buildGPX, BaseBuilder } = require('gpx-builder');
const { Point, Track, Segment } = BaseBuilder.MODELS;

function momentToPoint(m) {
    return new Point(m.lat, m.lon, { 
        time: new Date(m.at * 1000),
        ele: 1,
        extensions: {
            navionics_speed: 5,
            navionics_haccuracy: 7,
            navionics_vaccuracy: 7
        }
    });
}

function getBoatFromRace(race, boatIdOrSailNum) {
    return race["teams"].find(t => t.id === parseInt(boatIdOrSailNum) || t.sail === boatIdOrSailNum);
}

function getTrackByBoat(race, boat) {
    const moments = race["positions"].find(p => p.id === boat.id).moments.sort((a, b) => a.at - b.at);
    const firstMoment = new Date(moments[0].at * 1000);
    const latestMoment = new Date(moments[moments.length - 1].at * 1000);
    const points = moments.map(momentToPoint);
    const seg = new Segment(points, {
        navionics_start_time: firstMoment,
        navionics_end_time: latestMoment
    });
    const track = new Track([seg], {
        name: `${boat.name} as of ${latestMoment.toISOString()}`
    });
    return {
        firstMoment,
        latestMoment,
        track
    };
}

(async () => {
    try {
        const raceTag = process.argv.slice(2)[0];
        if (!raceTag) {
            throw new Error("No race tag was provided");
        }
        console.log(`Load ${raceTag}`);

        const race = require(`./race_${raceTag}.json`);

        const boatIdOrSailNum = process.argv.slice(2)[1];
        if (!boatIdOrSailNum) {
            throw new Error("No boat ID or sail number provided");
        }

        // kindred: GBR8285

        const boat = getBoatFromRace(race, boatIdOrSailNum);
        if (!boat) {
            throw new Error(`Can't find a boat with ID or Sail Number ${boatIdOrSailNum}`);
        }

        const {firstMoment, latestMoment, track} = getTrackByBoat(race, boat);

        const gpxData = new BaseBuilder();

        // gpxData.setMetadata(new Metadata({link: "http://www.navionics.com"}))

        console.log(`First Time: ${firstMoment.toISOString()}`)
        console.log(`Latests Time: ${latestMoment.toISOString()}`)

        gpxData.setTracks([track])

        const fileName = `track_${raceTag}_${boat.sail}_${latestMoment.toISOString().split(".")[0].replace(/\D+/g, "")}.gpx`;
        await fs.writeFile(fileName, buildGPX(gpxData.toObject()));
        console.log(`Wrote ${boat.name} as of ${latestMoment.toISOString()} to ${fileName}`)



        // // positions[id == 10].moments: [points]


        // const features = race["poi"]["lines"].map(poiToFeature);

        // const fc = {
        //   type: "FeatureCollection",
        //   features: features
        // };
        
        // const fileName = `race_${raceTag}.geojson`;
        // await fs.writeFile(fileName, JSON.stringify(fc, undefined, 4));
        // console.log(`Converted ${raceTag}'s race geometries to ${fileName}`);

    } catch (e) {
        console.error(e)
    }

})();