var restify = require('restify');
var builder = require('botbuilder');
var Face = require('oxford-face-api');
var face = new Face("8f7a031e5133417aa8b1f1ab525efec1");
var request = require("superagent");
 
var httprequest = require('request').defaults({ encoding: null });
;
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
  , gm = require('gm') ;

var azure = require('azure-storage'); 
var blobSvc = azure.createBlobServiceAnonymous('http://13threaltimeinsight.blob.core.windows.net/imagescontainer/');

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
                    
                    httprequest.get(session.message.attachments[0].contentUrl, function (error, response, body) {
                        
                        if (!error && response.statusCode == 200) {
                            //data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('binary');
                            //console.log(data);
                           //console.log(response);
                            //console.log(body);
                            var attachment_img = new Buffer(body,'binary');
                            console.log(attachment_img);
                            var request_body= attachment_img ;
                            
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
                                            console.log(myJson.length);
                                            console.log(myJson[0].faceAttributes.age);//work
                                            var x=myJson[0].faceRectangle.left;
                                            var y=myJson[0].faceRectangle.top;
                                            var width=myJson[0].faceRectangle.width;
                                            var height=myJson[0].faceRectangle.height;
                                            var u= session.message.attachments[0].contentUrl;
                                            var pic=gm(httprequest(u));
                                            pic.stroke('#FFBB00')
                                               .strokeWidth(4);
                                            for(i=0;i<myJson.length;i++){
                                              var x=myJson[i].faceRectangle.left;
                                              var y=myJson[i].faceRectangle.top;
                                              var width=myJson[i].faceRectangle.width;
                                              var height=myJson[i].faceRectangle.height;
                                              pic.drawLine(x,y,x+width,y)
                                                 .drawLine(x,y,x,y+height)
                                                 .drawLine(x,y+height,x+width,y+height)
                                                 .drawLine(x+width,y,x+width,y+height);
                                            }
                                            var writeStream ;
                                            pic.write('./output.jpg', function (err) {
                                                if (!err) console.log('doooooone');
                                                 console.log(err);
                                                });
                                            /*
                                            pic.toBuffer('JPG',function (err, buffer) {
                                                  if (err) return handle(err);
                                                  console.log('done!');
                                                  console.log(buffer);
                                                  


                                                });
                                            blobSvc.createBlockBlobFromLocalFile('imagescontainer', '13threaltimeinsight', './final.jpg', function(error, result, response){
                                                if(error){
                                                          console.log("Couldn't upload stream");
                                                          console.error(error);
                                                      } else {
                                                          console.log('Stream uploaded successfully');
                                                      }
                                              });*/
                                            /*blobSvc.createBlockBlobFromStream(
                                                  'imagescontainer',
                                                  '13threaltimeinsight',
                                                  buffer,
                                                  buffer.length,
                                                  function(error, result, response){
                                                      if(error){
                                                          console.log("Couldn't upload stream");
                                                          console.error(error);
                                                      } else {
                                                          console.log('Stream uploaded successfully');
                                                      }
                                                  });*/



                                           /* pic.write('./final.jpg', function (err) {
                                                if (!err) console.log('doooooone');
                                                 console.log(err);
                                                });
                                            gm(httprequest(u))
                                                .stroke('#FFBB00')
                                                .strokeWidth(4)

                                                .drawLine(x,y,x+width,y)
                                                .drawLine(x,y,x,y+height)
                                                .drawLine(x,y+height,x+width,y+height)
                                                .drawLine(x+width,y,x+width,y+height)
                                                //.drawCircle(myJson[0].faceRectangle.left, myJson[0].faceRectangle.top, myJson[0].faceRectangle.width,myJson[0].faceRectangle.height)
                                                .write('./final.jpg', function (err) {
                                                if (!err) console.log('doooooone');
                                                 console.log(err);
                                                });*/
                                            return callback(null, response.body);
                                        } else {

                                          console.log(response.body);
                                            return callback(error);
                                        }
                                  });      

                        }else{
                          console.log(response.statusCode);
                        }
                    });
                         /*
                       fs.readFile('C:/Users/v-huhaor/Desktop/BotFramework/pict.jpg', function(err, data) {
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
                                    console.log(myJson[0]);//work
                                    console.log(myJson[0].faceRectangle.top);//work
                                    var u= session.message.attachments[0].contentUrl;
                                    gm(httprequest(u))
                                        .stroke("#123456")
                                        .drawCircle(100, 100, 200, 100)
                                       
                                        .write('./reformat.jpg', function (err) {
                                        if (!err) console.log('doooooone');
                                         console.log(err);
                                        });
                                    return callback(null, response.body);
                                } else {

                                  console.log(response.body);
                                    return callback(error);
                                }
                           
                        });
                     
                   
                        });*/
               
                 //object
                console.log('%s listening to',session.message.attachments[0].contentType); 
                // face api
                var msg = new builder.Message(session)
            
                .attachments([{
                
                contentType: "image/jpeg",
                contentUrl: "https://13threaltimeinsight.blob.core.windows.net/imagescontainer/oic.jpg",
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