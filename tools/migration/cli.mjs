#!/usr/bin/env node

import { program } from "commander";
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv'

import ReverseGeocoder from './src/ReverseGeocoder.mjs';
import AutoCompleter from './src/AutoCompleter.mjs';
import LocationManager from './src/LocationManager.mjs'
import V1Client from './src/V1Client.mjs'

var cliContext = { "searcher": "", verbose: false };

program
    .version("0.0.1")
    .description("Migration Tool CLI")
    .option("-s, --searcher <type>", "The searcher")
    .option("-v, --verbose", "Show verbose output")
    .action((options) => {
        
        const module_dir = dirname(fileURLToPath(import.meta.url));
        process.env.APP_ROOT_PATH=module_dir;
        dotenv.config({path: `${module_dir}/.env`});

        processOptions(cliContext, options);
        writeMessage(`Using searcher "${cliContext.searcher.cacheKey}"`, "DEBUG");
        var locMgr = new LocationManager(process.env, new V1Client(process.env), cliContext.searcher);
        writeMessage(`Loading locations...`, "DEBUG");
        locMgr.loadLocations().then(() => {
            writeMessage(`Loading cached search results ...`,"DEBUG");
            locMgr.loadCachedSearchResults()
            writeMessage("Loaded cached search results!","DEBUG");
        });
        
        // //await locMgr.searchAll();
        
        // locMgr.processSearchResults();
        // locMgr.summarizeMatchResults();
    });

program.parse(process.argv);

function writeMessage(message, level = "INFO") {
    if (level == "DEBUG" && !cliContext.verbose) {
        return;
    }
    console.log(message);
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