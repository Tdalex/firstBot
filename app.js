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

    // greet new user
    bot.on('conversationUpdate', function (message) {
        if (message.membersAdded) {
            message.membersAdded.forEach(function (identity) {
                if (identity.id !== message.address.bot.id) {
                    bot.send(new builder.Message()
                        .address(message.address)
                        .text("Bonjour " + identity.name + "!" ));
                }
            });
        }
    });

    //recognize intent
    bot.recognizer({recognize: function (context, done) {
        var intent = { score: 0.0 };
        if (context.message.text) {
            switch (context.message.text.toLowerCase()) {
                case 'doheavywork':
                    intent = { score: 1.0, intent: 'doHeavyWork' };
                    session.sendTyping();
                    setTimeout(function () {
                        session.send("travail terminé...");
                    }, 5000);
                    break;
            }
        }
        done(null, intent);
    }});    
   
    // detect user typing
    bot.on('typing', function(){
        session.send('je te vois...'); 
        // bot typing
        session.sendTyping();
        setTimeout(function () {
            session.send("Moi aussi je sais le faire!");
        }, 5000);

    });

    //response on all message
    session.send('ton message fait ' + session.message.text.length + ' caractères');
    //session.send('dialog data' + JSON.stringify(session.dialogData));
    //session.send('dialog session' + JSON.stringify(session.sessionState));
    
});