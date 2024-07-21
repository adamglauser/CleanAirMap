import inquirer from "inquirer";

export default class CLIView {
    
    writeMessage(message, cliContext, level = "INFO") {
        if (level == "DEBUG" && !cliContext.verbose) {
            return;
        }
        console.log(message);
    }

    showStatus(cliContext) {
        var locationCount = this.formatLocationCount(cliContext.locMgr.getLocationCount());
        var searchCount = this.formatLocationCount(cliContext.locMgr.getSearchedCount());
        this.writeMessage(`Locations: ${locationCount} | Searched: ${searchCount}`);
    }

    formatLocationCount(number) {
        const maxLocationDigits = 5;
        return number.toString().padStart(maxLocationDigits, " ");
    }

    showWelcome() {
        this.writeMessage("Welcome to the CleanAir Migrator");
    }
    
    showThanks() {
        this.writeMessage("Thanks, bye!");
    }

    async promptForAction() {
        const questions = [{
            type: 'input',
            name: 'choice',
            message: 'Please select an option: 1 - LoadLocations, 2 - exit',
        },]
        return inquirer.prompt(questions).then(response => {
            if (response.choice == '1') {
                return "LoadLocations";
            }
            else {
                return "Exit";
            }
        });
    }

}