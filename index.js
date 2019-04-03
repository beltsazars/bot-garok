const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");
const YTDL = require("ytdl-core");
const Kaori = require('kaori');
const kaori = new Kaori();
const Music = require("discord.js-musicbot-addon");
const fs = require('fs');
const unzipper = require("unzipper");


var servers = {};
var globalDispatcher;

var msgs;


function play(connection, message) {
    var server = servers[msgs.guild.id];

    server.dispatcher = connection.playStream(YTDL(server.queue[0], {
        filter: "audioonly"
    }));

    server.dispatcher.on("end", function() {
        server.queue.shift();
        if (server.queue[0]) {
            play(connection, message);
        } else {
            connection.disconnect();
        }
    });
}

client.on("ready", () => {
    client.user.setPresence({
        game: {
            name: 'aib gayss'
        },
        status: 'Online',
        since: Date.time
    });
    console.log("garok-bot started");

    Music.start(client, {
        botPrefix: ".",
        defaultPrefix: ".",
        anyoneCanSkip: true,
        anyoneCanLeave: true,
        youtubeKey: process.env.YOUTUBE_KEY,
        helpCmd: 'help', // Sets the name for the help command.
        playCmd: 'play', // Sets the name for the 'play' command.
        volumeCmd: 'volume', // Sets the name for the 'volume' command.
        leaveCmd: 'leave', // Sets the name for the 'leave' command.
        searchCmd: 'search',
        disableLoop: true // Disable the loop command.
        //ownerOverMember: true
        //ownerID: process.env.OWNER_ID.toString()
    });
    console.log("music loaded");
});

