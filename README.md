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


## TODO

* Filter out positions after a boat finishes or retires (we don't care where they went after retiring)
* Add visualisation layer
* Make sense of the leaderboard output (likely duplicates)
* Figure out if there's a way to list all of the known YB races
