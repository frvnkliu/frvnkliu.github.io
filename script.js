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
var numPoints = 1337; // adjust as needed
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
    startSpin(event.clientX, event.clientY);
});
document.addEventListener('mouseup', ()=>manualSpin = false);

document.addEventListener('touchmove', (event) => {
    event.preventDefault();
    onMove(event.touches[0].clientX, event.touches[0].clientY);
});
document.addEventListener('touchstart', (event) => {
    event.preventDefault();
    manualSpin = true;
    hovered = true;
    points.rotationSpeed = 0.01;
    startSpin(event.touches[0].clientX, event.touches[0].clientY);
}, false);
document.addEventListener('touchend',()=>{
    hovered = manualSpin = false;
    points.rotationSpeed = 0.001;
} , false);


//Start Logic
const audio = document.getElementById("bgAudio");

var scaleInner = 0.1;
var scaleOuter = 0.1;

sphere.scale.set(0, 0, 0);
points.scale.set(0, 0, 0);
points2.scale.set(0, 0, 0);

const clock = new THREE.Clock();


function animate() {
    requestAnimationFrame(animate);

    // Get the time delta in seconds since the last frame
    const deltaTime = clock.getDelta()*69;

    // Adjust scaleOuter and scaleInner with deltaTime
    if (scaleOuter < 1) {
        scaleOuter = Math.min(1, scaleOuter + 0.005 * deltaTime); // Scale increment adjusted by deltaTime
        audio.volume = scaleOuter;
        scaleInner = scaleOuter;
        sphere.scale.set(scaleOuter, scaleOuter, scaleOuter);
        points2.scale.set(scaleOuter, scaleOuter, scaleOuter);
    } else {
        scaleInner += (hovered ? -0.01 : (0.015 + (1 - scaleInner) * 0.03)) * deltaTime;
        scaleInner = Math.min(Math.max(scaleInner, 0.7), 1);
    }

    points.scale.set(scaleInner, scaleInner, scaleInner);

    // Update rotation based on deltaTime for smoother animation
    points.rotation.x += points.rotationSpeed * deltaTime;
    points.rotation.y += points.rotationSpeed * deltaTime;

    if (!manualSpin) {
        points2.rotation.x -= 0.001 * deltaTime;
        points2.rotation.y -= 0.001 * deltaTime;
    }

    renderer.render(scene, camera);
}

var state = 0;
var name = "";
const input = document.getElementById("introInput");
const prompt = document.getElementById("prompt");
var meow = false;

function onSubmit(event){
    event.preventDefault();
    if (state == 0) {
        state = 1;
        var ans = input.value.trim().toLowerCase();
        if (document.body.requestFullscreen) document.body.requestFullscreen();

        prompt.innerHTML = `...`;
        setTimeout(() => {
            state = 2;
            meow = ans.indexOf(`meow`)>-1;
            prompt.innerHTML = meow ? "Meow. :3": (/^2\D.*$|^2$/.test(ans)? `Good Job.` :`Close Enough.`);
            setTimeout(() => {
                    prompt.innerHTML = `Pick a color:`;
                    input.type = "color";
                    input.value = "#bfffff";
            }, 1500);
        }, 700);
    }else if(state==2){
        state = 3;
        prompt.innerHTML = `...`;
        setTimeout(() => {
            pointsMaterial.color.set(input.value);
            prompt.innerHTML = `The stars turn <span style = "color: ${input.value}">Δ</span>`
            setTimeout(() => {
                prompt.innerHTML = `What is your name?`;
                input.type = "text";
                input.value = "";
                state = 4;
            }, 1500);
        }, 700);
    }else if(state == 4) {
        audio.volume = scaleOuter;
        name = input.value;

        const overlay = document.getElementById("overlay");
        overlay.innerHTML = `...`;
        setTimeout(() => {
            overlay.innerHTML = `"${meow?"Hewwo\" >.< ": "Hello \" + "} ${name}`;
            setTimeout(() => {
                if(meow && name.toLowerCase() === "emily"){
                    pointsMaterial2.color.setHex(0xffbfff);
                    pointsMaterial.color.setHex(0xff00bf);
                    overlay.innerHTML = `<3`;
                } else overlay.innerHTML = `:)`;
                setTimeout(() => {
                    audio.play();
                    animate();
                    setTimeout(() => overlay.classList.add("hidden"), 200);
                }, 800);
            }, 1500);
        }, 700);
    }
}

document.getElementById("submit").addEventListener("click", onSubmit);

input.addEventListener("keydown", (e) =>{
    if (e.keyCode == 13) onSubmit(e);
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