client.on("message", async message => {
    var args = message.content.split(" ");

    if (!servers[message.guild.id]) {
        servers[message.guild.id] = {
            queue: []
        };
    }

    msgs = message;

    var server = servers[message.guild.id];

    if (message.author.bot)
        return;
    else if (message.content.toLowerCase().includes("owo"))
        message.channel.send("What's this? OwO");
    else if (!message.content.startsWith('.'))
        return;

    switch (args[0]) {
        case ".osu":
            if (!args[1]) break;
            else {
                if (args[1] == "p") {
                    if (!args[2]) break;
                    else {
                        var mapSet = -1;
                        console.log("arg:" + args[2]);
                        if (args[2].includes("beatmapsets/")) {
                            mapSet = args[2].split("beatmapsets/")[1];
                            if (isNaN(mapSet)) break;
                        } else if (!isNaN(args[2])) {
                            mapSet = args[2];
                        } else if (isNan(args[2])) break;
                        console.log("mapset:" + mapSet);

                        doRequest("http://liminalia.000webhostapp.com/garokosz.php?url=" + mapSet, function(response) {
                            request.get("http://liminalia.000webhostapp.com/garokosz/" + mapSet + ".mp3").on('error', function(err) {}).pipe(fs.createWriteStream(mapSet + ".mp3"));

                            console.log("test mp3 exists: " + fs.existsSync(mapSet + ".mp3"));

                            if(!fs.existsSync(mapSet+".mp3")) {
                                message.channel.send("An error occured. Please try again.");
                                //break;
                            }

                            const channel = message.member.voiceChannel;
                            if (!channel || channel == undefined) return console.error("The channel does not exist!");

                            channel.join().then(connection => {
                                var beatmapInfo;
                                doRequest("https://osu.ppy.sh/api/get_beatmaps?k="+process.env.OSU_KEY+"&s="+mapSet, function(respData){
                                    beatmapInfo = JSON.parse(respData);
                                    if(server.queue.length==0) {

                                        message.channel.send({
                                            embed: {
                                                color: 3447003,
                                                fields: [{
                                                    name: "Playing "+beatmapInfo[0].artist + " - " + beatmapInfo[0].title,
                                                    value: "Requested by "+message.author
                                                }],
                                                thumbnail: {
                                                    url: 'https://b.ppy.sh/thumb/'+mapSet+'l.jpg'
                                                },
                                                timestamp: new Date(),
                                                footer: {
                                                    text: "© garok-bot"
                                                }
                                            }
                                        });

                                        const dispatcher = connection.playFile(mapSet+".mp3");
                                        globalDispatcher = dispatcher;
                                    } else {

                                        message.channel.send({
                                            embed: {
                                                color: 3447003,
                                                fields: [{
                                                    name: "Queued "+beatmapInfo[0].artist + " - " + beatmapInfo[0].title,
                                                    value: "Requested by "+message.author
                                                }],
                                                thumbnail: {
                                                    url: 'https://b.ppy.sh/thumb/'+mapSet+'l.jpg'
                                                },
                                                timestamp: new Date(),
                                                footer: {
                                                    text: "© garok-bot"
                                                }
                                            }
                                        });

                                    }
                                    server.queue.push({"sender:":message.author,"artist":beatmapInfo[0].artist,"title":beatmapInfo[0].title,"mapSet":mapSet});
                                    globalDispatcher.on("end", end => {
                                        console.log("Removed :" + server.queue[0].artist + " - " + server.queue[0].title + " ["+end+"]");
                                        server.queue.splice(0,1);
                                        console.log("Next :" + server.queue[0].artist + " - " + server.queue[0].title);
                                        if(server.queue.length==0)
                                            channel.leave();
                                        else {
                                            message.channel.send({
                                                embed: {
                                                    color: 3447003,
                                                    fields: [{
                                                        name: "Playing "+server.queue[0].artist + " - " + server.queue[0].title,
                                                        value: "Requested by "+server.queue[0].sender
                                                    }],
                                                    thumbnail: {
                                                        url: 'https://b.ppy.sh/thumb/'+server.queue[0].mapSet+'l.jpg'
                                                    },
                                                    timestamp: new Date(),
                                                    footer: {
                                                        text: "© garok-bot"
                                                    }
                                                }
                                            });
                                            const dispatcher = connection.playFile(mapSet+".mp3");
                                            globalDispatcher = dispatcher;
                                        }
                                    });
                                });
                            });
                        });
                    }
                }
                if (args[1] == "q") {
                    if(server.queue.length == 0) message.channel.send("Queue is empty.");
                    else {
                        var toSend = "";
                        for(var i=0;i<server.queue.length;i++) {
                            toSend += (i+1) + ". " + server.queue[i].artist + " - " + server.queue[i].title + "\n";
                        }
                        message.channel.send({
                            embed: {
                                color: 3447003,
                                fields: [{
                                    name: "Queue list",
                                    value: toSend
                                }],
                                timestamp: new Date(),
                                footer: {
                                    text: "© garok-bot"
                                }
                            }
                        });
                    }
                }
            }

            break;
        case ".leave":
            if (message.guild.voiceConnection) {
                message.guild.voiceChannel.leave();
            }
            message.channel.send("Leaving voice channel!");
            break;
        case ".pixiv":
            if (args[1] == null || args[1] == "" || args[1] == undefined) {
                //will random here.
                //test 2 mode

            } else {
                //get rank
                var pixivRank = 1;
                //if arg2 is number, then get it
                if (!isNaN(args[2])) {
                    //!pixiv today 2
                    if (args[2] > 50)
                        pixivRank = 50;
                    pixivRank = args[2];
                }
                if (args[1] == "daily" || args[1] == "weekly" || args[1] == "monthly") {
                    var url = "https://www.pixiv.net/ranking.php?mode=" + args[1];
                    console.log(url);
                    doRequest(url, function(src) {
                        var tempPixivSrc = src;
                        var imgPixivId = (((tempPixivSrc.split('/member_illust.php?mode=medium&amp;illust_id=')[pixivRank]).toString()).split('"')[0]).toString();
                        var imgPixiv = "https://embed.pixiv.net/decorate.php?illust_id=" + imgPixivId;
                        var imgPixivTitle = (((tempPixivSrc.split('data-title="')[pixivRank]).toString()).split('"')[0]).toString();
                        var imgPixivIllustrator = (((tempPixivSrc.split('data-user-name="')[pixivRank]).toString()).split('"')[0]).toString();

                        //method 2 test
                        var imgPixivRealUrl = (((tempPixivSrc.split('thumbnail-filter lazy-image"data-src="')[pixivRank]).toString()).split('"')[0]);
                        imgPixivRealUrl = imgPixivRealUrl.replace(imgPixivRealUrl.split("pximg.net")[1].split("/img-master")[0], "");
                        imgPixivRealUrl = imgPixivRealUrl.replace("square", "master");
                        console.log(imgPixivRealUrl);

                        var caption = "#" + pixivRank + " " + imgPixivTitle + "\nby " + imgPixivIllustrator;
                        sendFile("https://liminalia.000webhostapp.com/pixiv.php?url=" + imgPixivRealUrl, caption);
                    });
                } else {
                    //console.log("https://api.pixiv.moe/v1/search?word=" + message.content.split(".pixiv ")[1] + "&page=1");
                    doRequest("https://api.pixiv.moe/v1/search?word=" + message.content.split(".pixiv ")[1] + "&page=1", function(src) {
                        var data = JSON.parse(src);
                        if (data.count == 0) {
                            message.channel.send("Ora ketemu gambar e");
                            return;
                        }
                        var length = data.response.length;
                        var rng = Math.floor(Math.random() * ((data.response.length - 1) - 0 + 1) + 0);
                        console.log(rng);
                        console.log(data.response[rng].image_urls.large)
                        message.channel.send("", {
                            file: data.response[rng].image_urls.large // Or replace with FileOptions object
                        });
                    });



                }
                //prevent err, example !pixiv asjdiajdis


            }
            break;

        case ".m":
            if (args[1] == 'play' || args[1] == 'p') {
                if (!message.member.voiceChannel) {
                    message.channel.send("You must be in a voice channel!");
                    return;
                }

                if (!args[2]) {
                    message.channel.send("Please provide a link!");
                    return;
                }

                console.log(args[2]);
                console.log(server.queue.length);

                if (!message.guild.voiceConnection)
                    message.member.voiceChannel.join().then(function(connection) {
                        play(connection, message);
                    });

                if (!server.queue.length)
                    YTDL.getInfo(args[2], function(err, info) {
                        message.channel.send("Playing " + info.title);
                    }).catch(err => console.error(err));
                else
                    YTDL.getInfo(args[2], function(err, info) {
                        message.channel.send("Added " + info.title + " into queue");
                    }).catch(err => console.error(err));

                server.queue.push(args[2]);

                console.log(server.queue);
            } else if (args[1] == 's' || args[1] == 'skip') {
                if (server.dispatcher)
                    server.dispatcher.end();
            } else if (args[1] == 'stop') {
                if (message.guild.voiceConnection) {
                    for (var i = server.queue.length - 1; i >= 0; i--) {
                        server.queue.splice(i, 1);
                    }
                    server.dispatcher.end();
                    console.log("[" + new Date().toLocaleString() + "] Stopped the queue.");
                }
            } else if (args[1] == 'q' || args[1] == 'queue') {
                for (var i = 0; i < server.queue.length; i++) {
                    YTDL.getInfo(server.queue[i], function(err, info) {
                        message.channel.send("- " + info.title);
                    }).catch(err => console.error(err));
                }
            }
            break;

        case ".booru":
            kaori.search('danbooru', {
                    tags: [args[1] ? args[1] : 'neko'],
                    limit: 1,
                    random: true
                })
                .then(images => message.channel.send({
                    file: images[0].common.fileURL
                }))
                .catch(err => console.error(err));
            break;

        case ".help":
            message.channel.send({
                embed: {
                    color: 3447003,
                    fields: [{
                        name: "List of available commands",
                        value: ".help\n.m <play/queue/skip/stop>\n.ping\n.booru"
                    }],
                    timestamp: new Date(),
                    footer: {
                        text: "© garok-bot"
                    }
                }
            });
            break;

        case ".ping":
            //© Tomflynn Beltsazar 2018
            message.channel.send("Pong sepong: " + Math.floor(client.ping) + "ms");
            break;
        default:
    }
});

async function sendFile(fileToSend, caption) {
    msgs.channel.send(caption, {
        file: fileToSend // Or replace with FileOptions object
    });
}

async function doRequest(url, callback) {
    request({
        url: url,
    }, (error, resp, body) => {
        if (!error && resp.statusCode == 200) {
            return callback(body);
        } else {
            //Throw error, this will be caught in the .catch() 
            return error;
        }
    });
}


client.login(process.env.BOT_TOKEN);
