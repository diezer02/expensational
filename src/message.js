/*
 * message.js
 * This file contains your bot code
 */

const recastai = require('recastai');
const download = require('image-downloader');
const Vision =  require('@google-cloud/vision');
const promiseWaterfall = require('promise.waterfall');
const  request2 = require('superagent');
// This function is the core of the bot behaviour
const replyMessage = (message) => {
  const vision = new Vision();
  // Instantiate Recast.AI SDK, just for request service
  const request = new recastai.request(process.env.REQUEST_TOKEN, process.env.LANGUAGE)
  // Get text from message received
  const text = message.content

  console.log('I receive: ', text)

  // Get senderId to catch unique conversation_token
  const senderId = message.senderId

  // Call Recast.AI SDK, through /converse route
  request.converseText(text, { conversationToken: senderId })
  .then(result => {
    /*
    * YOUR OWN CODE
    * Here, you can add your own process.
    * Ex: You can call any external API
    * Or: Update your mongo DB
    * etc...
    */
    //console.log('resultat', result);
        
    if (result.action) {
      console.log('The conversation action is: ', result.action.slug)
    }

    // If there is not any message return by Recast.AI for this current conversation
    if (!result.replies.length) {
      message.addReply({ type: 'text', content: 'I don\'t have the reply to this yet :)' })
    } else {
      // Add each reply received from API to replies stack
      result.replies.forEach(replyContent => message.addReply({ type: 'text', content: replyContent }))
    }

    // Send all replies
    message.reply()
    .then(() => {
      // Download to a directory and save with the original filename 
       //console.log("init", message);
      const options = {
        url: result.source,
        dest: './photo.jpg'                  // Save to /path/to/dest/image.jpg 
      }
      
      download.image(options);
       var s = "";
     /*return download.image(options).then(({ filename, image }) => {
      
       
        return*/
        var test = message;
        console.log('test',test)
         vision.detectText('./photo.jpg').then((results) => {
            console.log('test2',test)
            const detections = results[0];
            detections.forEach((text) =>{
              console.log('test', text);
              s += text;
              test.addReply([{ type: 'text', content: text }])
            });
        
          console.log('reply',test);
          test.reply();
          request2.post('https://api.recast.ai/connect/v1/conversations/30999978-d795-4b77-bd3a-61bcccfac8d9/messages').set('Authorization', 'Token a869b3961fa080c090cb0ec743c0135d').send({ messages: [{ type: 'text', content: 'Hello, world!'+ test }] }).end(function(err, res) {
    console.log(res);
  });

        })
        .catch((err) => {
          console.error('ERROR:', err);
        });

      /*}).catch((err) => {
        throw err
      })*/
      
      
      // Do some code after sending messages
    })
    .catch(err => {
      console.error('Error while sending message to channel', err)
    })
  })
  .catch(err => {
    console.error('Error while sending message to Recast.AI', err)
  })

 
}

module.exports = replyMessage
