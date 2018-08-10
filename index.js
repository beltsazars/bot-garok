const Discord = require("discord.js");
const client = new Discord.Client();
const YTDL = require("ytdl-core");
const token = "NDc2OTU2NzgwMTA3Mzk5MTY4.Dk2bqQ.4y6mtZwo4hE4NET9TR4UBYehrVk";

var servers = {};
var isPlaying = "";

function play(connection, message) {
	var server = servers[message.guild.id];

	server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

	server.queue.shift();

	server.dispatcher.on("end", function() {
        if(server.queue[0]){
			play(connection. message);
            message.channel.send("Playing "+isPlaying);
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
    	status: 'Online' 
    }).then(console.log).catch(console.error);
    console.log("I am ready!");
});

client.on("message", message => {
	var args = message.content.split(" ");

    if(message.content.toLowerCase().includes("owo")){
        message.channel.send("What's this? OwO");
    }

    switch (args[0]) {
        case ".help":
            message.channel.send("List of available commands :\n.help\n.play <youtube link>\n.skip\n.stop\n.ping");
            break;
        case ".play":
            
        	if(!message.member.voiceChannel){
        		message.channel.send("You must be in a voice channel");
        		return;
        	}
            if(!args[1]){
            	message.channel.send("Please provide a link");
            	return;
            }

            console.log(args[1]);

            if(!servers[message.guild.id]) servers[message.guild.id] = {
            	queue: []
            };

            var server = servers[message.guild.id];

            server.queue.push(args[1]);
            if(!message.guild.voiceConnection) 
            	message.member.voiceChannel.join().then(function(connection){
            		play(connection, message);
            	});

            YTDL.getInfo(args[1], function(err, info) {
                    isPlaying = info.title;
            });

            if(server.queue.length == 1)
            	message.channel.send("Playing "+isPlaying);
            else
            	message.channel.send("Addded "+isPlaying+" into queue");

            console.log(server.queue.length);
            console.log(isPlaying);
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

client.login(token);
