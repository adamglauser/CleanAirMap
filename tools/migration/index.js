const CLIView = require('./src/CLIView');
const dotenv = require('dotenv');

var cliContext = {verbose: false};
var view = new CLIView();

view.writeMessage("Some output", cliContext);
view.writeMessage("Some verbose output", cliContext, "DEBUG");

cliContext.verbose = true;
view.writeMessage("Some output", cliContext);
view.writeMessage("Some verbose output", cliContext, "DEBUG");