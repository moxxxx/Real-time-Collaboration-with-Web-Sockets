//Server Code
const http = require("http"); //need to http
const fs = require("fs"); //need to read static files
const url = require("url"); //to parse url strings

const ROOT_DIR = "html"; //dir to serve static files from

const MIME_TYPES = {
    css: "text/css",
    gif: "image/gif",
    htm: "text/html",
    html: "text/html",
    ico: "image/x-icon",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    js: "application/javascript",
    json: "application/json",
    png: "image/png",
    svg: "image/svg+xml",
    txt: "text/plain"
}

const get_mime = function(filename) {
    //Use file extension to determine the correct response MIME type
    for (let ext in MIME_TYPES) {
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
            return MIME_TYPES[ext]
        }
    }
    return MIME_TYPES["txt"]
}

http.createServer(function(request, response) {
    var urlObj = url.parse(request.url, true, false)
    console.log("\n============================")
    console.log("PATHNAME: " + urlObj.pathname)
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
    console.log("METHOD: " + request.method)

    var receivedData = ""

    //Event handlers to collect the message data
    request.on("data", function(chunk) {
        receivedData += chunk;
    })

    //Event handler for the end of the message
    request.on("end", function() {
        console.log("received data: ", receivedData)
        console.log("type: ", typeof receivedData)

        //if it is a POST request then echo back the data.
        if (request.method == "POST") {
            //Handle POST requests
            var dataObj = JSON.parse(receivedData)
            console.log("received data object: ", dataObj)
            console.log("type: ", typeof dataObj)
            //Here we can decide how to process the data object and what
            //object to send back to client.
            //FOR NOW EITHER JUST PASS BACK AN OBJECT
            //WITH "text" PROPERTY

            if(dataObj.text){
                //return the song in an object that the client requested if it exists
                console.log("USER REQUEST: " + dataObj.text)
                let returnObj = {}
                returnObj.text = "NOT FOUND: " + dataObj.text

                let filepath = "songs/" + dataObj.text.trim() + ".txt"

                fs.readFile(filepath, function(err, data){
                    if (err) {
                        console.log("\nRequested File Not Found!")
                    }else{
                        returnObj.text = "FOUND: " + dataObj.text
                        returnObj.content = data.toString().split("\n")
                    }
                    response.writeHead(200, { "Content-Type": MIME_TYPES["txt"] })
                    response.end(JSON.stringify(returnObj))
                })
            }else if(dataObj.saveAs){
                //Save received object in songs folder as txt file
                console.log("Save Request!")
                let contentArray = dataObj.content
                let contentText = ""
                for(singleLine in contentArray){
                    contentText += contentArray[singleLine] + "\n"
                }

                let returnObj = {}
                fs.writeFile("songs/" + dataObj.saveAs + ".txt", contentText, function(err){
                    if (err) {
                        returnObj.saveStatus = "Save Fail!"
                    }else{
                        returnObj.saveStatus = "Save Succeed!"
                    }
                    response.writeHead(200, { "Content-Type": MIME_TYPES["txt"] })
                    response.end(JSON.stringify(returnObj))
                })
            }

        }

        if (request.method == "GET") {
            //Handle GET requests
            //Treat GET requests as request for static file
            var filePath = ROOT_DIR + urlObj.pathname
            if (urlObj.pathname === "/") filePath = ROOT_DIR + "/index.html"


            fs.readFile(filePath, function(err, data) {
                if (err) {
                    //report error to console
                    console.log("ERROR: " + JSON.stringify(err))
                    //respond with not found 404 to client
                    response.writeHead(404)
                    response.end(JSON.stringify(err))
                    return
                }
                //respond with file contents
                response.writeHead(200, { "Content-Type": get_mime(filePath) })
                response.end(data)
            })
        }
    })
}).listen(3000)

console.log("Server Running at PORT 3000  CNTL-C to quit")
console.log("To Test:")
console.log("http://localhost:3000/assignment2.html")
