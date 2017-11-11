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
    session.beginDialog('askName');         
});

bot.dialog('askName', [
    function (session) {
        builder.Prompts.text(session, 'Quel est votre nom?');
    },
    function (session, results){
        session.endDialog('Bonjour %s!', results.response);
        res['name'] = results.response;
        session.replaceDialog('askPhone');
    }
]);

bot.dialog('askPhone', [
    function (session, args) {
        if (args && args.reprompt) {
            builder.Prompts.text(session, "Veuillez entrer un numero au format 06XXXXXXXX ou 07XXXXXXXX")
        } else {
            builder.Prompts.text(session, "Quel est votre numero?");
        }
    },
    function (session, results) {
        var matched = results.response.match(/\d+/g);
        var number  = matched ? matched.join('') : '';
        if (number.length == 10 && (number.substring(0,2) == '06' || number.substring(0,2) == '07') ) {
            session.endDialog('Votre numero est %s', number);
            res['phone'] = number;
            session.replaceDialog('askNumber'); 
        } else {
            session.replaceDialog('askPhone', { reprompt: true });
        }
    }
]); 

bot.dialog('askNumber', [
    function (session) {
        builder.Prompts.choice(session, "Combien de personnes?", "1|2|3", { listStyle: builder.ListStyle.button});
    },
    function (session, results){
        session.endDialog('Vous avez reservé pour %s personnes', results.response.entity);
        res['number'] = results.response.entity;
        session.replaceDialog('askDate');
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

bot.dialog('menu', [
    function (session) {
        builder.Prompts.choice(session, "Choisissez une etape", "nom|nombre de personnes|date|telephone", { listStyle: builder.ListStyle.button});
    },
    function (session, results){
        switch(results.response.index){
            case 0: 
                session.replaceDialog('askName');
            break;
            
            case 1: 
                session.replaceDialog('askNumber');
            break;

            case 2: 
                session.replaceDialog('askDate');
            break;
            
            case 3: 
                session.replaceDialog('askPhone');
            break;
        }
    }
]).triggerAction({
    matches      : /^main menu$/i,
    confirmPrompt: "Voulez vous retourner dans le menu?"
});

bot.dialog('restart', [ 
    function (session) {
        res = [];
        session.beginDialog('askName');   
    } 
]).triggerAction({
    matches      : /^restart action$/i,
    confirmPrompt: "Voulez vous recommencer votre reservation?"
});

bot.dialog('cancel', [ 
    function (session) {
        res = [];
        session.beginDialog('askName');   
    } 
]).triggerAction({
    matches      : /^cancel action$/i,
    confirmPrompt: "Voulez vous annuler votre reservation?"
});
