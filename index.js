const Discord = require("discord.js");
const client = new Discord.Client();
const YTDL = require("ytdl-core");
const Kaori = require('kaori');
const kaori = new Kaori();

var servers = {};

var msgs;

function play(connection, message) {
    var server = servers[msgs.guild.id];

    server.dispatcher = connection.playStream(YTDL(server.queue[0], {
        filter: "audioonly"
    }));

    server.dispatcher.on("end", function () {
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
});

client.on("message", message => {
	async function sendFile(fileToSend, caption) {
    	message.channel.send(caption, {
	        file: fileToSend // Or replace with FileOptions object
    	});
	}

	async function doRequest(url) {
    	return request({
	        url: url,
    	}, (error, resp, body) => {
	        if (!error && resp.statusCode == 200) {
            	return body;
        	} else {
            	//Throw error, this will be caught in the .catch() 
            	return error;
        	}
    	});
	}

    var args = message.content.split(" ");
    
    if (!servers[message.guild.id]) {
        servers[message.guild.id] = { queue: [] };
    }
    
    msgs = message;

    var server = servers[message.guild.id];
            
    if (message.author.bot)
        return;
    else if (message.content.toLowerCase().includes("owo"))
        message.channel.send("What's this? OwO");
    else if(!message.content.startsWith('.'))
    	return;

    switch (args[0]) {
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
	            //prevent err, example !pixiv asjdiajdis
    	        var tempPixivSrc = await doRequest("https://www.pixiv.net/ranking.php?mode=daily");
        	    if (args[1] == "today") {
            	    //!pixiv today 
                	//set url to daily
                	var tempPixivSrc = await doRequest("https://www.pixiv.net/ranking.php?mode=daily");
            	}
            	if (args[1] == "weekly") {
                	//!pixiv weekly
                	//set url toweekly
                	var tempPixivSrc = await doRequest("https://www.pixiv.net/ranking.php?mode=weekly");
            	}
            	if (args[1] == "monthly") {
                	var tempPixivSrc = await doRequest("https://www.pixiv.net/ranking.php?mode=monthly");
            	}
            	console.log(pixivRank);
            	var imgPixivId = (((tempPixivSrc.split('/member_illust.php?mode=medium&amp;illust_id=')[pixivRank]).toString()).split('"')[0]).toString();
            	var imgPixiv = "https://embed.pixiv.net/decorate.php?illust_id=" + imgPixivId;
            	var imgPixivTitle = (((tempPixivSrc.split('data-title="')[pixivRank]).toString()).split('"')[0]).toString();
            	var imgPixivIllustrator = (((tempPixivSrc.split('data-user-name="')[pixivRank]).toString()).split('"')[0]).toString();

            	//method 2 test
            	var imgPixivRealUrl = (((tempPixivSrc.split('thumbnail-filter lazy-image"data-src="')[pixivRank]).toString()).split('"')[0]);
            	imgPixivRealUrl = imgPixivRealUrl.replace((((imgPixivRealUrl.split("/c/")[1]).toString()).split("/")[0]).toString(), "600x600");

            	var caption = "#" + pixivRank + " " + imgPixivTitle + "\nby " + imgPixivIllustrator;
            	sendFile("https://liminalia.000webhostapp.com/pixiv.php?url=" + imgPixivRealUrl, caption);
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
                    message.member.voiceChannel.join().then(function (connection) {
                        play(connection, message);
                    });

                if (!server.queue.length)
                    YTDL.getInfo(args[2], function (err, info) {
                        message.channel.send("Playing " + info.title);
                    }).catch(err => console.error(err));
                else
                    YTDL.getInfo(args[2], function (err, info) {
                        message.channel.send("Added " + info.title + " into queue");
                    }).catch(err => console.error(err));
                
                server.queue.push(args[2]);

                console.log(server.queue);
            }
            else if(args[1] == 's' || args[1] == 'skip'){
                if (server.dispatcher)
                    server.dispatcher.end();
            }
            else if(args[1] == 'stop'){
                 if (message.guild.voiceConnection) { 
                    for (var i = server.queue.length - 1; i >= 0; i--) { 
                        server.queue.splice(i, 1); 
                    } 
                    server.dispatcher.end(); 
                    console.log("[" + new Date().toLocaleString() + "] Stopped the queue."); 
                }﻿
            }
            else if (args[1] == 'q' || args[1] == 'queue'){                
                for (var i = 0; i < server.queue.length; i++){
                    YTDL.getInfo(server.queue[i], function (err, info) {
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

client.login(process.env.BOT_TOKEN);