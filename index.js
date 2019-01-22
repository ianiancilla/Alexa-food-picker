 // 1. Global variables =====================================================================================================
 let choiceMade = "";

 let launchOutput;
 let launchReprompt;
 let helpOutput;
 let cancelOutput;
 let stopOutput;
 let sessionEnded;
 let fallbackOutput;
 let fallbackReprompt;
 let repeatOutput;
 let twoOptionsOutput;
 let unhandledOutput;

 // 2. Skill Code =======================================================================================================
 "use strict";
 const Alexa = require('alexa-sdk');
 const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).
 const handlers = {
     'LaunchRequest': function () {
         this.emit(':ask', this.t("launchOutput"), this.t("launchReprompt"));
     },
     'AMAZON.HelpIntent': function () {
         this.emit(':ask', this.t("helpOutput"));
     },
    'AMAZON.CancelIntent': function () {
         this.emit(':tell', this.t("cancelOutput"));
     },
    'AMAZON.StopIntent': function () {
         this.emit(':tell', this.t("stopOutput"));
    },
    'SessionEndedRequest': function () {
         this.emit(':tell', this.t("sessionEnded"));
    },
     'AMAZON.FallbackIntent': function () {
         this.emit(":ask", this.t("fallbackOutput"), this.t("fallbackReprompt"));
     },
     'AMAZON.RepeatIntent': function () {
         this.emit(":tell", this.t("repeatOutput")+choiceMade);
     },
     'TwoOptions': function () {
         //any intent slot variables are listed here for convenience
         let choiceA = resolveCanonical(this.event.request.intent.slots.choice);
         console.log(choiceA);
         let choiceB = resolveCanonical(this.event.request.intent.slots.choiceB);
         console.log(choiceB);
         //Your custom intent handling goes here
         choiceMade = choose(choiceA,choiceB);
         this.emit(":tell", this.t("twoOptionsOutput")+choiceMade);
     },	
     'Unhandled': function () {
         this.emit(':ask', this.t("unhandledOutput"),  this.t("unhandledOutput"));
     }
 };
 exports.handler = (event, context) => {
     const alexa = Alexa.handler(event, context);
     alexa.appId = APP_ID;
     alexa.resources = languageStrings; // To enable string internationalization (i18n) features
     alexa.registerHandlers(handlers);
     alexa.execute();
 };
 //    END of Intent Handlers {} ========================================================================================

 // 3. Helper Function  =================================================================================================

 function choose (a, b) {
    let arr = [a, b];
    let random = Math.floor(Math.random()*2);
    return arr[random];
}
 
 function resolveCanonical(slot){
     //this function looks at the entity resolution part of request and returns the slot value if a synonyms is provided
     let canonical;
     try{
         canonical = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
     }catch(err){
         console.log(err.message);
         canonical = slot.value;
     };
     return canonical;
 };
 
 function delegateSlotCollection(){
   console.log("in delegateSlotCollection");
   console.log("current dialogState: "+this.event.request.dialogState);
     if (this.event.request.dialogState === "STARTED") {
       console.log("in Beginning");
       let updatedIntent= null;
       // updatedIntent=this.event.request.intent;
       //optionally pre-fill slots: update the intent object with slot values for which
       //you have defaults, then return Dialog.Delegate with this updated intent
       // in the updatedIntent property
       //this.emit(":delegate", updatedIntent); //uncomment this is using ASK SDK 1.0.9 or newer
       
       //this code is necessary if using ASK SDK versions prior to 1.0.9 
       if(this.isOverridden()) {
             return;
         }
         this.handler.response = buildSpeechletResponse({
             sessionAttributes: this.attributes,
             directives: getDialogDirectives('Dialog.Delegate', updatedIntent, null),
             shouldEndSession: false
         });
         this.emit(':responseReady', updatedIntent);
         
     } else if (this.event.request.dialogState !== "COMPLETED") {
       console.log("in not completed");
       // return a Dialog.Delegate directive with no updatedIntent property.
       //this.emit(":delegate"); //uncomment this is using ASK SDK 1.0.9 or newer
       
       //this code necessary is using ASK SDK versions prior to 1.0.9
         if(this.isOverridden()) {
             return;
         }
         this.handler.response = buildSpeechletResponse({
             sessionAttributes: this.attributes,
             directives: getDialogDirectives('Dialog.Delegate', null, null),
             shouldEndSession: false
         });
         this.emit(':responseReady');
         
     } else {
       console.log("in completed");
       console.log("returning: "+ JSON.stringify(this.event.request.intent));
       // Dialog is now complete and all required slots should be filled,
       // so call your normal intent handler.
       return this.event.request.intent;
     }
 }
 
 
 function randomPhrase(array) {
     // the argument is an array [] of words or phrases
     let i = 0;
     i = Math.floor(Math.random() * array.length);
     return(array[i]);
 }
 function isSlotValid(request, slotName){
         let slot = request.intent.slots[slotName];
         //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
         let slotValue;
 
         //if we have a slot, get the text and store it into speechOutput
         if (slot && slot.value) {
             //we have a value in the slot
             slotValue = slot.value.toLowerCase();
             return slotValue;
         } else {
             //we didn't get a value in the slot.
             return false;
         }
 }
 
 //These functions are here to allow dialog directives to work with SDK versions prior to 1.0.9
 //will be removed once Lambda templates are updated with the latest SDK
 
 function createSpeechObject(optionsParam) {
     if (optionsParam && optionsParam.type === 'SSML') {
         return {
             type: optionsParam.type,
             ssml: optionsParam['speech']
         };
     } else {
         return {
             type: optionsParam.type || 'PlainText',
             text: optionsParam['speech'] || optionsParam
         };
     }
 }
 
 function buildSpeechletResponse(options) {
     let alexaResponse = {
         shouldEndSession: options.shouldEndSession
     };
 
     if (options.output) {
         alexaResponse.outputSpeech = createSpeechObject(options.output);
     }
 
     if (options.reprompt) {
         alexaResponse.reprompt = {
             outputSpeech: createSpeechObject(options.reprompt)
         };
     }
 
     if (options.directives) {
         alexaResponse.directives = options.directives;
     }
 
     if (options.cardTitle && options.cardContent) {
         alexaResponse.card = {
             type: 'Simple',
             title: options.cardTitle,
             content: options.cardContent
         };
 
         if(options.cardImage && (options.cardImage.smallImageUrl || options.cardImage.largeImageUrl)) {
             alexaResponse.card.type = 'Standard';
             alexaResponse.card['image'] = {};
 
             delete alexaResponse.card.content;
             alexaResponse.card.text = options.cardContent;
 
             if(options.cardImage.smallImageUrl) {
                 alexaResponse.card.image['smallImageUrl'] = options.cardImage.smallImageUrl;
             }
 
             if(options.cardImage.largeImageUrl) {
                 alexaResponse.card.image['largeImageUrl'] = options.cardImage.largeImageUrl;
             }
         }
     } else if (options.cardType === 'LinkAccount') {
         alexaResponse.card = {
             type: 'LinkAccount'
         };
     } else if (options.cardType === 'AskForPermissionsConsent') {
         alexaResponse.card = {
             type: 'AskForPermissionsConsent',
             permissions: options.permissions
         };
     }
 
     let returnResult = {
         version: '1.0',
         response: alexaResponse
     };
 
     if (options.sessionAttributes) {
         returnResult.sessionAttributes = options.sessionAttributes;
     }
     return returnResult;
 }
 
 function getDialogDirectives(dialogType, updatedIntent, slotName) {
     let directive = {
         type: dialogType
     };
 
     if (dialogType === 'Dialog.ElicitSlot') {
         directive.slotToElicit = slotName;
     } else if (dialogType === 'Dialog.ConfirmSlot') {
         directive.slotToConfirm = slotName;
     }
 
     if (updatedIntent) {
         directive.updatedIntent = updatedIntent;
     }
     return [directive];
 }

 // LOCALISATION ======================================================================================================
 var languageStrings = {
    "en-GB": {
        "translation": {
            "launchOutput" : "Hello! Between which two foods do you want me to choose?",
            "launchReprompt": "Ask me to choose between two types of food. For example, you can ask me: pasta or pizza?",
            "helpOutput": "I can choose randomly between two types of food. For example, try asking: pasta or pizza?",
            "cancelOutput": "Ok",
            "stopOutput": 'Ok, see you later!',
            "sessionEnded": "",
            "fallbackOutput": "I'm sorry, I cannot help you with that, try asking something else.",
            "fallbackReprompt": "Try asking for something else.",
            "repeatOutput": "I said ",
            "twoOptionsOutput": "I choose ",
            "unhandledOutput": "I am not sure I understand. Can you try again?"
        }
    },
    "en-US": {
        "translation": {
            "launchOutput" : "Hello! Between which two foods do you want me to choose?",
            "launchReprompt": "Ask me to choose between two types of food. For example, you can ask me: pasta or pizza?",
            "helpOutput": "I can choose randomly between two types of food. For example, try asking: pasta or pizza?",
            "cancelOutput": "Ok",
            "stopOutput": 'Ok, see you later!',
            "sessionEnded": "",
            "fallbackOutput":  "I'm sorry, I cannot help you with that, try asking something else.",
            "fallbackReprompt": "Try asking for something else.",
            "repeatOutput": "I said ",
            "twoOptionsOutput": "I choose ",
            "unhandledOutput": "I am not sure I understand. Can you try again?"
        }
    },
    "en-IN": {
        "translation": {
            "launchOutput" : "Hello! Between which two foods do you want me to choose?",
            "launchReprompt": "Ask me to choose between two types of food. For example, you can ask me: pasta or pizza?",
            "helpOutput": "I can choose randomly between two types of food. For example, try asking: pasta or pizza?",
            "cancelOutput": "Ok",
            "stopOutput": 'Ok, see you later!',
            "sessionEnded": "",
            "fallbackOutput":  "I'm sorry, I cannot help you with that, try asking something else.",
            "fallbackReprompt": "Try asking for something else.",
            "repeatOutput": "I said ",
            "twoOptionsOutput": "I choose ",
            "unhandledOutput": "I am not sure I understand. Can you try again?"
        }
    },
    "en-AU": {
        "translation": {
            "launchOutput" : "Hello! Between which two foods do you want me to choose?",
            "launchReprompt": "Ask me to choose between two types of food. For example, you can ask me: pasta or pizza?",
            "helpOutput": "I can choose randomly between two types of food. For example, try asking: pasta or pizza?",
            "cancelOutput": "Ok",
            "stopOutput": 'Ok, see you later!',
            "sessionEnded": "",
            "fallbackOutput":  "I'm sorry, I cannot help you with that, try asking something else.",
            "fallbackReprompt": "Try asking for something else.",
            "repeatOutput": "I said ",
            "twoOptionsOutput": "I choose ",
            "unhandledOutput": "I am not sure I understand. Can you try again?"
        }
        
    },
    "en-CA": {
        "translation": {
            "launchOutput" : "Hello! Between which two foods do you want me to choose?",
            "launchReprompt": "Ask me to choose between two types of food. For example, you can ask me: pasta or pizza?",
            "helpOutput": "I can choose randomly between two types of food. For example, try asking: pasta or pizza?",
            "cancelOutput": "Ok",
            "stopOutput": 'Ok, see you later!',
            "sessionEnded": "",
            "fallbackOutput":  "I'm sorry, I cannot help you with that, try asking something else.",
            "fallbackReprompt": "Try asking for something else.",
            "repeatOutput": "I said ",
            "twoOptionsOutput": "I choose ",
            "unhandledOutput": "I am not sure I understand. Can you try again?"
        }
        
    },
    "it-IT": {
        "translation": {
            "launchOutput" : "Ciao! Tra quali due cibi vuoi che scelga?",
            "launchReprompt": "Chiedimi di scegliere tra due cibi. Per esempio, prova a chiedermi: pasta o pizza?",
            "helpOutput": "Posso scegliere in maniera casuale tra due tipi di cibo. Per esempio, prova a chiedermi: carne o pesce?",
            "cancelOutput": "Ok",
            "stopOutput": 'Ok, alla prossima!',
            "sessionEnded": "",
            "fallbackOutput": "Mi spiace, non so aiutarti. Prova a chiedermi qualcos'altro",
            "fallbackReprompt": "Prova a chiedermi qualcos'altro.",
            "repeatOutput": "Ho detto ",
            "twoOptionsOutput": "Stavolta scelgo ",
            "unhandledOutput": "Temo di non avere capito. Puoi riprovare?"
        }
    }
};
