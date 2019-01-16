/*
COMP 2406 (c) L.D. Nel 2018

Javascript to handle mouse dragging and release
to drag a string around the html canvas.
Keyboard arrow keys are used to move a moving box around.

Here we are doing all the work with javascript and jQuery. (none of the words
are HTML, or DOM, elements. The only DOM elements are the canvas on which
where are drawing and a text field and button where the user can type data.

This example shows examples of using JQuery.
JQuery is a popular helper library that has useful methods,
especially for sendings asynchronous (AJAX) requests to the server
and catching the responses.

See the W3 Schools website to learn basic JQuery
JQuery syntax:
$(selector).action();
e.g.
$(this).hide() - hides the current element.
$("p").hide() - hides all <p> elements.
$(".test").hide() - hides all elements with class="test".
$("#test").hide() - hides the element with id="test".

Mouse event handlers are being added and removed using jQuery and
a jQuery event object is being passed to the handlers.

Keyboard keyDown handler is being used to move a "moving box" around
Keyboard keyUP handler is used to trigger communication with the
server via POST message sending JSON data
*/

//Use javascript array of objects to represent words and their locations
let words = []

let timer //use for animation motion

let wordBeingMoved

let scanResult = []

let deltaX, deltaY //location where mouse is pressed

const canvas = document.getElementById('canvas1'); //our drawing canvas

function getWordAtLocation(aCanvasX, aCanvasY) {

    let context = canvas.getContext('2d')

  //locate the word near aCanvasX,aCanvasY
  //Just use crude region for now.
  //should be improved to using length of word etc.

  //note you will have to click near the start of the word
  //as it is implemented now
  for (let i = 0; i < words.length; i++) {

    //console.log("Wid = " + words[i].word.Width)
    if ( (0 < (aCanvasX - words[i].x)) && ((aCanvasX - words[i].x) < context.measureText(words[i].word).width ) &&
        (-20 < (aCanvasY - words[i].y)) && ((aCanvasY - words[i].y) < 0) ){
        return words[i]
    }
  }
  return null
}

function drawCanvas() {

  let context = canvas.getContext('2d')

  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height) //erase canvas

  context.font = '13pt Georgia'
  context.fillStyle = 'cornflowerblue'

  for (i in words) {
    let data = words[i]
      //different scenarios for text
    if (data.word.charAt(0) === '['){
        //Text above

        context.strokeStyle = 'green'
        context.fillText(data.word.slice(1,data.word.indexOf("]")), data.x, data.y)
        context.strokeText(data.word.slice(1,data.word.indexOf("]")), data.x, data.y)
    }else {
        //Text Below

        context.fillText(data.word, data.x, data.y)
        context.strokeText(data.word, data.x, data.y)
    }
      context.strokeStyle = 'blue'

  }

  context.beginPath();
  context.stroke()
}

function handleMouseDown(e) {

  //get mouse location relative to canvas top left
  let rect = canvas.getBoundingClientRect()
  //var canvasX = e.clientX - rect.left
  //var canvasY = e.clientY - rect.top
  let canvasX = e.pageX - rect.left //use jQuery event object pageX and pageY
  let canvasY = e.pageY - rect.top
  console.log("mouse down:" + canvasX + ", " + canvasY)

  wordBeingMoved = getWordAtLocation(canvasX, canvasY)
  //console.log(wordBeingMoved.word)
  if (wordBeingMoved != null) {
    deltaX = wordBeingMoved.x - canvasX
    deltaY = wordBeingMoved.y - canvasY
    //document.addEventListener("mousemove", handleMouseMove, true)
    //document.addEventListener("mouseup", handleMouseUp, true)
    $("#canvas1").mousemove(handleMouseMove)
    $("#canvas1").mouseup(handleMouseUp)

  }

  // Stop propagation of the event // TODO:  stop any default
  // browser behaviour

  e.stopPropagation()
  e.preventDefault()

  drawCanvas()// reflesh the canvas
}

function handleMouseMove(e) {

  console.log("mouse move")

  //get mouse location relative to canvas top left
  let rect = canvas.getBoundingClientRect()
  let canvasX = e.pageX - rect.left
  let canvasY = e.pageY - rect.top

  wordBeingMoved.x = canvasX + deltaX
  wordBeingMoved.y = canvasY + deltaY

  e.stopPropagation()

  drawCanvas()
}

function handleMouseUp(e) {
  console.log("mouse up")

  e.stopPropagation()

  //remove mouse move and mouse up handlers but leave mouse down handler
  $("#canvas1").off("mousemove", handleMouseMove) //remove mouse move handler
  $("#canvas1").off("mouseup", handleMouseUp) //remove mouse up handler

  drawCanvas() //redraw the canvas
}

