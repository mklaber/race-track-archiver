# race-track-archiver

This utility will generate a JSON file that contains all of the details of a YB tracked race.

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
