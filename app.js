var builder = require('botbuilder');
var restify = require('restify');

var server = restify.createServer();
server.listen(process.env.port || 3978, function(){
    console.log('server name:' + server.name + ' | server url:' + server.url );
});

var connector = new builder.ChatConnector({
    appId:       process.env.appId || '',
    appPassword: process.env.appPassword || ''
})

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function(session){
    bot.dialog('proactiveDialog', function () {
        session.send('bonjour');
    });

    bot.on('typing', function(){
        session.send('je te vois...');
    });

    session.send('ton message fait ' + session.message.text.length + ' caractères');
    //session.send('dialog data' + JSON.stringify(session.dialogData));
    //session.send('dialog session' + JSON.stringify(session.sessionState));
});