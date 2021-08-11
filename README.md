# race-track-archiver

This utility will generate a JSON file that contains all of the details of a YB tracked race. It takes a single input: the race slug which comes from a URL like: `https://yb.tl/stmalo2021`

## Installation

Clone this repository locally, then:

To use the binned reference to the app, you'll need to install it globally: `npm install -g`. Otherwise just `npm install` and `chmod +x index.js`.

## Usage

If installed globally, just:

```bash
$ race-track-archiver stmalo2018
Go get stmalo2018
Retrieved stmalo2018 to race_stmalo2018.json
```

Otherwise,

```bash
$ ./index.js stmalo2018
Go get stmalo2018
Retrieved stmalo2018 to race_stmalo2018.json
```

## Output

It'll write a JSON file with all the details of a race.

### Filtering

Let's say you want to get a CSV of retirements. You can do this with the [jq](https://stedolan.github.io/jq/download/) utility. Install it, then:

```bash
$ npm i -g json2csv
cat race_fastnet2021.json | jq -c '.teams[] | select(.status=="RETIRED")' | jq -s | json2csv -f id,sail,name,model,explain  -o retirements.csv 
```

## GeoJSON

To create a GeoJSON file of the race details (e.g., start line, TSS, etc.):

```bash
$ race-track-archiver fastnet2021
Go get fastnet2021
Retrieved fastnet2021 to race_fastnet2021.json
$ node to_geojson.js fastnet2021
Load fastnet2021
Converted fastnet2021's race geometries to race_fastnet2021.geojson
```

## GPX Track (Navionics Track)

To create a GPX file that can be imported to Navionics as a Track, use:

```bash
$ race-track-archiver fastnet2021
Go get fastnet2021
Retrieved fastnet2021 to race_fastnet2021.json
$ node build_gpx.js fastnet2021 GBR8367
Load fastnet2021
First Time: 2021-08-08T10:05:00.000Z
Latests Time: 2021-08-11T13:15:01.000Z
Wrote Rho as of 2021-08-11T13:15:01.000Z to track_fastnet2021_GBR8367_20210811131501.gpx
```

Then, send the file to a mobile device for viewing. You should be able to do this by sending it to yourself in an email, in WhatsApp (using WhatsApp Desktop), or Air Drop (on a Mac). When prompted on your device, open it with "Boating" (the current name for the Navionics app).

## TODO

- [ ] Filter out positions after a boat finishes or retires (we don't care where they went after retiring)
- [ ] Add visualisation layer
- [ ] Make sense of the leaderboard output (likely duplicates)
- [ ] Figure out if there's a way to list all of the known YB races. (When predictwind.com's YB tab is working--based on a [tutorial video](https://www.youtube.com/watch?v=SoQEIreSnTE)--it should list all races.)
