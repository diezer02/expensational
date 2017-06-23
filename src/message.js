/*
 * message.js
 * This file contains your bot code
 */

 const recastai = require('recastai');
 const download = require('image-downloader');
 const Vision =  require('@google-cloud/vision');
 const promiseWaterfall = require('promise.waterfall');
 const  request2 = require('superagent');
 const escape = require('escape-html');
// This function is the core of the bot behaviour
const replyMessage = (message) => {
  const vision = new Vision();
  // Instantiate Recast.AI SDK, just for request service
  const request = new recastai.request(process.env.REQUEST_TOKEN, process.env.LANGUAGE)
  // Get text from message received
  const text = message.content

  //console.log('I receive: ', text)

  // Get senderId to catch unique conversation_token
  const senderId = message.senderId

  // Call Recast.AI SDK, through /converse route
  request.converseText(text, { conversationToken: senderId })
  .then(conversation => {
    /*
    * YOUR OWN CODE
    * Here, you can add your own process.
    * Ex: You can call any external API
    * Or: Update your mongo DB
    * etc...
    */
    console.log('conversationat', message);


    // If there is not any message return by Recast.AI for this current conversation
    if (message.type === 'picture'){
      message.addReply({ type: 'text', content: 'Veuillez patienter, nous traitons votre demande.' })
    } else if (!conversation.replies.length) {
      message.addReply({ type: 'text', content: 'I don\'t have the reply to this yet :)' })
    } else {
      // Add each reply received from API to replies stack
      conversation.replies.forEach(replyContent => message.addReply({ type: 'text', content: replyContent }))
    }

    // Send all replies
    return message.reply()
    .then(() => {
      // Download to a directory and save with the original filename 

      // Gestion case de l'envoi du ticket
      console.log("init", conversation);
      if (message.type === 'picture') {
        const options = {
          url: conversation.source,
          dest: './photo.jpg'                  // Save to /path/to/dest/image.jpg 
        }

        console.log("after modif", conversation);
        return download.image(options).then(()=> {
          var s = "";

          var promiseMsg = message;
          vision.detectText('./photo.jpg').then((results) => {
          console.log(len(results))
          const detections = results[0];
          detections.forEach((text) =>{
            // console.log('test', text);
            //if(text.lowerCase().indexOf('total'))
            s += text;
            promiseMsg.addReply([{ type: 'text', content: text }])
          });

          return message.reply([{ type: 'text', content:  escape(s.substring(600)) }]);
          // request2.post('https://api.recast.ai/connect/v1/conversations/'+message.conversationId+'/messages').set('Authorization', 'Token a869b3961fa080c090cb0ec743c0135d')
          // .send(
          //   { messages: [{ type: 'text', content:  escape(s.substring(600)) }] }
          // ).end(function(err, res) {
          //       console.log('error', err);
          //  });

          // })
         }).catch((err) => {
            console.error('ERROR:', err);
         })
       })
      }
    })
  })
  .catch(err => {
    console.error('Error while sending message to Recast.AI', err)
  })
}

module.exports = replyMessage
