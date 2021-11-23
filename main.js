var zip = new JSZip();
//Creates Export folder
var photoZip = zip.folder("math-operation-images");
var press = false;
var type = -1;
var typen = -1;
var ctx, canvas, x, y, preview, img, images, countLabel, rand;
var count = [0,0,0,0,0];
function init() {
	//Instantiating Canvas and labels
	var label = document.getElementById("label");
	countLabel = document.getElementById("count");
	canvas = document.getElementById("mathSymbol");
	ctx = canvas.getContext("2d");
	ctx.strokeStyle = "white";
	ctx.lineWidth= 2;
	ctx.lineCap = "round";
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	//Randomly Generated 8 digit key to avoid naming conflicts
	rand = ((Math.floor(Math.random()*100000000))+"").padStart(8,"0");
	photoCount = 0;

	//Mouse
	//When mouse is pressed down begin drawing
	canvas.addEventListener("mousedown", function(event){
		press = true;
		ctx.beginPath();
	}, false);

	//For every Mouse movement create a new path from the old position and fill it in.
	canvas.addEventListener("mousemove", function(event){
		draw(event);
	}, false);
	
	//If mouse is no longer clicked, press = false;
	canvas.addEventListener("mouseup", function(event){
		press = false;
	}, false);

	//If mouse moves off canvas, press = false;
	canvas.addEventListener("mouseout", function(event){
		press = false;
	}, false);
	
	//Touch

	//Touch start
	canvas.addEventListener("touchstart", function(event){
		event.preventDefault();
		press = true;
		ctx.beginPath();
	}, false);
	//Touch move
	canvas.addEventListener("touchmove", function(event){
		ctx.beginPath();
		event.preventDefault();
		draw(event);
	}, false);
	//Touch end
	canvas.addEventListener("touchend", function(event){
		event.preventDefault();
		press = false;
	}, false);
	//Touch Cancel
	canvas.addEventListener("touchcancel", function(event){
		press = false;
	}, false);

	//Keyboard Shortcuts
	document.addEventListener("keydown", function(event){
		switch(event.key){
			case "s":
				save();
				break;
			case "c":
				erase();
				break;
			default:
		}
	},false);
}

//Drawing function
function draw(event){
	var pos = getPos(event);
	ctx.beginPath();
	ctx.moveTo(x, y); 
	x = pos.x;
	y = pos.y
	if(press){
		ctx.lineTo(x,y);
		ctx.stroke();
	}
}

//Erases the current canvas
function erase(){
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.closePath();
	press = false;
	console.log("buttonPressed");
}

//Saves the canvas and clears it if an operation is selected
function save(){
	img = canvas.toDataURL();
	if(type==-1){
		alert("Please Select an Operation First");
	}else{
		photoZip.folder(type).file(`${type}${count[typen]++}_${rand}.png`,img.split('base64')[1],{base64:true});
		updateCount();
		erase();
	}
}

//Download the zip file
function download(){
	zip.generateAsync({type:"blob"}).then(function (blob) {
		saveAs(blob, "photos.zip");
	}, function (err) {
        jQuery("#blob").text(err);
    });
}

//Updates the count of images
function updateCount(){
	countLabel.innerHTML = count[typen] + " images";
}

//Switches the current operation, clears the canvas
function switchOp(button){
	type = button.id;
	switch(type){
		case "plus":
			typen = 0;
			label.innerHTML = "plus (+)";
			break;
		case "minus":
			typen = 1;
			label.innerHTML = "minus (-)";
			break;
		case "multiply":
			typen = 2;
			label.innerHTML = "multiply (×)";
			break;
		case "divide":
			typen = 3;
			label.innerHTML = "divide (÷)";
			break;
		case "slash":
			typen = 4;
			label.innerHTML = "slash (/)";
			break;
	}
	updateCount();
	erase();
}

//Gets the current position, scaled down because the canvas is scaled up
function getPos(event){
	var x = event.layerX/10;
	var y = event.layerY/10;
	return{
		x: x,
		y: y
	};
}
