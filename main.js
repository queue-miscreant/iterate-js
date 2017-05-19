//streams json
var streams = "/api/streams.php"

var embedUri = function(uri) {
	var st = uri.split('/')
	var service = st[0]
	var stream = st[1]
	switch (service) {
		case "http:": //a regular embed link
		case "https:":
			return [uri, false]
		case "twitch":
			return ["http://player.twitch.tv/?channel="+stream, false]
		case "beam":
			return ["https://beam.pro/embed/player/"+stream, true]
		case "hitbox":
			return ["https://www.hitbox.tv/embed/"+stream+"?&autoplay=true", true]
		case "ustream":
			return ["http://www.ustream.tv/embed/"+stream+"?html5ui", true]
		default:
			throw "Malformed streamInfo \"" + streamInfo.link + "\""
	}
}

var queryStream = function(link,tag) {
	return function() {
		if (link.indexOf("http") == 0)
			return
		var split = link.split('/')
		var service = split[0]
		var stream = split[1]
		var divid = function(test) {
			if (test == true) tag.style.display = "inherit"; 
			else tag.style.display = "none";
		}
		switch (service) {
		case "beam":
			$.getJSON("https://beam.pro/api/v1/channels/"+stream,function(json) {
				divid(json.online)
			})
			break;
		case "hitbox":
			$.getJSON("https://api.hitbox.tv/user/"+stream,function(json) {
				divid(json.is_live)
			})
			break;
		case "twitch":
/*		Stupid twitch headers
			$.getJSON("https://api.twitch.tv/kraken/streams/"+stream,function(json) {
				$(divid).css("box-shadow", "0px 0px 3px 3px "+
				(color[json.stream ? 1 : 0]))
			}) 
*/
			break;
		case "ustream": 
			//fuck ustream: "live" is 4 characters; "offair" is 6
			$.getJSON("https://api.ustream.tv/channels/"+stream+".json",function(json) {
				divid(json.channel.status.length === 4)
			})
		}
	}
}

$(function() {

$.ajax("/api/streams.php").done(function (data) {
	data = JSON.parse(data)
	_(data).dropdowns.forEach(function(dropdown) {
		dropdown.dropbtn.tag.innerText = dropdown.context.title
		dropdown.pchildren.forEach(function(button) {
			var stream = button.context, a = button.streamlink.tag, embed = embedUri(stream.link)

			a.href = embed[0]
			a.style.backgroundImage = 'url(/'+stream.image+')'
			a.title = stream.title
			if (!embed[1])
				a.classList.add("nocheck")

			$(dropdown.tag).hover(queryStream(stream.link,a))
		})
	})

})

})
