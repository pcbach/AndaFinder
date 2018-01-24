// Let's write a facemash app!

const express = require('express');
// fs = filesystem, a stdlib library that allows interaction with files and
// folders on the server.
const fs = require('fs');
// body-parser is a library that parses the HTTP request's data into JS objects.
const bodyParser = require('body-parser');

const app = express();

// Load the bodyParser into our server "pipe"
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

// Loads the template into memory.
const loginTemplate = fs.readFileSync('public/index.html', 'utf-8');
const mainTemplate = fs.readFileSync('public/index2.html', 'utf-8');
function replace(str, tag, value) {
	return str.replace(`<${tag}>`, value);
}
var first = false;
// For the homepage, we randomize 2 girls and display them.
app.get('/', (req, res) => {
	let response = loginTemplate;
	res.send(response);
});
app.get('/main', (req, res) => {
	let response = mainTemplate;
	var locations = "";
	for(var i=0;i<tracking.length;i++){
		locations+="{";
		locations+="label: \""+tracking[i].label+"\",";
		locations+="latitude: "+tracking[i].latitude+",";
		locations+="longitude: "+tracking[i].longitude+"";
		locations+="}";
		if(i!==tracking.length-1){
			locations+=",\n";
		}
	}
	console.log(locations);
	response = replace(mainTemplate, "", locations);
	console.log(mainTemplate);
	res.send(response);
});
var tracking = [];
// Now let's write a handler for the choosing action!
app.post('/join', (req, res) => {
	console.log(req.body.lat);
	console.log(req.body.lng);
	console.log(req.body.name);
	tracking.push({
		label: req.body.name,
		latitude: Number(req.body.lat),
		longitude: Number(req.body.lng)
	});
	console.log(tracking);
	/*// body-parser's parsed data is available under "req.body".
	let chosen = Number(req.body.choice);
	// Increase the girl's score by one. Can you do it?
	// ...
	// Now write the girl's score down.
	console.log(`Girl ${chosen} has been chosen! Score now ${girls[chosen].score}`);
	// Send the user back to home page!*/
	res.redirect("/main");
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Finder loaded!");
});