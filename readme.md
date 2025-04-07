# 📡 Discord Webhook Relay Server
This project is a lightweight Express server that listens for incoming webhook alerts (e.g., from TradingView) and relays them to a Discord channel using a Discord bot.

## 🔧 Features
- Accepts POST requests with plain text body content

- Authenticates incoming requests using an API key

- Sends messages to a specific Discord channel

- Automatically extracts stock tickers and adds a Finviz chart if available

- Supports optional message suffix customization

## 📁 Project Structure
```bash
.
├── index.js           # Main server and bot logic
├── .env               # Environment variables
├── package.json       # Project metadata and dependencies
└── README.md          # This file
```

## 🧪 Requirements
- Node.js (v16+)

- A Discord bot token

- Access to a Discord channel where the bot can post

## 📦 Installation

1. Clone the repo:
```bash
git clone https://github.com/your-username/discord-webhook-relay.git
cd discord-webhook-relay
```
2. Install dependencies:
```bash
npm install
```
3. Create a .env file in the root folder with the following variables:
```bash
DISCORD_BOT_TOKEN=your_discord_bot_token
CHANNEL_ID=your_default_channel_id
API_KEY=your_secure_api_key
DEFAULT_SUFFIX=- Alert
PORT=8181
```
## 🚀 Usage
Start the server:
```bash
node index.js
```
The server will start on the specified PORT (default is 8181).

## 📬 Webhook Endpoint
**POST** ```/webhooks/TV/channel/:channelID/APIkey/:apiKey/:suffix?```

- ```channelID```: The Discord channel ID to post to

- ```apiKey```: The secure API key to validate the request

- ```suffix``` (optional): Adds text at the end of the message. Use underscores (_) instead of spaces.


## Example Curl Command
```bash
curl -X POST http://localhost:8181/webhooks/TV/channel/123456789/APIkey/mykey/Special_Alert \
     -H "Content-Type: text/plain" \
     -d "MSFT breakout confirmed"
```
## 🧠 How It Works
- Receives webhook data

- Verifies apiKey matches the one in .env

- Extracts a stock ticker from the alert message (e.g., "MSFT")

- Appends a chart image from Finviz if a ticker is found

- Sends the combined message + chart to the specified Discord channel

## 🛠 To-Do / Improvements
- Add support for JSON payloads

- Better ticker extraction with fallback

- Rate limit handling

- Logging enhancements

## 🛡️ Security Note
Ensure your .env file is never committed to version control. Consider using a service like dotenv-safe for stricter environment validation.

## 📄 License
MIT — Free to use and modify.