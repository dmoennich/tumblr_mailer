var fs = require("fs");
var ejs = require("ejs");
var tumblr = require("tumblr.js");
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill("xxx");


var csvParse = function(csvContent){

	var delimiter = ",";

	// will contain the parsed data
	var dataList = [];
	
	var lines = csvContent.split("\n");
	var header = lines[0].split(delimiter);
	var dataLines = lines.slice(1);

	dataLines.forEach(function(line){
		var dataCells = line.split(delimiter);
		
		// only include data rows with correct number of cells
		if(dataCells.length !== header.length){
			return;
		}
		
		var dataElement = {};
		header.forEach(function(headerField, index){
			dataElement[headerField] = dataCells[index];
		});
		dataList.push(dataElement);
	});

	return dataList;
};


var getLatestPosts = function(callbackFunc){
	
	var client = tumblr.createClient({
		consumer_key: 'xxx',
		consumer_secret: 'xxx',
		token: 'xxx',
		token_secret: 'xxx'
	});

	client.posts("unadulteratedpatrolbear.tumblr.com", function(err, blog){
		var currentTime = Math.round(Date.now() / 1000);
		var secondsPerDay = 60 * 60 * 24;
		var maxDaysSinceLastPost = 14;
		var latestPosts = [];
		
		blog.posts.forEach(function(blogPost){
			if(currentTime - blogPost.timestamp <= maxDaysSinceLastPost * secondsPerDay){
				latestPosts.push({title: blogPost.title, href: blogPost.post_url});
			}
		});
		callbackFunc(latestPosts);
	});
};


function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async,
		"ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }



getLatestPosts(function(latestPosts){

	var csvContent = fs.readFileSync("./friend_list.csv", "utf8");
	var emailTemplate = fs.readFileSync("./email_template.html", "utf8");

	var recipientData = csvParse(csvContent);

	recipientData.forEach(function(recData){
		recData.latestPosts = latestPosts;
		var emailContent = ejs.render(emailTemplate, recData);
		console.log(emailContent);
		console.log(recData.emailAddress);
		sendEmail(recData.firstName + " " + recData.lastName, recData.emailAddress, "Daniel Moennich",
			"daniel.moennich@googlemail.com", "Some blog posts ...", emailContent);
	});

});







