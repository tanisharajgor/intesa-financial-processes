# Banca Intesa Processes

An interactive visualization to explore Banca Intesa processes structures.

## Project Structure
The project is split into several directories for easier readability and to group files based on similar functionality.

### Components
Inside the components directory are React components that are used by several different pages. One example is the navigation bar that is used by every page to navigate througout the project.

### Pages
Inside the pages directory are distinct files for each page that exists throughout the project. A single page may have its own nested directory if there are local components that are used by that page alone.

### Services
Inside the services directory are functions and process related to processing data and information that will be needed throughout the interface.

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