//JQuery Ready function -called when HTML has been parsed and DOM
//created
//can also be just $(function(){...});
//much JQuery code will go in here because the DOM will have been loaded by the time
//this runs

function handleTimer() {
  drawCanvas()
}

//KEY CODES
//should clean up these hard coded key codes
const ENTER = 13
const RIGHT_ARROW = 39
const LEFT_ARROW = 37
const UP_ARROW = 38
const DOWN_ARROW = 40


function handleKeyDown(e) {

  console.log("keydown code = " + e.which)


  let keyCode = e.which
  if (keyCode == UP_ARROW | keyCode == DOWN_ARROW) {
    //prevent browser from using these with text input drop downs
    e.stopPropagation()
    e.preventDefault()
  }

}

function handleKeyUp(e) {
  console.log("key UP: " + e.which)

  if (e.which == ENTER) {
    handleSubmitButton() //treat ENTER key like you would a submit
    $('#userTextField').val('') //clear the user text field
  }

  e.stopPropagation()
  e.preventDefault()
}

function handleSubmitButton() {

  let userText = $('#userTextField').val(); //get text from user text input field

  if (userText && userText != '') {
    //user text was not empty
      let textDiv = document.getElementById("text-area")

    let userRequestObj = {
      text: userText
    } //make object to send to server
    let userRequestJSON = JSON.stringify(userRequestObj) //make JSON string
    $('#userTextField').val('') //clear the user text field

    //Prepare a POST message for the server and a call back function
    //to catch the server repsonse.
    //alert ("You typed: " + userText)
    $.post("userText", userRequestJSON, function(data, status) {
      console.log("data: " + data)
      console.log("typeof: " + typeof data)
      let responseObj = JSON.parse(data)

      //replace word array with new words if there are any

        //if responseObj contains content, update HTML
      if (responseObj.content) {
          let receiveContents = responseObj.content
          console.log("Object Received! " + JSON.stringify(receiveContents))
          //display original contents
          words = []
          textDiv.innerHTML = ''
          for(i in receiveContents){ textDiv.innerHTML = textDiv.innerHTML + `<p> ${receiveContents[i]}</p>` }
          //display words on canvas
          updateWords(receiveContents)

      }else{
          //if no contents received, clear everything
          words = []// no words
          textDiv.innerHTML = ''
      }
    })
  }

}

function updateWords(receiveContents){

    let context = canvas.getContext('2d')

    for(i in receiveContents){
        //Push every single word to words var
        let sLine = receiveContents[i].split(' ')

        let singleLine = []

        // deal with chord [XX]
        for (line of sLine){
            for (word of line.split(/(\[.*?\])/g))//general expression split the any expression with [---]
                if(word != "") singleLine.push(word)
        }
        ///(\[.*?\])/g

        let currentX = 20;
        let upperX = 20;
        for(s in singleLine){
            if(singleLine[s].charAt(0) === "["){
                if(currentX > upperX){
                    words.push({word: singleLine[s], x: currentX, y: 30 + 60 * i})
                    upperX = currentX + context.measureText(singleLine[s]).width + 5
                }else{
                    words.push({word: singleLine[s], x: upperX, y: 30 + 60 * i})
                    upperX += context.measureText(singleLine[s]).width + 5
                }
                //Keeping offset to be one character wide
                currentX += context.measureText("A").width
            }else{
                words.push({word: singleLine[s], x: currentX, y: 50 + 60 * i})// deal with position
                currentX += context.measureText(singleLine[s]).width + 10
            }
        }
    }
}

function handleUpButton(){
    //let context = canvas.getContext('2d')
    console.log('TransposeUP')
    if (words.length != 0){// if it is not empty
        for (i in words){
            if (words[i].word.charAt(0) == '[') {// if it is a chord!
                words[i].word = "[" + changeChord(words[i].word, 1)// transposed up one semitone
            }
            if (words[i].word.indexOf('/')>-1){
                let slashPosition = words[i].word.indexOf('/')
                let temp = words[i].word.substr(slashPosition, words[i].word.length)
                //console.log(changeChord(temp,1))
                //console.log(words[i].word.substr(0,slashPosition))
                words[i].word = words[i].word.substr(0,slashPosition)+'/' + changeChord(temp,1)
            }

        }
        drawCanvas()
    }
}

function handleDownButton(){
    //let context = canvas.getContext('2d')
    console.log('TransposeDOWN')
    if (words.length != 0){// if it is not empty
        for (i in words){
            if (words[i].word.charAt(0) == '['){
                words[i].word = "[" + changeChord(words[i].word,-1)//  transposed down one semitone
            }
            if (words[i].word.indexOf('/')>-1){
                let slashPosition = words[i].word.indexOf('/')
                let temp = words[i].word.substr(slashPosition, words[i].word.length)
                //console.log(changeChord(temp,1))
                //console.log(words[i].word.substr(0,slashPosition))
                words[i].word = words[i].word.substr(0,slashPosition)+'/' + changeChord(temp,-1)
            }
        }
        drawCanvas()
    }
}

