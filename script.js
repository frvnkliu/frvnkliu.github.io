import * as THREE from './three.module.js'
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight*0.95), 0.1, 1000);
camera.position.z = 5;
var renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setClearColor( 0x000000, 0 ); // the default

renderer.setSize(window.innerWidth, window.innerHeight*0.95);
document.getElementById("container").appendChild(renderer.domElement);

//Sphere for detecting mouse hover
var geometry = new THREE.SphereGeometry(2);
var material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
var sphere = new THREE.Mesh(geometry,material );
scene.add(sphere);


//randomly sample points for our spheres
var numPoints = 1000; // adjust as needed
var pointsGeometry = new THREE.BufferGeometry();
var positions = [];
for (var i = 0; i < numPoints; i++) {
    // Generate random points uniformly on a unit sphere
    var u = Math.random();
    var v = Math.random();
    var theta = 2 * Math.PI * u;
    //inverse transform sampling of surface of sphere
    var phi = Math.acos(2 * v - 1);
    // Convert spherical coordinates to Cartesian coordinates
    var x = Math.sin(phi) * Math.cos(theta) * sphere.geometry.parameters.radius;
    var y = Math.sin(phi) * Math.sin(theta) * sphere.geometry.parameters.radius;
    var z = Math.cos(phi) * sphere.geometry.parameters.radius;
    positions.push(x, y, z);
}
pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
var pointsMaterial = new THREE.PointsMaterial({ color: 0xbfffff, size: 0.01 });
var points = new THREE.Points(pointsGeometry, pointsMaterial);
scene.add(points);

var pointsGeometry2 = new THREE.BufferGeometry();
var pointsMaterial2 = new THREE.PointsMaterial({ color: 0xffffff, size: 0.01 });
var positions2 = [];
for (var i = 0; i < numPoints; i++) {
    // Same As Above
    var u = Math.random();
    var v = Math.random();
    var theta = 2 * Math.PI * u;

    //inverse transform sampling of surface of sphere
    var phi = Math.acos(2 * v - 1); 

    // Convert spherical coordinates to Cartesian coordinates
    var x = Math.sin(phi) * Math.cos(theta) * sphere.geometry.parameters.radius;
    var y = Math.sin(phi) * Math.sin(theta) * sphere.geometry.parameters.radius;
    var z = Math.cos(phi) * sphere.geometry.parameters.radius;
    positions2.push(x, y, z);
}
pointsGeometry2.setAttribute('position', new THREE.Float32BufferAttribute(positions2, 3));
var points2 = new THREE.Points(pointsGeometry2, pointsMaterial2);
scene.add(points2);

const terces= document.getElementById("secret").firstElementChild;
// Initial speed
points.rotationSpeed = 0.001;

// Add event listeners for mouse movement
var hovered = false;
var manualSpin = false;

var prevX = 0;
var prevY = 0;

const axisX = new THREE.Vector3(1, 0, 0);
const axisY = new THREE.Vector3(0, 1, 0);

function startSpin(cX, cY){
    prevX = (cX / window.innerWidth) * 2 - 1;
    prevY = -(cY / window.innerHeight) * 2 + 1;
}

function isHover(X, Y){
    //check if mouse is over sphere
    var raycaster = new THREE.Raycaster();
    var mouseVector = new THREE.Vector2(X, Y);
    raycaster.setFromCamera(mouseVector, camera);
    var intersects = raycaster.intersectObject(sphere);
    return intersects.length>0;
}

function onMove(cX, cY) { //cX, cY are client X and Y
    var X = (cX / window.innerWidth) * 2 - 1;
    var Y = -(cY / window.innerHeight) * 2 + 1;
    if(manualSpin){
        var dX = -(Y - prevY);
        var dY = (X - prevX);

        // Rotate the sphere based on mouse movement
        points2.rotateOnWorldAxis(axisX, dX *3);
        points2.rotateOnWorldAxis(axisY, dY *3);
        prevX = X;
        prevY = Y;
    }else{
        hovered = isHover(X,Y);
        if (hovered) {
            points.rotationSpeed = 0.01;
            container.classList.add('hovered');
        } else {
            // Reset rotation speed if no object is hovered
            points.rotationSpeed = 0.001;
            container.classList.remove('hovered');
        }
    }
}

document.addEventListener('mousemove', (event) =>  onMove(event.clientX, event.clientY));
document.addEventListener('mousedown', (event)=>{
    manualSpin = hovered;
    startSpin(event.clientX, event.clientY)
});
document.addEventListener('mouseup', ()=> manualSpin = false);

