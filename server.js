// index.js
require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const DEFAULT_SUFFIX = process.env.DEFAULT_SUFFIX;

const app = express();

// Middleware to parse plain text request bodies
app.use(express.text());

let channel = null;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

let discordReady = false;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    discordReady = true;
});


client.login(DISCORD_BOT_TOKEN);

app.post('/webhooks/TV/channel/:channelID/APIkey/:apiKey/:suffix?', async (req, res) => {
    const channelID = req.params.channelID;
    const apiKey = req.params.apiKey;
    const suffix = req.params.suffix;
    console.log(`Received data for channel ${channelID} with API key ${apiKey}`);
    console.log('Alert route hit');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);

    // Validate API key
    // for now, api key is constant
    if (apiKey !== process.env.API_KEY) {
        console.log('Invalid API key');
        res.status(401).send('Unauthorized');
        return;
    }

    // Respond immediately
    res.status(200).send('Webhook received');

    // Process data asynchronously after response
    console.log('Processing suffix:', suffix);
    if (suffix) {
        console.log(`Extra parameter received: ${suffix}`);
        processWebhookData(req.body, channelID, suffix);
    }
    else{
        processWebhookData(req.body, channelID, DEFAULT_SUFFIX);
    }
});

async function processWebhookData(data, channelID, suffix) {

    channel = await client.channels.fetch(channelID);

    if (!discordReady) {
        console.log('Discord client is not ready yet.');
        return;
    }

    if (!channel) {
        console.error('Channel not found');
        return;
    }

    // Process the data
    const { message, ticker } = formatData(data, suffix);

    try {
        let chartUrl = null;

        if (ticker) {
            chartUrl = getStockChartUrl(ticker);
        }

        // Create Discord message options
        const messageOptions = { content: message };

        if (chartUrl) {
            messageOptions.files = [{ attachment: chartUrl, name: `${ticker}_chart.png` }];
        }
        //--------uncomment to send message to discord--------
        await channel.send(messageOptions);
        console.log('Message sent to Discord');
    } catch (err) {
        console.error('Error sending message to Discord:', err);
    }
}

function formatData(data, suffix) {
    let message = '';
    let ticker = '';

    if (typeof data === 'string') {
        message = data;
        // Attempt to extract ticker from the message using regex
        const tickerMatch = data.match(/\b[A-Z]{1,5}\b/g);
        if (tickerMatch) {
            // Assuming the last matched uppercase word is the ticker
            ticker = tickerMatch[0];
        }
    } else if (typeof data === 'object' && data !== null) {
        // Try to extract 'message' and 'ticker' fields
        message = data.message || JSON.stringify(data);
        ticker = data.ticker || '';
    } else {
        message = String(data);
    }
    //replace _ with spaces in suffix
    suffix = suffix.replace(/_/g, ' ');

    message = `${message} ${suffix}`;

    return { message, ticker };
}

function getStockChartUrl(ticker) {
    if (!ticker) {
        return null;
    }

    // Construct the Finviz chart URL
    const chartUrl = `https://finviz.com/chart.ashx?t=${ticker}&p=h1&ty=c&ta=1&s=l`;
    return chartUrl;
}

const PORT = process.env.PORT || 8181;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
