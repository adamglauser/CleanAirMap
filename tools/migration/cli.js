#!/usr/bin/env node

const { program } = require("commander");
const dotenv = require('dotenv');

const ReverseGeocoder = require('./src/ReverseGeocoder.js');
const AutoCompleter = require('./src/AutoCompleter.js');
const LocationManager = require('./src/LocationManager.js');
const V1Client = require('./src/V1Client.js');
const CLIView = require('./src/CLIView.js');

var cliContext = { "locMgr":"", "searcher": "", verbose: false };

const mainChoices = [
    {title: 'Load Locations', action: loadLocationsAction},
    {title: 'Load cached search results', action: 'LoadResultCache'},
    {title: 'Run a search', action: 'RunSearch'},
    {title: 'Exit', action: exitAction}
]

program
    .version("0.0.1")
    .description("Migration Tool CLI")
    .option("-s, --searcher <type>", "The searcher")
    .option("-v, --verbose", "Show verbose output")
    .action((options) => {
        const view  = new CLIView();
        const module_dir = __dirname;
        process.env.APP_ROOT_PATH=module_dir;
        dotenv.config({path: `${module_dir}/.env`});

        processOptions(cliContext, options);
        view.writeMessage(`Using searcher "${cliContext.searcher.cacheKey}"`, cliContext, "DEBUG");

        cliContext.locMgr = new LocationManager(process.env, new V1Client(process.env), cliContext.searcher);

        view.showWelcome();
        processAction(view, cliContext, mainChoices);
    });

program.parse(process.argv);

function processAction(view, cliContext, choices) {
    view.showStatus(cliContext);
    view.promptForAction(choices).then((action) => {
        action(cliContext).then(nextChoices => {
            processAction(view, cliContext, nextChoices);
        });
        // else if (action == "LoadResultCache") {
        //     cliContext.locMgr.loadCachedSearchResults().then(() => { processAction(view, cliContext) });
        // }
        // else if (action == "RunSearch") {
        //     cliContext.locMgr.searchAll().then(() => { processAction(view, cliContext) });
        // }
    });
}

function processOptions(cliContext, options) {
    if (options.verbose != undefined) {
        cliContext.verbose = true;
    }

    if (options.searcher == 'AutoCompleter') {
        cliContext.searcher = new AutoCompleter(process.env);
    }
    else if (options.searcher == 'ReverseGeocoder') {
        cliContext.searcher = new ReverseGeocoder(process.env);
    }
    else {
        cliContext.searcher = new AutoCompleter(process.env);
    }
}

async function loadLocationsAction(cliContext) {
    return cliContext.locMgr.loadLocations().then(() => mainChoices);
}

async function exitAction(cliContext) {
    process.exit();
}