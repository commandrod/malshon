require('dotenv').config();
const mineflayer = require('mineflayer');
const { Client, Intents, MessageEmbed } = require('discord.js');

const options = {
    host: 'play.topstrix.net',
    port: '25565',
    username: process.env.EMAIL,
    password: process.env.PASSWORD,
    version: '1.17.1',
    auth: 'microsoft',
    authTitle: 'microsoft'
}

let bot = mineflayer.createBot(options);
const discordBot = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Settings
const username = 'ItsRishon';
const mins = 2.5;
const channelId = process.env.CHANNEL;

let channel = null;
let check = false;
let last_server = '';

const reconnect = () => {
    let tries = 5;
    if (0 >= tries) return;
    console.log(`Disconnected, Logging back in. Tries: ${tries}`);
    bot.end();
    bot = mineflayer.createBot(options);
    tries--;
};

const performCommand = () => {
    bot.chat('/f list');
    setTimeout(function(){performCommand();}, 1000*60*mins);
};

const passMessage = (msg) => {
    // Checks that the message was sent by the server, and not by a player
    if (!msg.startsWith(' • ')) return;
    if (!msg.includes(username)) return;
    // Formats the message to get the player's current server
    let server = msg.replace(' • ', '').replace(' (מחובר) ', '').replace('כעת נמצא בשרת ', '').replace(username, '');
    // Checks if the server is the same as the last message's server
    if (server == last_server) return;
    last_server = server;
    check = false;
    // Checks if the player is offline
    if (server.includes('(לא מחובר)')){
        quick_embed(channel, 'RED', `${username} is offline!`);
        return;
    }
    quick_embed(channel, 'YELLOW', `${username} is in ${server}!`);
};

const quick_embed = (channel, color, str) => {
    const embed = new MessageEmbed()
    .setColor(color)
    .setTitle('❗ | Update')
    .setDescription(str)
    .setTimestamp();
    channel.send({ embeds: [embed] });
};

discordBot.once('ready', () => {
    channel = discordBot.channels.cache.get(channelId);
    discordBot.user.setActivity(username, { type: 'WATCHING' });
    console.log(`Logged in as ${discordBot.user.tag}!`);
    setTimeout(function(){performCommand();}, 1000*5);
});

bot.on('messagestr', (message) => {
    console.log(message);
    // Start checking if the sent message is the player's status
    if (message.startsWith(' רשימת החברים שלך:')) check = true;
    // Delay added since the command itself has delay
    if (check) setTimeout(function(){passMessage(message);}, 1000*3);
    // Checks if the message is {username} joined the server with TopStrix's join message format.
    if (message.startsWith(' חברך') && message.includes(username) && message.includes('עכשיו מחובר בשרת')){
        console.log(`Detected login of player ${username}!`);
        quick_embed(channel, 'GREEN', `${username} logged on TopStrix!`);
        performCommand();
    }
});

bot.once('connect', () => {
    console.log('Successfully connected as ' + bot._client.username + '!');
});

bot.once('resourcePack', () => {
    bot.acceptResourcePack();
});


bot.on('end', () => {
    reconnect();
});

discordBot.login(process.env.TOKEN);