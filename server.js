var restify = require('restify');
var builder = require('botbuilder');
var Face = require('oxford-face-api');
var face = new Face("8f7a031e5133417aa8b1f1ab525efec1");
var request = require("superagent");
var httprequest = require('request').defaults({ encoding: null });
const needle = require("needle"),
      url = require('url');

var fs = require('fs')
  , gm = require('gm');  

var azure = require('azure-storage'); 
var blobSvc = azure.createBlobService('13threaltimeinsight','fKxio8XGO776YjVV84gDgbYmVQiOdtGtiS9m/8AGoL1xPGK3Yyqso+lgz8wKCyG0vzZVi+UQvyn9L+e+K1CC/w==');
var person_index=-1;
var personid;
var person_confidence=1;
var young_person_index;
var max_age=999;
 
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
    appId: process.env.MICROSOFT_APP_ID || "fb994393-c778-4201-834e-ab09d051453c", 
    appPassword: process.env.MICROSOFT_APP_PASSWORD || "yP5fyHtaNn2GFpyqVzTSKGk"
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
 
//=========================================================
// Bots Dialogs
//=========================================================


bot.dialog('/', [

     function (session,args,next) {
         
         if(session.message.text=='CT'){
         	 
            var msg = new builder.Message(session)
            .attachments([{
                contentType: "image/jpeg",
                contentUrl: "http://www.bonavida.com.hk/wp-content/uploads/2014/02/101413-Kobe.jpg",
            }]);
            session.endDialog(msg);
         }
         else if(typeof session.message.attachments[0] !== 'undefined'){

            var tok; 
            connector.getAccessToken((error, token) => { 
                tok=token;
            }); 
            var options = {
                url: session.message.attachments[0].contentUrl,
                headers: {
                            'Content-Type': 'application/octet-stream',
                            'Authorization':'Bearer ' + tok
                          }
            };
            httprequest.get(options, function (error, response, body) {
                        
                if (!error && response.statusCode == 200) {
                             
                    var attachment_img = new Buffer(body,'binary');
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
                                if(!error && response.statusCode == 200) {
                                    var myJson = JSON.parse(JSON.stringify(response.body));
                                             
                                    for(i=0;i<myJson.length;i++){
                                      if(myJson[i].faceAttributes.age<max_age){
                                          young_person_index=i;
                                          max_age=myJson[i].faceAttributes.age;
                                      }
                                    }
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
                                          if(!error && response.statusCode == 200) {
                                              var identify_Json = JSON.parse(JSON.stringify(response.body));
                                              var i_index;
                                              for(i_index=0;i_index<identify_Json.length;i_index++){
                                                  if(identify_Json[i_index].candidates.length!=0){
                                                     person_index=i_index;
                                                     personid=identify_Json[i_index].candidates[0].personId;
                                                     person_confidence=identify_Json[i_index].candidates[0].confidence;
                                                         
                                                    }
  
                                              }
                                              var pic=gm(httprequest(options));
                                              pic.stroke('#FFBB00')
                                                 .strokeWidth(8);
                                              var x;
                                              var y;
                                              var width;
                                              var height;
                                              if(person_index==-1){
                                                   x=myJson[young_person_index].faceRectangle.left;
                                                   y=myJson[young_person_index].faceRectangle.top;
                                                   width=myJson[young_person_index].faceRectangle.width;
                                                   height=myJson[young_person_index].faceRectangle.height;
                                              }else{
                                                   x=myJson[person_index].faceRectangle.left;
                                                   y=myJson[person_index].faceRectangle.top;
                                                   width=myJson[person_index].faceRectangle.width;
                                                   height=myJson[person_index].faceRectangle.height;
                                              }
                                              pic.drawLine(x,y,x+width,y)
                                                 .drawLine(x,y,x,y+height)
                                                 .drawLine(x,y+height,x+width,y+height)
                                                 .drawLine(x+width,y,x+width,y+height);
                                                            
                                              var filename=(Math.random() + 1).toString(24).substring(4)+'.jpg';
                                              var dir_filename='./'+filename;
                                              pic.write(filename, function (err) {
                                              if (!err) {
                                                  blobSvc.createBlockBlobFromLocalFile('imagescontainer', filename, dir_filename, function(error, result, response){
                                                     if(error){
                                                        console.log("Couldn't upload stream");
                                                        console.error(error);
                                                     }
                                                     else {
                                                        console.log('Stream uploaded successfully');
                                                      }
                                                      var msg = new builder.Message(session);
                                                      msg.attachments([{
                                                          contentType: "image/jpeg",
                                                          contentUrl: "https://13threaltimeinsight.blob.core.windows.net/imagescontainer/"+filename,
                                                      }]);
                                                      session.endDialog(msg);   
                                                  });

                                              }else{
                                                  console.log(err);
                                              }
                                              });
                                                            
                                          }
                                          else{
                                            console.log(response.statusCode);
                                            console.log(error);
                                          } 
                                          });  
                                             
                                    return callback(null, response.body);

                                } 
                                else
                                {
                                    console.log(response.body);
                                    return callback(error);
                                }
                            }); 
                                  //object
                  

                }else
                {
                    console.log(response.statusCode);
                    console.log(error);
                    console.log(body);
                }
            });
                         
         }
         else{

            var msg = new builder.Message(session)
            .attachments([{
                contentType: "image/jpeg",
                contentUrl: "http://www.lgg3wallpaper.com/wp-content/uploads/Girl/Girl%20LG%20G3%20Wallpapers%2082.jpg",
            }]);
            session.endDialog(msg);
         }
     }
]);

 