var restify = require('restify');
var builder = require('botbuilder');
var Face = require('oxford-face-api');
var face = new Face("8f7a031e5133417aa8b1f1ab525efec1");
var request = require("superagent");
 
var httprequest = require('request');
const captionService = require('./caption-service'),
    needle = require("needle");

var wtf;
function base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64); //encode to decode
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

var fs = require('fs')
  , gm = require('gm') 
gm('./testpng.png')
 
.write('./outpng.png', function (err) {
  if (!err) console.log('done');
  console.log(err);
});


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
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
 
//=========================================================
// Bots Dialogs
//=========================================================


bot.dialog('/', [

     function (session,args,next) {
         
        
      
         if(session.message.text=='CT'){
         	//Text.
              var msg = new builder.Message(session)
            
            .attachments([{
            	
                contentType: "image/jpeg",
                contentUrl: "http://www.bonavida.com.hk/wp-content/uploads/2014/02/101413-Kobe.jpg",
            }]);
             session.endDialog(msg);
         }else if(typeof session.message.attachments[0] !== 'undefined'){

            if(session.message.attachments[0].contentType == 'image/jpeg' || session.message.attachments[0].contentType == 'image/png'){
                 
                               
                       fs.readFile('./reformat.jpg', function(err, data) {
                          if (err) throw err;
                    
                          
                         
                          // Encode to base64
                          var img = new Buffer(data, 'binary');
                           
                         console.log(img);
                           
                        
                         var request_body= img ;
                          
                       
                    
                        request
                            .post( "https://api.projectoxford.ai/face/v1.0" + "/detect?")
                            .query({returnFaceId: true})
                            .query({returnFaceLandmarks: true})
                            .query({returnFaceAttributes: "age,gender"})
                            .set('Content-Type', 'application/octet-stream')
                            .set('Ocp-Apim-Subscription-Key', '8f7a031e5133417aa8b1f1ab525efec1' )
                            .send(request_body)
                            .end(function(error, response) {
                                 console.log('%s &&&&&&&&&&&',response.statusCode); 
                                if(!error && response.statusCode == 200) {
                                    
                                    var myJson = JSON.parse(JSON.stringify(response.body));
                                    console.log(myJson[0].faceRectangle.top);//work
                                    var u="http://az616578.vo.msecnd.net/files/2016/08/02/636057537990540091900905774_pics-girls-7.jpg";
                                    gm(httprequest(u))
                                        .stroke("#ffffff")
                                        .drawCircle(10, 10, 20, 10)
                                       
                                        .write('./reformat.jpg', function (err) {
                                        if (!err) console.log('done');
                                         console.log(err);
                                        });
                                    return callback(null, response.body);
                                } else {

                                  console.log(response.body);
                                    return callback(error);
                                }
                           
                        });
                     
                   
                        });
               
                 //object
                console.log('%s listening to',session.message.attachments[0].contentType); 
                // face api
                var msg = new builder.Message(session)
            
                .attachments([{
                
                contentType: "image/jpeg",
                contentUrl: "http://az616578.vo.msecnd.net/files/2016/08/02/636057537990540091900905774_pics-girls-7.jpg",
                //SMILE
                 }]);
                session.endDialog(msg);
             
         }
                
         }
         else{

         	//not with all
             var msg = new builder.Message(session)
            
            .attachments([{
            	
                contentType: "image/jpeg",
                contentUrl: "http://www.lgg3wallpaper.com/wp-content/uploads/Girl/Girl%20LG%20G3%20Wallpapers%2082.jpg",
            }]);
             session.endDialog(msg);
         }

         
         


        
    }


     



]);

const getImageStreamFromUrl = attachment => {
    var headers = {};
    if (isSkypeAttachment(attachment)) {
        // The Skype attachment URLs are secured by JwtToken,
        // you should set the JwtToken of your bot as the authorization header for the GET request your bot initiates to fetch the image.
        // https://github.com/Microsoft/BotBuilder/issues/662
        connector.getAccessToken((error, token) => {
            var tok = token;
            headers['Authorization'] = 'Bearer ' + token;
            headers['Content-Type'] = 'application/octet-stream';

            return needle.get(attachment.contentUrl, { headers: headers });
        });
    }

    headers['Content-Type'] = attachment.contentType;
    return needle.get(attachment.contentUrl, { headers: headers });
}

const isSkypeAttachment = attachment => {
    if (url.parse(attachment.contentUrl).hostname.substr(-"skype.com".length) == "skype.com") {
        return true;
    }

    return false;
}
//=========================================================
// Response Handling
//=========================================================
const handleSuccessResponse = (session, caption) => {
    if (caption) {
        session.send("I think it's " + caption);
    }
    else {
        session.send("Couldn't find a caption for this one");
    }

}

const handleErrorResponse = (session, error) => {
    session.send("Oops! Something went wrong. Try again later.");
    console.error(error);
}