document.addEventListener('touchmove', (event) => onMove(event.touches[0].clientX, event.touches[0].clientY));
document.addEventListener('touchstart', (event) => {
    manualSpin = true;
    hovered = true;
    startSpin(event.touches[0].clientX, event.touches[0].clientY);
}, false);
document.addEventListener('touchend',()=> hovered = manualSpin = false, false);


//Start Logic
const audio = document.getElementById("bgAudio");

var scaleInner = 0.1;
var scaleOuter = 0.1;

sphere.scale.set(0, 0, 0);
points.scale.set(0, 0, 0);
points2.scale.set(0, 0, 0);

function recalibrate(run = false){
    if(!run){
        terces.value = "bark";
        return false;
    } 
    const cow = terces.value;
    if(/^#[0-9A-F]{6}#[0-9A-F]{6}$/i.test(cow) ){
        pointsMaterial.color.set(cow.substring(0,7));
        pointsMaterial2.color.set(cow.substring(7));
        return true;
    }
    return false;
}


function animate() {
    requestAnimationFrame(animate);
    if(scaleOuter<1){
        scaleOuter = Math.min(1, scaleOuter+0.005);
        audio.volume = scaleOuter;
        scaleInner = scaleOuter
        sphere.scale.set(scaleOuter, scaleOuter, scaleOuter);
        points2.scale.set(scaleOuter, scaleOuter, scaleOuter);
    }else scaleInner = Math.min(Math.max(scaleInner + (hovered?-0.01: (0.015 + (1-scaleInner)*0.03 )) , 0.7),1);

    points.scale.set(scaleInner, scaleInner, scaleInner);

    points.rotation.x += points.rotationSpeed;
    points.rotation.y += points.rotationSpeed;

    if(!manualSpin){
        points2.rotation.x -= 0.001;
        points2.rotation.y -= 0.001;
    }
    renderer.render(scene, camera);
}

var state = 0;
var name = "";
const input = document.getElementById("introInput");
const prompt = document.getElementById("prompt");
const info = document.getElementById("info");
var meow = false;
function onSubmit(){
    if (state == 0) {
        state = 1;
        var ans = input.value.trim().toLowerCase();
        document.body.requestFullscreen();

        prompt.innerHTML = `...`;
        //info.style.display = "block";
        setTimeout(() => {
            recalibrate();
            meow = ans.indexOf(`meow`)>-1
            if(meow) prompt.innerHTML = "Meow. :3";
            else prompt.innerHTML =  (ans.length && ans[0] == '2')||recalibrate(ans === 'bark')?  `Good Job.`: `Close Enough.`;

            if(ans === "red40"){
                pointsMaterial.color.setHex(0xff0000);
            }

            if(ans === "christmas"){
                pointsMaterial.color.setHex(0xff0000);
                pointsMaterial2.color.setHex(0x00ff00);
            }

            if(ans === "nyu"){
                pointsMaterial2.color.setHex(0x8900e1); // NYU Violet
                pointsMaterial.color.setHex(0x57068c); // NYU Ultra Violet
            }

            setTimeout(() => {
                prompt.innerHTML = `What is your name?`;
                input.value = "";
                state = 2;
            }, 1500);
        }, 700);
    } else if (state == 2) {
        audio.volume = scaleOuter;
        name = input.value;
        if (document.body.requestFullscreen) document.body.requestFullscreen();
        
        const overlay = document.getElementById("overlay");
        overlay.innerHTML = `...`;
        setTimeout(() => {
            overlay.innerHTML = `"${meow?"Hewwo\" >.< ": "Hello\" + "} ${name}`;
            setTimeout(() => {
                if(meow && name.toLowerCase() === "emily"){
                    overlay.innerHTML = `<3`;
                    pointsMaterial2.color.setHex(0xffbfff);
                    pointsMaterial.color.setHex(0xff00bf);
                }else{
                    overlay.innerHTML = `:)`;
                }
                setTimeout(() => {
                    audio.play();
                    animate();
                    setTimeout(() => overlay.classList.add("hidden"), 200);
                }, 800);
            }, 1500);
        }, 700);
    }
}

//document.getElementById("submit").addEventListener("touchstart click", onSubmit);

document.getElementById("submit").addEventListener("click", onSubmit);

input.addEventListener("keydown", (e) =>{
    if (e.keyCode == 13) onSubmit();
});



function onWindowResize() {
    // Update the size of the renderer
    renderer.setSize(window.innerWidth, window.innerHeight*.95);

    // Update the aspect ratio of the camera
    camera.aspect = window.innerWidth / (window.innerHeight*.95);
    camera.updateProjectionMatrix();
}

// Add event listener for window resize
window.addEventListener('resize', onWindowResize);