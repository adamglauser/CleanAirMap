const CLIView = require('./CLIView')

test('Make prompt from choice list', () => {
    const choiceList = [
        {title: "First choice", action: null},
        {title: "Second", action: null},
        {title: "Third", action: null}
    ];
    const expectedPrompt = [{
        type: 'input',
        name: 'choice',
        message: '1-First choice | 2-Second | 3-Third',
    },]
    const view = new CLIView();

    var actualPrompt = view.makeInputPrompt(choiceList);

    expect(actualPrompt).toEqual(expectedPrompt);
})