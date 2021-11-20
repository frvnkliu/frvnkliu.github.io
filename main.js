var zip = new JSZip();
//Last Pathloolook3yu s
var photoZip = zip.folder("math-operation-images");
var press = false;
var type = -1;
var typen = -1;
var ctx, canvas, x, y, preview, img, images, countLabel, rand;
var count = [0,0,0,0,0];
function init() {
	var label = document.getElementById("label");
	countLabel = document.getElementById("count");
	canvas = document.getElementById("mathSymbol");
	ctx = canvas.getContext("2d");
	ctx.strokeStyle = "white";
	ctx.lineWidth= 2;
	ctx.lineCap = "round";
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	rand = ((Math.floor(Math.random()*100000000))+"").padStart(8,"0");
	photoCount = 0;

	canvas.addEventListener("mousedown", function(event){
		press = true;
		ctx.beginPath();
	}, false);

	canvas.addEventListener("mousemove", function(event){
			var pos = getPos(event);
			ctx.beginPath();
			ctx.moveTo(x, y); 
			x = pos.x;
			y = pos.y
			if(press){
				ctx.lineTo(x,y);
				ctx.stroke();
			}
	}, false);

	canvas.addEventListener("mouseup", function(event){
		press = false;
	}, false);

	canvas.addEventListener("mouseout", function(event){
		press = false;
	}, false);

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
//
function erase(){
	//if(confirm("Clear Drawing?")){
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	//}
		ctx.closePath();
		press = false;
	console.log("buttonPressed");
}

function save(){
	//Implement saving
	img = canvas.toDataURL();
	
	if(type==-1){
		alert("Please Select an Operation First");
	}else{
		photoZip.folder(type).file(`${type}${count[typen]++}_${rand}.png`,img.split('base64')[1],{base64:true});
		updateCount();
		erase();
	}
}

function download(){
	zip.generateAsync({type:"blob"}).then(function (blob) {
		saveAs(blob, "photos.zip");
	}, function (err) {
        jQuery("#blob").text(err);
    });
}
function updateCount(){
	countLabel.innerHTML = count[typen] + " images";
}
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
function getPos(event){
	var x = event.layerX/10;
	var y = event.layerY/10;
	//var x = event.layerX;
	//var y = event.layerY;
	return{
		x: x,
		y: y
	};
}
