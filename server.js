var restify = require('restify');
var builder = require('botbuilder');
var Face = require('oxford-face-api');
var face = new Face("8f7a031e5133417aa8b1f1ab525efec1");
var request = require("superagent");
 
var httprequest = require('request').defaults({ encoding: null });

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
var blobSvc = azure.createBlobService('13threaltimeinsight','fKxio8XGO776YjVV84gDgbYmVQiOdtGtiS9m/8AGoL1xPGK3Yyqso+lgz8wKCyG0vzZVi+UQvyn9L+e+K1CC/w==');
var person_index;
var personid;
var person_confidence=1;
/*
gm('./testpng.png')
 
.write('./outpng.png', function (err) {
  if (!err) console.log('done');
  console.log(err);
});*/


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
         }
         else if(typeof session.message.attachments[0] !== 'undefined'){

            //if(session.message.attachments[0].contentType == 'image/jpeg' || session.message.attachments[0].contentType == 'image/png'){
                    
                    httprequest.get(session.message.attachments[0].contentUrl, function (error, response, body) {
                        
                        if (!error && response.statusCode == 200) {
                             
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
                                            var faceid="";
                                            for(j=0;j<myJson.length;j++){
                                                faceid=faceid+myJson[j].faceId;
                                                if(j!=myJson.length-1){
                                                  faceid=faceid+",";
                                                }
                                            }
                                            var array = faceid.split(',');
                                            var identify_reqbody={
                                                    "personGroupId":"mtcbotdemo",
                                                    "faceIds":array,
                                                    "maxNumOfCandidatesReturned":1,
                                                    "confidenceThreshold": 0.5
                                            };
                                            
                                            request
                                            .post( "https://api.projectoxford.ai/face/v1.0" + "/identify")
                                            .set('Content-Type', 'application/json')
                                            .set('Ocp-Apim-Subscription-Key', '8f7a031e5133417aa8b1f1ab525efec1' )
                                            .send(identify_reqbody)
                                            .end(function(error, response) {
                                                console.log(session.message.attachments[0].contentUrl);
                                               
                                                var lock=0;
                                                if(!error && response.statusCode == 200) {
                                                var identify_Json = JSON.parse(JSON.stringify(response.body));
                                                //console.log(myJson.length);
                                                //console.log(myJson[0].faceAttributes.age);//work
                                                var i_index;
                                                console.log(identify_Json.length);
                                                 console.log("lolololololololololo");
                                                  for(i_index=0;i_index<identify_Json.length;i_index++){
                                                       console.log(identify_Json[i_index].candidates.length);
                                                       if(identify_Json[i_index].candidates.length!=0){
                                                        person_index=i_index;
                                                        personid=identify_Json[i_index].candidates[0].personId;
                                                        person_confidence=identify_Json[i_index].candidates[0].confidence;
                                                        console.log(identify_Json[i_index].candidates[0].confidence);
                                                        console.log(personid);
                                                       }
  
                                                  }
                                                    
                                                   
                                                            var localurl= session.message.attachments[0].contentUrl;
                                                            console.log(localurl);
                                                            console.log(myJson[person_index].faceRectangle.left);
                                                            var pic=gm(httprequest(localurl));
                                                            console.log(myJson[person_index].faceRectangle.left);
                                                            pic.stroke('#FFBB00')
                                                               .strokeWidth(8);
                                                            
                                                            var x=myJson[person_index].faceRectangle.left;
                                                            var y=myJson[person_index].faceRectangle.top;
                                                            var width=myJson[person_index].faceRectangle.width;
                                                            var height=myJson[person_index].faceRectangle.height;

                                                            pic.drawLine(x,y,x+width,y)
                                                                .drawLine(x,y,x,y+height)
                                                                .drawLine(x,y+height,x+width,y+height)
                                                                 .drawLine(x+width,y,x+width,y+height);
                                                            
                                                            var writeStream ;
                                                            var filename=(Math.random() + 1).toString(24).substring(4)+'.jpg';
                                                            console.log(filename);
                                                            var dir_filename='./'+filename+'.jpg';
                                                            console.log(dir_filename);
                                                            pic.write(dir_filename, function (err) {
                                                                  if (!err) {
                                                                  blobSvc.createBlockBlobFromLocalFile('imagescontainer', filename, dir_filename, function(error, result, response){
                                                                      if(error){
                                                                                console.log("Couldn't upload stream");
                                                                                console.error(error);
                                                                            }
                                                                            else {
                                                                              console.log(result);
                                                                              console.log(response.statusCode);
                                                                              console.log('Stream uploaded successfully');
                                                                              console.log('%s listening to',session.message.attachments[0].contentType); 
                                                                            }
                                                                            var msg = new builder.Message(session);
                                                    
                                                                                msg.attachments([{
                                                                                contentType: "image/jpeg",
                                                                                contentUrl: "https://13threaltimeinsight.blob.core.windows.net/imagescontainer/"+filename,
                                                                                //SMILE
                                                                                 }]);
                                                                                session.endDialog(msg);   
                                                                  });

                                                                  }else{
                                                                  console.log(err);
                                                                  }

                                                            });
                                                             /*
                                                             request
                                                            .get( "https://api.projectoxford.ai/face/v1.0" + "/persongroups/"+"mtcbotdemo/persons/"+personid)
                                                            
                                                            .set('Ocp-Apim-Subscription-Key', '8f7a031e5133417aa8b1f1ab525efec1' )
                                                             
                                                            .end(function(error, response) {
                                                                 if(!error && response.statusCode == 200) {
                                                                  console.log(response.statusCode);
                                                                    var Per_J = JSON.parse(JSON.stringify(response.body));
                                                                    console.log( "adasdasdasdasdasdasdasdas" );
                                                                 }
                                                                 else{
                                                                     console.log(response.statusCode);
                                                                     console.log(error);
                                                                }
                                                            });*/

                                                    

                                                }
                                                else{
                                                console.log(response.statusCode);
                                                console.log(error);
                                                }
                                                
                                                 
                                            });  
                                             
                                            return callback(null, response.body);

                                        } else {

                                           console.log(response.body);
                                            return callback(error);
                                        }
                                  }); 
                                  //object
                  

                        }else{
                          console.log(response.statusCode);
                          console.log(error);
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