// input a string and change the word in the string!
function changeChord(original,upOrDown){
    let arrayOne = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#']
    let arrayTwo = ['A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab']
    // upOrDown +1 is up -1 is down
    if (original.length > 3){
        if (original.charAt(2) === '#'){
            for (let i = 0; i < arrayOne.length; i++){
                if (original.charAt(1) === arrayOne[i]){
                    return arrayOne[(i+1+upOrDown+12)%12] + original.substr(3)
                }
            }
        }
        else if (original.charAt(2) === 'b'){
            for (let i = 0; i < arrayTwo.length; i++){
                if (original.charAt(1) === arrayTwo[i]){
                    return arrayTwo[(i-1+upOrDown+12)%12] + original.substr(3)
                }
            }
        }
    }

        for (let i = 0; i < arrayOne.length; i++){
            if (original.charAt(1) === arrayOne[i]){
                return arrayOne[(i+upOrDown+12)%12] + original.substr(2)
            }
        }
    /*
    let slash = original.indexOf('/');
    console.log(original.indexOf('/'))
    if (slash >= 0){
        console.log("There is a slash")
        if (original.charAt(slash+2) === '#'){
            for (let i = 0; i < arrayOne.length-slash; i++){
                if (original.charAt(slash+1) === arrayOne[i]){
                    return arrayOne[(i+1+upOrDown+12)%12] + original.substr(slash+3)
                }
            }
        } else {
            for (let i = 0; i < arrayOne.length-slash; i++){
                if (original.charAt(slash+1) === arrayOne[i]){
                    return arrayOne[(i+upOrDown+12)%12] + original.substr(slash+2)
                }
            }
        }
    }
    */


}

function handleRefreshButton(){
    let textDiv = document.getElementById("text-area")

    scanResult = []
    let context = canvas.getContext('2d')
    console.log("Refresh!")
    //divided canvas into 8 area, scan each area accordingly
    for(let scanArea = 0; scanArea < 8; scanArea ++){
        //get words that are in current line
        let thisLine = []
        for(let word in words){
            if((scanArea * 62.5 < words[word].y) && (words[word].y < (scanArea + 1) * 62.5)){
                thisLine.push(words[word])
            }
        }
        thisLine.sort(function(a, b) {
            if(a.x - b.x > 0){
                //b is in front of a
                if(a.word.charAt(0) === "[" && a.x < b.x + context.measureText(b.word).width){ return -1 }
                return 1
            }else{
                //a is in front of b
                if(b.word.charAt(0) === "[" && b.x < a.x + context.measureText(a.word).width){ return 1 }
                return -1
            }
        })
        //console.log(thisLine)
        //add current line in scanresult
        let thisLineText = ""
        for(let word in thisLine){ thisLineText += thisLine[word].word + " " }
        scanResult.push(thisLineText)
    }
    console.log(scanResult)

    //update canvas and everything else
    words = []

    textDiv.innerHTML = ''
    for(i in scanResult){ textDiv.innerHTML = textDiv.innerHTML + `<p> ${scanResult[i]}</p>` }
    updateWords(scanResult)
    drawCanvas()

    //var 'scanResult' is an array of lines of words of current contents inside the canvas
}

function handleSave(){
    //send 'scanResult' back to server
    let saveAsName = $('#userTextField').val(); //get text from user text input field
    let textDiv = document.getElementById("text-area")

    if (saveAsName && saveAsName != '') {
        //user text was not empty
        console.log("Save!")
        handleRefreshButton()

        let userRequestObj = {
            saveAs: saveAsName,
            content: scanResult
        } //make object to send to server
        let modifiedContentsJSON = JSON.stringify(userRequestObj) //make JSON string
        $('#userTextField').val('') //clear the user text field

        //send data back to server
        $.post("userText", modifiedContentsJSON, function(data, status){
            console.log("data: " + data)
            console.log("typeof: " + typeof data)
            let responseObj = JSON.parse(data)
            if(responseObj.saveStatus){
                //print message from server to console
                console.log(responseObj.saveStatus)
            }
        })
    }
    textDiv.innerHTML = ''
    for(i in scanResult){ textDiv.innerHTML = textDiv.innerHTML + `<p> ${scanResult[i]}</p>` }
}


$(document).ready(function() {
  //This is called after the broswer has loaded the web page

  //add mouse down listener to our canvas object
  $("#canvas1").mousedown(handleMouseDown)

  //add key handler for the document as a whole, not separate elements.
  $(document).keydown(handleKeyDown)
  $(document).keyup(handleKeyUp)

  timer = setInterval(handleTimer, 50)
  //clearTimeout(timer) //to stop

  drawCanvas()
})
