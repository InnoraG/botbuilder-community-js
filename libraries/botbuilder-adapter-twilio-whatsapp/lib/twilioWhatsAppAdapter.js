"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioWhatsAppAdapter = exports.WhatsAppActivityTypes = void 0;
/**
 * @module botbuildercommunity/adapter-twilio-whatsapp
 */
const botbuilder_1 = require("botbuilder");
const Twilio = require("twilio");
const core_1 = require("@botbuildercommunity/core");
const axios_1 = require("axios");
/**
 * Defines values for WhatsAppActivityTypes.
 * Possible values include: 'messageRead', 'messageDelivered', 'messageSent', 'messageQueued', 'messageFailed'
 * https://www.twilio.com/docs/sms/whatsapp/api#monitor-the-status-of-your-whatsapp-outbound-message
 * @readonly
 * @enum {string}
 */
var WhatsAppActivityTypes;
(function (WhatsAppActivityTypes) {
    WhatsAppActivityTypes["MessageRead"] = "messageRead";
    WhatsAppActivityTypes["MessageDelivered"] = "messageDelivered";
    WhatsAppActivityTypes["MessageSent"] = "messageSent";
    WhatsAppActivityTypes["MessageQueued"] = "messageQueued";
    WhatsAppActivityTypes["MessageFailed"] = "messageFailed";
})(WhatsAppActivityTypes = exports.WhatsAppActivityTypes || (exports.WhatsAppActivityTypes = {}));
/**
 * Bot Framework Adapter for [Twilio Whatsapp](https://www.twilio.com/whatsapp)
 */
