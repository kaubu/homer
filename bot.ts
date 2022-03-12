import {
    Client,
    slash,
    event,
    Interaction,
    InteractionResponseType,
    Intents,
    InteractionApplicationCommandData
} from "./deps.ts";

import { commands } from "./commands.ts";

import {
    getUserTags,
    getGuildTags,
    getTag,
    addTag,
    editTag,
    deleteTag
} from "./db.ts";

import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const token = Deno.env.get("TOKEN");

class TagBot extends Client {
    @event()
    ready() {
        console.log("TagBot Ready!");
        commands.forEach(command => {
            this.interactions.commands.create(command, "363561519822143491")
                .then((cmd) => 
                    console.log(`Created slash command '${cmd.name}'`))
                .catch((cmd) => 
                    console.log(`Failed to create ${cmd.name} command`));
        });
    }

    @slash()
    tag(i: Interaction) {
        // Get the tag name from command arguments (options)
        // Explicitly state it as Application data
        const msg_data: InteractionApplicationCommandData =
            i.data as InteractionApplicationCommandData;
        // const name = msg_data.options[0].value as string;
        const name = msg_data.options
            .find((e) => e.name == "name")?.value as string;
        
        // Get the tag from database
        const tag = getTag(i.guild!.id, name);

        // Respond if tag is not found
        if (!tag) {
            return i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: `Tag with name \`${name.replace(
                    /`/g,
                    "`"
                )}\` could not be found.`,
                // Note this is a temp option.
                // This makes the message only visible to the User who
                // used the command, and also can be dismissed!
                // 
                // temp: true,
                // 
                // Update: changed name
                ephemeral: true,
            });
        // Else, respond with tag's content
        } else {
            i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: tag.content,
            });
        }
    }

    @slash()
    mytags(i: Interaction) {
        // Get all tags of the user
        const tags = getUserTags(i.guild!.id, i.user.id);

        if (tags.length == 0) {
            return i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: "You have no tags on this server yet.",
                ephemeral: true,
            });
        } else {
            i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: `**Your tags:** \
${tags.map((e) => e.name).join(", ")}`,
                ephemeral: true,
            });
        }
    }

    @slash()
    alltags(i: Interaction) {
        // Get all tags in the current Server/Guild
        const tags = getGuildTags(i.guild!.id);

        if (tags.length == 0) {
            return i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: "This server has no tags yet.",
                ephemeral: true,
            });
        } else {
            i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: `**All Tags:** ${tags.map((e) => e.name).join(", ")}`,
                ephemeral: true,
            });
        }
    }

    @slash()
    addtag(i: Interaction) {
        const tags = getUserTags(i.guild!.id, i.user.id);

        // Let's keep a max number of tags of a user to 10
        const maxTagPerUser = 10;

        if (tags.length >= maxTagPerUser) {
            return i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: "You have reached the maximum number of tags.",
                ephemeral: true,
            });
        }

        const msg_data: InteractionApplicationCommandData =
            i.data as InteractionApplicationCommandData;
        const name = msg_data.options
            .find((e) => e.name == "name")?.value as string;
        const content = msg_data.options
            .find((e) => e.name == "content")?.value as string;
        
        if (content.length > 2000) {
            return i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: `Tag content length must be between 1-2000\ 
characters.`,
                ephemeral: true,
            });
        }

        const added = addTag(i.guild!.id, i.user.id, name, content);

        if (added == null) {
            return i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: `Tag with name \`${name.replace(/`/g, "`")}\`\
already exists.`,
                ephemeral: true,
            });
        } else {
            return i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: `Added new tag: \`${name.replace(/`/g, "`")}\`.`,
                ephemeral: true,
            });
        }
    }

    @slash()
    deletetag(i: Interaction) {
        const msg_data: InteractionApplicationCommandData =
            i.data as InteractionApplicationCommandData;
        const name = msg_data.options
            .find((e) => e.name == "name")?.value as string;
        const tag = getTag(i.guild!.id, name);

        if (!tag) {
            return i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: `Tag with name \`${name.replace(/`/g, "`")}\`\
could not be found.`,
                ephemeral: true,
            });
        }

        if (tag.user != i.user.id) {
            return i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: `Tag with name \`${name.replace(/`/g, "`")}\`\
is not yours.`,
                ephemeral: true,
            });
        }

        deleteTag(i.guild!.id, name); // Recursion???

        i.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            content: `Deleted tag: \`${name.replace(/`/g, "`")}\`.`,
            ephemeral: true,
        });
    }

    @slash()
    updatetag(i: Interaction) {
        const msg_data: InteractionApplicationCommandData =
            i.data as InteractionApplicationCommandData;
        const name = msg_data.options
            .find((e) => e.name == "name")?.value as string;
        const content = msg_data.options
            .find((e) => e.name == "content")?.value as string;

        if (content.length > 2000) {
            return i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: `Tag length must contain between 1-2000 characters.`,
                ephemeral: true,
            });
        }

        const tag = getTag(i.guild!.id, name);

        if (!tag) {
            return i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: `Tag with name \`${name.replace(/`/g, "`")}\`\
could not be found.`,
                ephemeral: true,
            });
        }

        if (tag.user != i.user.id) {
            return i.respond({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                content: `Tag with name \`${name.replace(/`/g, "`")}\`\
is not yours.`,
                ephemeral: true,
            });
        }

        editTag(i.guild!.id, name, content);

        i.respond({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            content: `Updated tag: \`${name.replace(/`/g, "`")}\`.`,
            ephemeral: true,
        });
    }
}

const bot = new TagBot();
bot.connect(token, Intents.None);