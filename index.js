#!/usr/bin/env node

const fs = require("fs").promises;
const fetch = require("node-fetch");

async function getFromYb(race, url) {
    const resp = await fetch(url, {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "sec-ch-ua":
            '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
          "sec-ch-ua-mobile": "?0",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
        },
        referrer: `https://yb.tl/${race}`,
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
      });
    if (!resp.ok) {
        throw new Error(`${resp.status}: ${resp.statusText} when calling ${url}`)
    }
    return resp;
}

async function getPositions(race) {
  const positions = await getFromYb(race, `https://yb.tl/BIN/${race}/AllPositions3`);
  const buff = await positions.arrayBuffer();
  return parsePositions(buff);
}

function parsePositions(e) {
    // comes from yb's website: https://yb.tl/build/raceviewer-es6.js
    // which is consumed by: https://yb.tl/build/raceviewer-es5.js
  for (
    var t = new DataView(e),
      i = t.getUint8(0),
      a = 1 === (1 & i),
      s = 2 === (2 & i),
      n = 4 === (4 & i),
      r = 8 === (8 & i),
      o = t.getUint32(1),
      l = 5,
      c = [];
    l < e.byteLength;

  ) {
    var u = t.getUint16(l);
    l += 2;
    var h = t.getUint16(l),
      d = new Array(h);
    l += 2;
    for (var g = void 0, v = 0; v < h; v++) {
      var p = t.getUint8(l),
        m = {};
      if (128 === (128 & p)) {
        var w = t.getUint16(l);
        l += 2;
        var y = t.getInt16(l);
        l += 2;
        var M = t.getInt16(l);
        if (((l += 2), a && ((m.alt = t.getInt16(l)), (l += 2)), s)) {
          var f = t.getInt16(l);
          (l += 2), (m.dtf = g.dtf + f), n && ((m.lap = t.getUint8(l)), l++);
        }
        r && ((m.pc = t.getInt16(l) / 32e3), (l += 2)),
          (w = 32767 & w),
          (m.lat = g.lat + y),
          (m.lon = g.lon + M),
          (m.at = g.at - w),
          (m.pc = g.pc + m.pc);
      } else {
        var T = t.getUint32(l);
        l += 4;
        var b = t.getInt32(l);
        l += 4;
        var L = t.getInt32(l);
        if (((l += 4), a && ((m.alt = t.getInt16(l)), (l += 2)), s)) {
          var x = t.getInt32(l);
          (l += 4), (m.dtf = x), n && ((m.lap = t.getUint8(l)), l++);
        }
        r && ((m.pc = t.getInt32(l) / 21e6), (l += 4)),
          (m.lat = b),
          (m.lon = L),
          (m.at = o + T);
      }
      (d[v] = m), (g = m);
    }
    d.forEach(function (e) {
      (e.lat /= 1e5), (e.lon /= 1e5);
    }),
      c.push({
        id: u,
        moments: d,
      });
  }
  return c;
}

async function getRaceSetup(race) {
  const setup = await getFromYb(race, `https://yb.tl/JSON/${race}/RaceSetup`);
  return await setup.json();
}

async function getLeaderboard(race) {
  const leaderboard = await getFromYb(race, `https://yb.tl/JSON/${race}/leaderboard`);
  return await leaderboard.json();
}

async function getRace(race) {
    const raceSetup = await getRaceSetup(race);
    // TODO: these are returned as "tags" which seem to have duplicate information for teams that 
    // are in multiple tags (e.g., IRC 4 and Overall)
    const ldrbd = await getLeaderboard(race);
    // TODO: filter out positions after a team finishes or DNFs (we don't need to know where a boat went after)
    const pos = await getPositions(race);
    raceSetup.leaderboard = ldrbd;
    raceSetup.positions = pos;
    return raceSetup;
}

(async () => {
    try {
        const raceTag = process.argv.slice(2)[0];
        if (!raceTag) {
            throw new Error("No race tag was provided");
        }
        console.log(`Go get ${raceTag}`);

        const race = await getRace(raceTag);
        const fileName = `race_${raceTag}.json`;
        await fs.writeFile(fileName, JSON.stringify(race, undefined, 4));
        console.log(`Retrieved ${raceTag} to ${fileName}`);
    } catch (e) {
        console.error(e)
    }

})();