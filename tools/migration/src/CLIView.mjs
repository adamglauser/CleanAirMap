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
}