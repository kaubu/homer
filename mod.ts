import "https://deno.land/x/dotenv@v3.2.0/load.ts";

// Loading environmental variables
const token = Deno.env.get("TOKEN");
const envTest = Deno.env.get("ENV_TEST");

// Test .env loading
console.log(envTest)

// Importing Client and Intents class from Harmony
// import { Client, Intents, Message } from "./deps.ts";
import { CommandClient, Command, Intents, CommandContext } from "./deps.ts";

// Creating client/bot
const client = new CommandClient({
    prefix: ":"
});

// Listen for when the bot is connected to Discord (i.e. logged in)
client.on("ready", () => {
    console.log("Bot is ready!");
})

// Make a class extending Command
class PingCommand extends Command {
    name = "ping";
    execute(ctx: CommandClient) {
        ctx.message.reply("Pong!");
    }
}

client.commands.add(PingCommand);

// Proceed with connecting to Discord (login)
client.connect(token, Intents.None);