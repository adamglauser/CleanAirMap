export default class CLIView {
    
    writeMessage(message, cliContext, level = "INFO") {
        if (level == "DEBUG" && !cliContext.verbose) {
            return;
        }
        console.log(message);
    }
}