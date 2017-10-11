var builder = require('botbuilder');
var restify = require('restify');

var server = restify.createServer();
server.listen(process.env.port || 3978, function(){
    console.log('server name:' + server.name + ' | server url:' + server.url );
});

var connector = new builder.ChatConnector({
    appId      : process.env.appId || '',
    appPassword: process.env.appPassword || ''
})
    
server.post('/api/messages', connector.listen());
var res = [];

var bot = new builder.UniversalBot(connector, function(session){
    session.send("Hello");
    session.send("Bienvenue dans le Bot RESA");
    session.beginDialog('greetings');    
});

bot.dialog('greetings',[
    function (session){
        session.beginDialog('askName');
    },
    function (session, results){
        session.endDialog('Bonjour %s!', results.response);
        res['name'] = results.response;
        session.beginDialog('askNumber');
    }
]);

bot.dialog('askName', [
    function (session) {
        builder.Prompts.text(session, 'Quel est votre nom?');
    },
    function (session, results){
        session.endDialogWithResult(results);
    }
]);

bot.dialog('askNumber', [
    function (session) {
        builder.Prompts.choice(session, "Combien de personnes?", "1|2|3", { listStyle: builder.ListStyle.button});
    },
    function (session, results){
        session.endDialog('Vous avez reservé pour %s personnes', results.response.entity);
        res['number'] = results.response.entity;
        session.beginDialog('askDate');
    }
]);

bot.dialog('askDate', [
    function (session) {
        builder.Prompts.time(session, 'Quelle date?');
    },
    function (session, results){
        session.endDialog('Vous avez reservé pour le %s', builder.EntityRecognizer.resolveTime([results.response]));
        res['date'] = builder.EntityRecognizer.resolveTime([results.response]);;
        session.send("Voici le detail de votre reservation:<br> nom: %s <br> date: %s <br> nombre de personnes: %s", res['name'], res['date'], res['number']);
    }
]);
