const Discord = require("discord.js");
const client = new Discord.Client();
const YTDL = require("ytdl-core");
const Kaori = require('kaori');
const kaori = new Kaori();

var servers = {};

function play(connection, message) {
	var server = servers[message.guild.id];

	server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

	server.queue.shift();

	server.dispatcher.on("end", function() {
        if(server.queue[0]){
			play(connection. message);
        }
		else{
			connection.disconnect();
        }
	});
}

client.on("ready", () => {
    client.user.setPresence({ 
    	game: { 
    		name: 'aibs gayss'
    	}, 
    	status: 'Online',
        since: Date.time 
    });
    console.log("garok-bot started");
});

client.on("message", message => {
	var args = message.content.split(" ");
    
    if(message.author.bot) 
        return;

    if(message.content.toLowerCase().includes("owo")){
        message.channel.send("What's this? OwO");
    }

    switch (args[0]) {
        case ".loli":
            kaori.search('lolibooru', { tags: ['cats'], limit: 1, random: true })
            .then(images => message.channel.send({file: images[0].common.fileURL}))
            .catch(err => console.error(err));
            break;
        case ".booru":
            kaori.search('danbooru', { tags: ['kancolle'], limit: 1, random: true })
            .then(images => message.channel.send({file: images[0].common.fileURL}))
            .catch(err => console.error(err));
            break;
        case ".help":
            message.channel.send({
                embed: {
                    color: 3447003,
                    fields: [{
                        name: "List of available commands",
                        value: ".help\n.play <youtube link>\n.skip\n.stop\n.ping\n.booru"
                    }],
                    timestamp: new Date(),
                    footer: {
                        text: "© garok-bot"
                    }
                }
            });
            break;

        case ".play":
        	if(!message.member.voiceChannel){
        		message.channel.send("You must be in a voice channel!");
        		return;
        	}

            if(!args[1]){
            	message.channel.send("Please provide a link!");
            	return;
            }

            console.log(args[1]);

            if(!servers[message.guild.id]) 
                servers[message.guild.id] = { queue: [] };

            var server = servers[message.guild.id];

            server.queue.push(args[1]);

            if(!message.guild.voiceConnection) 
            	message.member.voiceChannel.join().then(function(connection){
            		play(connection, message);
            	});

            if(!server.queue[0])
            	YTDL.getInfo(args[1], function(err, info) {
                    message.channel.send("Playing "+ info.title);
                });
            else
                YTDL.getInfo(args[1], function(err, info) {
                    message.channel.send("Addded "+info.title+" into queue");
                });

            console.log(server.queue.length);
            break;

        case ".skip":
        	var server = servers[message.guild.id];
        	if(server.dispatcher)
        		server.dispatcher.end();
        	break;

        case ".stop":
        	var server = servers[message.guild.id];

        	if(message.guild.voiceConnection)
        		message.guild.voiceConnection.disconnect();
        	break;

        case ".ping":
            message.channel.send("Pong sepong: " + Math.floor(client.ping) +"ms");
            break;
        default:
    }
});

client.login(process.env.BOT_TOKEN);