class TwilioWhatsAppAdapter extends core_1.CustomWebAdapter {
    /**
     * Creates a new TwilioWhatsAppAdapter instance.
     * @param settings configuration settings for the adapter.
     */
    constructor(settings, botFrameworkAdapterSettings) {
        super(botFrameworkAdapterSettings);
        this.channel = 'whatsapp';
        this.settings = settings;
        if (!this.settings.accountSid || !this.settings.authToken || !this.settings.phoneNumber || !this.settings.endpointUrl) {
            throw new Error(`TwilioWhatsAppAdapter.constructor(): Required TwilioWhatsAppAdapterSettings missing.`);
        }
        // Add required `whatsapp:` prefix if not exists
        if (!this.settings.phoneNumber.startsWith('whatsapp:')) {
            this.settings.phoneNumber = 'whatsapp:' + this.settings.phoneNumber;
        }
        try {
            this.client = this.createTwilioClient(settings.accountSid, settings.authToken);
        }
        catch (error) {
            throw new Error(`TwilioWhatsAppAdapter.constructor(): ${error.message}.`);
        }
    }
    /**
     * Sends a set of outgoing activities to the appropriate channel server.
     *
     * @param context Context for the current turn of conversation with the user.
     * @param activities List of activities to send.
     */
    sendActivities(context, activities) {
        return __awaiter(this, void 0, void 0, function* () {
            const responses = [];
            for (let i = 0; i < activities.length; i++) {
                const activity = activities[i];
                switch (activity.type) {
                    case 'delay':
                        yield this.delay(activity.value);
                        responses.push({});
                        break;
                    case botbuilder_1.ActivityTypes.Message:
                        if (!activity.conversation || !activity.conversation.id) {
                            throw new Error(`TwilioWhatsAppAdapter.sendActivities(): Activity doesn't contain a conversation id.`);
                        }
                        // eslint-disable-next-line no-case-declarations
                        const message = this.parseActivity(activity);
                        try {
                            this.processOutboundEvent(activity, message);
                            responses.push({ id: 'res.sid' });
                        }
                        catch (error) {
                            throw new Error(`TwilioWhatsAppAdapter.sendActivities(): ${error.message}.`);
                        }
                        break;
                    default:
                        responses.push({});
                        console.warn(`TwilioWhatsAppAdapter.sendActivities(): Activities of type '${activity.type}' aren't supported.`);
                }
            }
            return responses;
        });
    }
    processOutboundEvent(activity, message) {
        const customEndpointURL = activity.serviceUrl; //this.caps.TWILIO_WHATSAPP_BOT_ENDPOINT;
        const sidString = activity.replyToId; //'SM3b3aede1b6efd64cca02f55bfdc3e5ee';
        const accSidString = "AC6c052941e00067bdecd68b80874c5529";
        const toNumber = activity.recipient.id.replace('whatsapp:', ''); //activity.to.replace('+', '');
        const fromNumber = activity.from.id.replace('whatsapp:', ''); //activity.from.replace('+:', '');
        //const serviceUrl = null;//`http://${process.env.TWILIO_WHATSAPP_BOTIUMDOMAIN || 'localhost'}:${this.caps.TWILIO_SMS_INBOUNDPORT}${this.caps.TWILIO_SMS_INBOUNDENDPOINT}/sms`;
        const reqFinalBodySignature = {
            SmsMessageSid: sidString,
            NumMedia: "0",
            ProfileName: "Ronni",
            SmsSid: sidString,
            WaId: fromNumber,
            SmsStatus: "received",
            Body: message.body,
            To: toNumber,
            NumSegments: "1",
            MessageSid: sidString,
            AccountSid: accSidString,
            From: fromNumber,
            ApiVersion: "2010-04-01",
            //serviceUrl: serviceUrl
        };
        const reqFinalBody = `SmsMessageSid=${sidString}&NumMedia=0&ProfileName=Ronni&SmsSid=${sidString}&WaId=${fromNumber}&SmsStatus=received&Body=${reqFinalBodySignature.Body}&To=whatsapp%3A%2B${toNumber}&NumSegments=1&MessageSid=${sidString}&AccountSid=${accSidString}&From=whatsapp%3A%2B${fromNumber}&ApiVersion=2010-04-01`; //&serviceUrl=${serviceUrl}`;
        //const reqFinalBodyConstruct = Object.keys(reqFinalBodySignature).map(key => key + '=' + reqFinalBodySignature[key]).join('&');
        //const authToken = this.caps.TWILIO_SMS_AUTH_TOKEN;
        //console.log(authToken)
        console.log(customEndpointURL);
        console.log((reqFinalBodySignature));
        //const twilioSignature = webhooks.getExpectedTwilioSignature(authToken, customEndpointURL, (reqFinalBodySignature));
        //console.log(twilioSignature)
        axios_1.default.post(customEndpointURL, reqFinalBody, {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'Connection': 'close',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Twilio-Signature': 'twilioSignature'
                //'content-type': 'text/json'
            }
        })
            .then(message => {
            console.log(`Sending message. "${JSON.stringify(reqFinalBody)}" is ${message.statusText} - ${message.status}`);
        })
            .catch(err => {
            console.log(`Failed to send message. Parameters may be incorrect: "${JSON.stringify(reqFinalBody)}" Error: "${err}"`);
            throw err;
        });
        /*return this.client.messages
          .create(opts)
          .then(message => debug(`Sending message. "${JSON.stringify(opts)}"`))
          .catch(err => {
            debug(`Failed to send message. Parameters may be incorrect: "${JSON.stringify(opts)}" Error: "${err}"`)
            throw err
          })*/
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateActivity(context, activity) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not supported by Twilio WhatsApp API.');
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteActivity(context, reference) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not supported by Twilio WhatsApp API.');
        });
    }
    /**
     * Resume a conversation with a user, possibly after some time has gone by.
     *
     * @param reference A `ConversationReference` saved during a previous incoming activity.
     * @param logic A function handler that will be called to perform the bots logic after the the adapters middleware has been run.
     */
    continueConversation(reference, logic) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = botbuilder_1.TurnContext.applyConversationReference({ type: 'event', name: 'continueConversation' }, reference, true);
            const context = this.createContext(request);
            return this.runMiddleware(context, logic);
        });
    }
    /**
     * Processes an incoming request received by the bots web server into a TurnContext.
     *
     * @param req An Express or Restify style Request object.
     * @param res An Express or Restify style Response object.
     * @param logic A function handler that will be called to perform the bots logic after the received activity has been pre-processed by the adapter and routed through any middleware for processing.
     */
    processActivity(req, res, logic) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate if requests are coming from Twilio
            // https://www.twilio.com/docs/usage/security#validating-requests
            if (!(req === null || req === void 0 ? void 0 : req.headers['x-twilio-signature']) && !(req === null || req === void 0 ? void 0 : req.headers['X-Twilio-Signature'])) {
                console.warn(`TwilioWhatsAppAdapter.processActivity(): request doesn't contain a Twilio Signature.`);
                res.status(401);
                res.end();
                return;
            }
            const signature = req.headers['x-twilio-signature'] || req.headers['X-Twilio-Signature'];
            const authToken = this.settings.authToken;
            const requestUrl = this.settings.endpointUrl;
            const message = yield this.retrieveBody(req);
            if (!message) {
                res.status(400);
                res.end();
                return;
            }
            const isTwilioRequest = this.validateRequest(authToken, signature, requestUrl, message);
            if (!isTwilioRequest) {
                console.warn(`TwilioWhatsAppAdapter.processActivity(): request doesn't contain a valid Twilio Signature.`);
                res.status(403);
                res.end();
                return;
            }
            // Handle events
            const activity = {
                id: message.MessageSid,
                timestamp: new Date(),
                channelId: this.channel,
                conversation: {
                    id: message.From,
                    isGroup: false,
                    conversationType: null,
                    tenantId: null,
                    name: ''
                },
                from: {
                    id: message.From,
                    name: '' // Supported by WhatsApp, not supported by Twilio API yet.
                },
                recipient: {
                    id: message.To,
                    name: ''
                },
                text: message.Body,
                channelData: message,
                localTimezone: null,
                callerId: null,
                serviceUrl: message.serviceUrl,
                listenFor: null,
                label: message.MessagingServiceSid,
                valueType: null,
                type: null
            };
            // Detect Activity Type
            if (message.SmsStatus) {
                switch (message.SmsStatus.toLowerCase()) {
                    case 'sent':
                        activity.type = WhatsAppActivityTypes.MessageSent;
                        break;
                    case 'received':
                        activity.type = botbuilder_1.ActivityTypes.Message;
                        break;
                    case 'delivered':
                        activity.type = WhatsAppActivityTypes.MessageDelivered;
                        break;
                    case 'read':
                        activity.type = WhatsAppActivityTypes.MessageRead;
                        break;
                    default:
                        console.warn(`TwilioWhatsAppAdapter.processActivity(): SmsStatus of type '${message.SmsStatus}' is not supported.`);
                }
            }
            if (message.EventType) {
                switch (message.EventType.toLowerCase()) {
                    case 'delivered':
                        activity.type = WhatsAppActivityTypes.MessageDelivered;
                        break;
                    case 'read':
                        activity.type = WhatsAppActivityTypes.MessageRead;
                        break;
                    case 'received':
                        activity.type = botbuilder_1.ActivityTypes.Message;
                        break;
                    default:
                        console.warn(`TwilioWhatsAppAdapter.processActivity(): EventType of type '${message.EventType}' is not supported.`);
                }
            }
            activity.attachments = [];
            // Message Received
            if (activity.type === botbuilder_1.ActivityTypes.Message) {
                // Has attachments?
                if (message.NumMedia && parseInt(message.NumMedia) > 0) {
                    const amount = parseInt(message.NumMedia);
                    for (let i = 0; i < amount; i++) {
                        const attachment = {
                            contentType: message['MediaContentType' + i],
                            contentUrl: message['MediaUrl' + i]
                        };
                        activity.attachments.push(attachment);
                    }
                }
                // Has location?
                // Latitude=37.7879277&Longitude=-122.3937508&Address=375+Beale+St%2C+San+Francisco%2C+CA+94105
                if (message.Latitude && message.Longitude) {
                    const geo = {
                        elevation: null,
                        type: 'GeoCoordinates',
                        latitude: parseFloat(message.Latitude),
                        longitude: parseFloat(message.Longitude),
                        name: message.Address
                    };
                    const attachment = {
                        contentType: 'application/json',
                        content: geo,
                        name: message.Address
                    };
                    activity.attachments.push(attachment);
                }
            }
            // Create a Conversation Reference
            const context = this.createContext(activity);
            context.turnState.set('httpStatus', 200);
            yield this.runMiddleware(context, logic);
            // Send HTTP response back
            res.status(context.turnState.get('httpStatus'));
            if (context.turnState.get('httpBody')) {
                res.send(context.turnState.get('httpBody'));
            }
            else {
                res.end();
            }
        });
    }
    /**
     * Allows for the overriding of the context object in unit tests and derived adapters.
     * @param request Received request.
     */
    createContext(request) {
        return new botbuilder_1.TurnContext(this, request);
    }
    /**
     * Allows for the overriding of the Twilio object in unit tests and derived adapters.
     * @param accountSid Twilio AccountSid
     * @param authToken Twilio Auth Token
     */
    validateRequest(authToken, signature, requestUrl, message) {
        return Twilio.validateRequest(authToken, signature, requestUrl, message);
    }
    /**
     * Allows for the overriding of the Twilio object in unit tests and derived adapters.
     * @param accountSid Twilio AccountSid
     * @param authToken Twilio Auth Token
     */
    createTwilioClient(accountSid, authToken) {
        return Twilio(accountSid, authToken);
    }
    /**
     * Transform Bot Framework Activity to a Twilio Message.
     *
     * @param activity Activity to transform
     */
    parseActivity(activity) {
        var _a, _b, _c;
        // Change formatting to WhatsApp formatting
        if (activity.text) {
            // Bold <b></b>
            activity.text = activity.text.replace(/<b>(.*?)<\/b>/gis, '*$1*');
            //<i></i>
            activity.text = activity.text.replace(/<i>(.*?)<\/i>/gis, '_$1_');
            //<s></s>
            activity.text = activity.text.replace(/<s>(.*?)<\/s>/gis, '~$1~');
            //<code></code>
            activity.text = activity.text.replace(/<code>(.*?)<\/code>/gis, '```$1```');
        }
        // Handle mentions
        // Not supported by current Twilio WhatsApp API yet
        // Create new Message for Twilio
        // @ts-ignore Using any since MessageInstance interface doesn't include `mediaUrl`
        const message = {
            body: activity.text,
            from: this.settings.phoneNumber,
            to: activity.conversation.id
        };
        // Handle Persistant Actions (like locations)
        // https://www.twilio.com/docs/sms/whatsapp/api#location-messages-with-whatsapp
        if ((_a = activity === null || activity === void 0 ? void 0 : activity.channelData) === null || _a === void 0 ? void 0 : _a.persistentAction) {
            if (Array.isArray(activity.channelData.persistentAction)) {
                message.persistentAction = activity.channelData.persistentAction;
            }
            else {
                message.persistentAction = [activity.channelData.persistentAction];
            }
        }
        // Handle attachments
        // One media attachment is supported per message, with a size limit of 5MB.
        // https://www.twilio.com/docs/sms/whatsapp/api#sending-a-freeform-whatsapp-message-with-media-attachment
        if (((_b = activity === null || activity === void 0 ? void 0 : activity.attachments) === null || _b === void 0 ? void 0 : _b.length) > 0) {
            const attachment = activity.attachments[0];
            switch (attachment.contentType) {
                case 'application/vnd.microsoft.card.signin':
                    // eslint-disable-next-line no-case-declarations
                    const signin = attachment.content;
                    message.body = `${signin.text}\n\n`;
                    message.body += (signin.buttons[0].title ? `*${signin.buttons[0].title}*\n` : '');
                    message.body += signin.buttons[0].value;
                    break;
                case 'application/json':
                    if (((_c = attachment.content) === null || _c === void 0 ? void 0 : _c.type) === 'GeoCoordinates') {
                        const geo = attachment.content;
                        message.persistentAction = [`geo:${geo.latitude},${geo.longitude}${(geo.name ? `|${geo.name}` : '')}`];
                    }
                    break;
                default:
                    // Check if contentUrl is provided
                    if (attachment.contentUrl) {
                        message.mediaUrl = attachment.contentUrl;
                    }
                    else {
                        console.warn(`TwilioWhatsAppAdapter.parseActivity(): Attachment ignored. Attachment without contentUrl is not supported.`);
                    }
                    break;
            }
        }
        // Messages without text or mediaUrl are not valid
        if (!message.body && !message.mediaUrl) {
            throw new Error(`TwilioWhatsAppAdapter.parseActivity(): An activity text or attachment with contentUrl must be specified.`);
        }
        return message;
    }
}
exports.TwilioWhatsAppAdapter = TwilioWhatsAppAdapter;
//# sourceMappingURL=twilioWhatsAppAdapter.js.map