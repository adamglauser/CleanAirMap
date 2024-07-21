#!/usr/bin/env node

import { program } from "commander";
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv'

import ReverseGeocoder from './src/ReverseGeocoder.mjs';
import AutoCompleter from './src/AutoCompleter.mjs';
import LocationManager from './src/LocationManager.mjs'
import V1Client from './src/V1Client.mjs'
import CLIView from './src/cliView.mjs'

var cliContext = { "locMgr":"", "searcher": "", verbose: false };

program
    .version("0.0.1")
    .description("Migration Tool CLI")
    .option("-s, --searcher <type>", "The searcher")
    .option("-v, --verbose", "Show verbose output")
    .action((options) => {
        const view  = new CLIView();
        const module_dir = dirname(fileURLToPath(import.meta.url));
        process.env.APP_ROOT_PATH=module_dir;
        dotenv.config({path: `${module_dir}/.env`});

        processOptions(cliContext, options);
        view.writeMessage(`Using searcher "${cliContext.searcher.cacheKey}"`, cliContext, "DEBUG");

        cliContext.locMgr = new LocationManager(process.env, new V1Client(process.env), cliContext.searcher);

        view.showWelcome();
        processAction(view, cliContext);
        // cliContext.locMgr.loadLocations().then(() => {
        //     view.writeMessage(`Loading cached search results ...`, cliContext,"DEBUG");
        //     cliContext.locMgr.loadCachedSearchResults()
        //     view.writeMessage("Loaded cached search results!", cliContext,"DEBUG");
        //     view.showStatus(cliContext);
        // });
        // //await cliContext.locMgr.searchAll();
        
        // cliContext.locMgr.processSearchResults();
        // cliContext.locMgr.summarizeMatchResults();
    });

program.parse(process.argv);

function processAction(view, cliContext) {
    view.showStatus(cliContext);
    view.promptForAction().then((action) => {
        if (action == "LoadLocations") {
            cliContext.locMgr.loadLocations().then(() => { processAction(view, cliContext) });
        }
        else {
            view.showThanks();
        }
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