var fs = require("fs");
var ejs = require("ejs");

var csvContent = fs.readFileSync("./friend_list.csv", "utf8");
var emailTemplate = fs.readFileSync("./email_template.html", "utf8");

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


var popTemplate = function(recipientData, emailTemplate){
	recipientData.forEach(function(recData){
		var email = ejs.render(emailTemplate, recData);
	});
};


var recipientData = csvParse(csvContent);
popTemplate(recipientData, emailTemplate);





