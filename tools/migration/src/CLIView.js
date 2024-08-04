const inquirer = require('inquirer').default;

class CLIView {
    
    writeMessage(message, cliContext, level = "INFO") {
        if (level == "DEBUG" && !cliContext.verbose) {
            return;
        }
        console.log(message);
    }

    showStatus(cliContext) {
        var locationCount = this.formatLocationCount(cliContext.locMgr.getLocationCount());
        var searchCount = this.formatLocationCount(cliContext.locMgr.getSearchedCount());
        var currentSearcher = cliContext.locMgr.searchClient.getCacheKey();
        this.writeMessage(`Locations: ${locationCount} | Searched: ${searchCount} | Searcher: ${currentSearcher}`);
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

    async promptForAction(choiceList) {
        const prompt = this.makeInputPrompt(choiceList);
        return inquirer.prompt(prompt).then(response => {
            return choiceList[response.choice - 1].action;
        });
    }

    // choices = [{title: string, action: function},]
    makeInputPrompt(choices) {
        var message = "";
        choices.forEach((choice, index) => {
            // After the first choice, add a seperator
            var seperator = (index == 0) ? "" : " | ";
            message = `${message}${seperator}${index+1}-${choice.title}`
        });
        return [{
            type: 'input',
            name: 'choice',
            message: message,
        },];
    }

    
}

module.exports = CLIView;