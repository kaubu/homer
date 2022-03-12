// Importing libraries
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

// Loading environmental variables
const token = Deno.env.get("TOKEN");
const envTest = Deno.env.get("ENV_TEST");

// Test .env loading
console.log(envTest)

// Importing Client and Intents class from Harmony
import { Client, Intents, Message } from "./deps.ts";

// Creating client/bot
const client = new Client();

// Listen for when the bot is connected to Discord (i.e. logged in)
client.on("ready", () => {
    console.log("Bot is ready!");
})

// Listen for an event which is fired when a Message is sent
client.on("messageCreate", (message: Message) => {
    // All the message data is inside 'Message' here.
    // Content of Message can be accessed using <Message>.content;
    // here, message.content
    if (message.content == "!ping") {
        message.reply("Pong!");
    }
})

// Proceed with connecting to Discord (login)
client.connect(token, Intents.None);