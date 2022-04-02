/**
 * @module botbuildercommunity/adapter-twilio-whatsapp
 */
import { Activity, TurnContext, ConversationReference, ResourceResponse, WebRequest, WebResponse, BotFrameworkAdapterSettings } from 'botbuilder';
import * as Twilio from 'twilio';
import { CustomWebAdapter } from '@botbuildercommunity/core';
/**
 * Settings used to configure a `TwilioWhatsAppAdapter` instance.
 */
export interface TwilioWhatsAppAdapterSettings {
    /**
     * [Application SID](https://support.twilio.com/hc/en-us/articles/223136607-What-is-an-Application-SID-)
     */
    accountSid: string;
    /**
     * [Auth Token](https://support.twilio.com/hc/en-us/articles/223136027-Auth-Tokens-and-How-to-Change-Them)
     */
    authToken: string;
    /**
     * The From parameter consisting of whatsapp: followed by the sending WhatsApp number (using E.164 formatting).
     * Until your Twilio number has been enabled for the beta, use your [WhatsApp Sandbox number](https://support.twilio.com/hc/en-us/articles/360007721954-Getting-Started-with-Twilio-for-WhatsApp-Beta-#senderID) for sending messages.
     */
    phoneNumber: string;
    /**
     * Full URL of the request URL you specify for your phone number or app,
     * from the protocol (https...) through the end of the query string (everything after the ?).
     * https://www.twilio.com/docs/usage/security#validating-requests
     */
    endpointUrl: string;
}
/**
 * Defines values for WhatsAppActivityTypes.
 * Possible values include: 'messageRead', 'messageDelivered', 'messageSent', 'messageQueued', 'messageFailed'
 * https://www.twilio.com/docs/sms/whatsapp/api#monitor-the-status-of-your-whatsapp-outbound-message
 * @readonly
 * @enum {string}
 */
export declare enum WhatsAppActivityTypes {
    MessageRead = "messageRead",
    MessageDelivered = "messageDelivered",
    MessageSent = "messageSent",
    MessageQueued = "messageQueued",
    MessageFailed = "messageFailed"
}
/**
 * Bot Framework Adapter for [Twilio Whatsapp](https://www.twilio.com/whatsapp)
 */
export declare class TwilioWhatsAppAdapter extends CustomWebAdapter {
    protected readonly settings: TwilioWhatsAppAdapterSettings;
    protected readonly client: Twilio.Twilio;
    protected readonly channel: string;
    /**
     * Creates a new TwilioWhatsAppAdapter instance.
     * @param settings configuration settings for the adapter.
     */
    constructor(settings: TwilioWhatsAppAdapterSettings, botFrameworkAdapterSettings?: BotFrameworkAdapterSettings);
    /**
     * Sends a set of outgoing activities to the appropriate channel server.
     *
     * @param context Context for the current turn of conversation with the user.
     * @param activities List of activities to send.
     */
    sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]>;
    processOutboundEvent(activity: any, message: any): void;
    updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void>;
    deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void>;
    /**
     * Resume a conversation with a user, possibly after some time has gone by.
     *
     * @param reference A `ConversationReference` saved during a previous incoming activity.
     * @param logic A function handler that will be called to perform the bots logic after the the adapters middleware has been run.
     */
    continueConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promise<void>): Promise<void>;
    /**
     * Processes an incoming request received by the bots web server into a TurnContext.
     *
     * @param req An Express or Restify style Request object.
     * @param res An Express or Restify style Response object.
     * @param logic A function handler that will be called to perform the bots logic after the received activity has been pre-processed by the adapter and routed through any middleware for processing.
     */
    processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void>;
    /**
     * Allows for the overriding of the context object in unit tests and derived adapters.
     * @param request Received request.
     */
    protected createContext(request: Partial<Activity>): TurnContext;
    /**
     * Allows for the overriding of the Twilio object in unit tests and derived adapters.
     * @param accountSid Twilio AccountSid
     * @param authToken Twilio Auth Token
     */
    protected validateRequest(authToken: string, signature: string, requestUrl: string, message: Record<string, any>): boolean;
    /**
     * Allows for the overriding of the Twilio object in unit tests and derived adapters.
     * @param accountSid Twilio AccountSid
     * @param authToken Twilio Auth Token
     */
    protected createTwilioClient(accountSid: string, authToken: string): Twilio.Twilio;
    /**
     * Transform Bot Framework Activity to a Twilio Message.
     *
     * @param activity Activity to transform
     */
    protected parseActivity(activity: Partial<Activity>): any;
}
