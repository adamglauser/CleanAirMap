#!/usr/bin/env node

import { program } from "commander";
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv'

import ReverseGeocoder from './src/ReverseGeocoder.mjs';
import AutoCompleter from './src/AutoCompleter.mjs';
import LocationManager from './src/LocationManager.mjs'
import V1Client from './src/V1Client.mjs'

program
    .version("0.0.1")
    .description("Migration Tool CLI")
    .option("-s, --searcher <type>", "The searcher")
    .action((options) => {
        const module_dir = dirname(fileURLToPath(import.meta.url));
        process.env.APP_ROOT_PATH=module_dir;
        dotenv.config({path: `${module_dir}/.env`});

        var searcher;
        if (options.searcher == 'AutoCompleter') {
            searcher = new AutoCompleter(process.env);
        }
        else if (options.searcher == 'ReverseGeocoder') {
            searcher = new ReverseGeocoder(process.env);
        }
        else {
            searcher = new AutoCompleter(process.env);
        }

        console.log(`Using searcher "${searcher.cacheKey}"`)
        var locMgr = new LocationManager(process.env, new V1Client(process.env), searcher);
        console.log(`Loading locations...`);
        locMgr.loadLocations().then(() => {
            console.log(`Loading cached search results ...`);
            locMgr.loadCachedSearchResults()
            console.log("Loaded cached search results!");
        });
        
        // //await locMgr.searchAll();
        
        // locMgr.processSearchResults();
        // locMgr.summarizeMatchResults();
    });

program.parse(process.argv);