// index.js
require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const app = express();
app.use(express.json());

let channel = null;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

let discordReady = false;

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    discordReady = true;

    try {
        channel = await client.channels.fetch(CHANNEL_ID);
        if (channel && channel.isTextBased()) {
            console.log(`Channel found: ${channel.name} (${channel.id})`);
        } else {
            console.error('Channel is not a text channel or not found');
            process.exit(1);
        }
    } catch (error) {
        console.error('Error fetching the channel:', error);
        process.exit(1);
    }
});

client.login(DISCORD_BOT_TOKEN);

app.post('/webhooks/alert', async (req, res) => {
    console.log('Alert route hit');
    console.log('Request body:', req.body);

    if (!discordReady) {
        console.log('Discord client is not ready yet.');
        return res.status(503).send('Discord client not ready');
    }

    if (!channel) {
        console.error('Channel not found');
        return res.status(404).send('Channel not found');
    }

    // Process the data
    const data = req.body;
    const message = formatData(data);

    try {
        await channel.send(message);
        res.status(200).send('Message sent to Discord');
    } catch (err) {
        console.error('Error sending message to Discord:', err);
        res.status(500).send('Error sending message to Discord');
    }
});

function formatData(data) {
    let message = '';

    if (typeof data === 'string') {
        message = data;
    } else if (typeof data === 'object' && data !== null) {
        // Try to extract 'message' field
        message = data.message || JSON.stringify(data);
    } else {
        message = String(data);
    }

    // Remove any single quotes
    message = message.replace(/'/g, '');

    // Optionally, split at the first single quote and take the first part
    const splitSections = message.split('\'');
    if (splitSections.length > 0) {
        message = splitSections[0];
    }

    message = message.replace(/'/g, '');

    message = `${message} @everyone`;
    return message;
}

const PORT = process.env.PORT || 8181;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
