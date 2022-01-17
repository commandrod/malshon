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
const username = 'ItsRishon';
const mins = 2.5;
let channel = null;
let check = false;
let last_server = '';

const reconnect = () => {
    let tries = 5;
    if (0 >= tries) return;
    console.log(`Disconnected, Logging back in. Tries: ${tries}`);
    bot = mineflayer.createBot(options);
    tries--;
};

const performCommand = () => {
    bot.chat('/f list');
    setTimeout(function(){performCommand();}, 1000*60*mins);
};

const passMessage = (msg) => {
    if (!msg.startsWith(' • ')) return;
    if (!msg.includes(username)) return;
    let server = msg.replace(' • ', '').replace(' (מחובר) ', '').replace('כעת נמצא בשרת ', '').replace(username, '');
    if (server == last_server) return;
    last_server = server;
    check = false;
    if (server.includes('(לא מחובר)')){
        quick_embed(channel, 'RED', `${username} is offline!`, true);
        return;
    }
    quick_embed(channel, 'YELLOW', `${username} is in ${server}!`, false);
};

const quick_embed = (channel, color, str, everyone) => {
    const embed = new MessageEmbed()
    .setColor(color)
    .setTitle('❗ | Shon Update')
    .setDescription(str)
    .setTimestamp();
    channel.send({ embeds: [embed] });
    if (!everyone) return;
    channel.send('@everyone');
};

const send_logged_in = (user, loggedOn) => {
    if (loggedOn){
        quick_embed(channel, 'GREEN', `${user} logged on TopStrix!`, true);
        performCommand();
    } else {
        quick_embed(channel, 'RED', `${user} logged off TopStrix!`, true);
    }
};

bot.once('connect', () => {
    console.log('Successfully connected as ' + bot._client.username + '!');
});

bot.once('resourcePack', () => {
    bot.acceptResourcePack();
});

bot.on('messagestr', (message) => {
    console.log(message);
    if (message.startsWith(' רשימת החברים שלך:')){
        check = true;
    }
    if (check){
        setTimeout(function(){passMessage(message);}, 1000*3);
    }
    if (message.startsWith(' חברך') && message.includes(username)){
        if (message.includes('')) return;
        //user = user.replace('חברך', '').replace('עכשיו מחובר בשרת', '').replace(' ', '');
        if (message.includes('עכשיו מחובר בשרת')){
            console.log(`Detected login of player ${username}!`);
            send_logged_in(username, true);
        } else {
            console.log(`Detected disconnection of player ${username}!`);
            send_logged_in(username, false);
        }
    }
});

bot.on('end', () => {
    reconnect();
});

discordBot.once('ready', () => {
    channel = discordBot.channels.cache.get(process.env.CHANNEL);
    guild = discordBot.guilds.cache.get(process.env.GUILD);
    discordBot.user.setActivity(username, { type: 'WATCHING' });
    console.log(`Logged in as ${discordBot.user.tag}!`);
    setTimeout(function(){performCommand();}, 1000*5);
});

discordBot.login(process.env.TOKEN);