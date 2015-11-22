/* this program scrapes all the pressrelease pdfs trom the trai website 'http://trai.gov.in/Content/PressReleases.aspx'
    using casper.js*/
	
	
var casper = require('casper').create({					//create a new instance of casper 
  verbose: true,										//this instructs casper to automatically display errors. 
  logLevel: 'error',									//messages displayed on errors
  pageSettings: {										//these are page settings. we do not require images and security sometimes hinders with download
    loadImages: false,
	webSecurityEnabled: false,
    userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'		//standard page settings
  }
});

var fs = require('fs');									//fs is requred to create downloads directory and download the files

var links;												//variable to store links of the press release documents from each page
var all = [];											//list of all the links from all pages concatenated
var pages = 0, file_no = 0;								//pages keeps track of page number while file_no counts the file number	
var file_name, url;										//File_name stores the pdf name while url stores the url for the pdf



// Initialize casper to the TRAI's press release web-page and return the title when opened successfully
casper.start('http://trai.gov.in/Content/PressReleases.aspx', function() {
    this.echo(this.getTitle());
});


// Error handle. If we face any error in our operation, the error is displayed in detail. A photo of the web-page is also saved as error.png
casper.on('error', function(msg,backtrace) {
  this.capture('error.png');
  this.echo("Error:    " + msg, "ERROR");
  this.echo("file:     " + trace[0].file, "WARNING");
  this.echo("line:     " + trace[0].line, "WARNING");
  this.echo("function: " + trace[0]["function"], "WARNING");
});



//This function runs 63 time, i.e. for each page. We can control what pages to load by changing i here.
//This function extracts all links from news_content_mid and returns the array all with the links inside it
for( i = 0; i<63; i++){
 casper.then(function getLinks(){
     links = this.evaluate(function(){
        var links = document.querySelector('#content .news_content_mid').getElementsByTagName('a');
        links = Array.prototype.map.call(links,function(link){
            return 'http://trai.gov.in' + link.getAttribute('href');		//obtain href from each link
        });
	    return links.slice(0,10);			//only the first 10 links point to press release pages
    });
	all=all.concat(links);					// store all links in the array all
});

//This part of the code clicks on the 'next' button to load the next set of 10 links
casper.then(function(){
	this.clickLabel('Next', 'a')
	pages++;
	console.log('loaded Pg. No.: ' + (pages));
});

};



//After obtaining the links we use that array to download pdf files from these links
casper.then(function(){
	all= all.slice(0,177).concat(all.slice(181,all.length));		// we omit these files because they randomly throw xml errors
	console.log('\nNo. of files to download:\t\t' + all.length+ '\n\n');	//display the number of files to be downloaded 
	
    this.each(all,function(self,link){
        self.thenOpen(link,function(a){
				file_name = this.fetchText('#content .news_content_mid h3 ').replace(/(\r\n|\n|\r)/gm," ").trim();			
				file_name =  file_no +'_' + file_name.replace(/[^a-zA-Z0-9]/g,'').substring(0,130).replace(/\s+/g, ' ');
				url = this.getElementAttribute('#content .news_content_mid a', 'href');
				//In the above line we extract the file name as the document name, remove all formatting and limit the file name to 130 characters. 
				// we also store the url of each link
				console.log('\nURL:\t\t http://trai.gov.in' + url + '\nFile Name:\t'+file_name);	
				casper.download('http://trai.gov.in' + url, './downloads/'+file_name+'.pdf');		//download the files
				file_no++;
        });
		
    });
	
});

casper.run();