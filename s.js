var restify = require('restify');
var builder = require('botbuilder');
var urlencode = require('urlencode');
var httprequest = require('request').defaults({ encoding: null });
var Entities = require('html-entities').XmlEntities;
var htmlparser = require("htmlparser2");
entities = new Entities();
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID ,//||"39e398aa-5e7a-43c7-9079-fcb4f07a6dbc",
    appPassword: process.env.MICROSOFT_APP_PASSWORD //||"tZtei6Px5cY90yxTkP9HdQ6"
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
 
//=========================================================
// Bots Dialogs
//=========================================================

// Create LUIS recognizer 
var model = process.env.LUIS_MODEL_URL || "https://api.projectoxford.ai/luis/v1/application?id=a0032871-6f04-4d29-a669-286fd45a22a8&subscription-key=35820529a1be4e389462b5b4fd14ef90";
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

//開始LUIS
dialog.matches('查詢', [
    function (session, args, next) {
        // Resolve entities passed from LUIS.
            console.log("asdasdasdasdasd");
            var Room_entity = builder.EntityRecognizer.findEntity(args.entities, '處室');
            var Inf_entity = builder.EntityRecognizer.findEntity(args.entities, '資訊');
            var Job_entity = builder.EntityRecognizer.findEntity(args.entities, '工作');
           // console.log(Room_entity.entity);
           // console.log(Inf_entity.entity);
            //console.log(Job_entity.entity);
        
            if(Job_entity != null){
                var url="";
                if(Room_entity != null){
                    var Eng="\"postUnit\"";
                    var Unit="\""+urlencode(Room_entity.entity)+"\"";
                    url="http://data.tycg.gov.tw/api/v1/rest/datastore/c900ce98-0089-47cc-b044-ce87235078b4?"+"filters={"+Eng+":"+Unit+"}";
                }else{
                    url="http://data.tycg.gov.tw/api/v1/rest/datastore/c900ce98-0089-47cc-b044-ce87235078b4?"+"limit=3";
                }
                 console.log(url);
                httprequest(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body)
                     if(info.result.records.length==0){
                        var reply_str = '不好意思目前沒有'+Room_entity.entity+'的相關'+Job_entity.entity+'，謝謝您';
                        session.send(reply_str);  
                    }
                    else
                    {
                        console.log(info.result.records[0].postUnit);
                        var s=entities.decode(info.result.records[0].jobContent);
                        var card_text="";
                        var parser = new htmlparser.Parser({
                            onopentag: function(name, attribs){
                                if(name === "script" && attribs.type === "text/javascript"){
                                    console.log("JS! Hooray!");
                                }
                            },
                            ontext: function(text){
                                card_text=card_text+"\r"+text;
                                console.log("-->", text);
                            },
                            onclosetag: function(tagname){
                                if(tagname === "script"){
                                    console.log("That's it?!");
                                }
                            }
                        }, {decodeEntities: true});
                        parser.write(s);
                        parser.end();
                       // s=s.replace(/<br\s*[\/]?>/gi,"\r");
                        var msg = new builder.Message(session)
                            .textFormat(builder.TextFormat.xml)
                            .attachments([
                                new builder.HeroCard(session)
                                    .title(info.result.records[0].needGovOrg)
                                    .subtitle(info.result.records[0].postDate+" "+info.result.records[0].subject)
                                    .text(card_text)
                            ]);
                        session.endDialog(msg); 
                    }
                }else{
                    
                    console.log(response.statusCode);
                }
                });
            }

            if(Inf_entity != null ){
                var url="";
                if(Room_entity != null){
                    var Eng="\"postUnit\"";
                    var Unit="\""+urlencode(Room_entity.entity)+"\"";
                    url="http://data.tycg.gov.tw/api/v1/rest/datastore/73644460-c76f-4afa-aa30-064bfef291d8?"+"filters={"+Eng+":"+Unit+"}";
                }else{
                    url="http://data.tycg.gov.tw/api/v1/rest/datastore/73644460-c76f-4afa-aa30-064bfef291d8?"+"limit=3";
                }
                console.log(url);
                 
                httprequest(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body)
                    if(info.result.records.length==0){
                        var reply_str = '不好意思目前沒有'+Room_entity.entity+'的相關'+Inf_entity.entity+'，謝謝您';
                        session.send(reply_str);  
                    }
                    else
                    {
                        console.log(info.result.records[0].postUnit);
                        var s=entities.decode(info.result.records[0].detailContent);
                        var card_text="";
                        var parser = new htmlparser.Parser({
                            onopentag: function(name, attribs){
                                if(name === "script" && attribs.type === "text/javascript"){
                                    console.log("JS! Hooray!");
                                }
                            },
                            ontext: function(text){
                                card_text=card_text+"\r"+text;
                                console.log("-->", text);
                            },
                            onclosetag: function(tagname){
                                if(tagname === "script"){
                                    console.log("That's it?!");
                                }
                            }
                        }, {decodeEntities: true});
                        parser.write(s);
                        parser.end();
                       // s=s.replace(/<br\s*[\/]?>/gi,"\r");
                       if(info.result.records[0].img != null){
                            var msg = new builder.Message(session)
                                .textFormat(builder.TextFormat.xml)
                                .attachments([
                                    new builder.HeroCard(session)
                                        .title(info.result.records[0].subject)
                                        .subtitle(info.result.records[0].postDate)
                                        .text(card_text)
                                        .images([
                                            builder.CardImage.create(session,info.result.records[0].img[0].imgurl)
                                        ])
                                ]);
                            session.endDialog(msg); 
                       }
                       else{
                             var msg = new builder.Message(session)
                                .textFormat(builder.TextFormat.xml)
                                .attachments([
                                    new builder.HeroCard(session)
                                        .title(info.result.records[0].subject)
                                        .subtitle(info.result.records[0].postDate)
                                        .text(card_text)
                                        
                                ]);
                            session.endDialog(msg); 
                       }
                    }
                   
                }else{
                    console.log(response.statusCode);
                }
                });
            }
            
             
           
               
    },
    function(session,results){

    

    }

    
         
]);