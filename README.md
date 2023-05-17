# Banca Intesa Processes

An interactive visualization to explore Banca Intesa processes structures.

## Run Python Code to clean data

### Navigate to repo
1. In the command line `cd src/services`

### Create and activate environment
1. `conda env create -f environment.yml`
1. `conda activate banca`

### Run code

1. `python main.py`

### Translation

1. To run the translation data you will have to download a key from google cloud and name the file `key.json`. The `key.json` file goes in `src/services`.
2. Update the projectId in `src/services/config.yaml`

## Run application locally

In the project directory, you can run:

### `npm install`

Installs all required dependencies for the prototype to run and work properly.

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Deploying the Prototype

- Install the gh-pages package using `npm install gh-pages`

- Add the homepage property in the package.json: `"homepage": "https://NU-Center-for-Design.github.io/banca-process"`

- Add two scripts to the package.json: `"predeploy": "npm run build"` and  `"deploy": "gh-pages -d deploy"`

- Run `npm run deploy`
