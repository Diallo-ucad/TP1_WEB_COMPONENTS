
import './lib/webaudio-controls.js';

const getBaseURL = () => {
  const base = new URL('.', import.meta.url);
  console.log("Base = " + base);
	return `${base}`;
};

const template = document.createElement("template");
template.innerHTML = `
  <style>
    H1 {
          color:red;
    }

    #contener {
      margin: 100px;
      margin-left:100px;
      border:1px solid;
      border-radius:15px;
      background-color:brown;
      padding:50px;
      width:700px;
      height: 600px;
      box-shadow: 10px 10px 5px grey;
      text-align:center;
      font-family: "Open Sans";
      font-size: 12px;
    }

    #myCanvas {

      width: 690px;
      padding:5px;
      height: 200px;
      border-radius:15px;
      background-color:brown;
    
    }

    #btn {

      width: 690px;
      padding:5px;
      height: 50px;
      border-radius:15px;
      background-color:brown;

    }

    div.controls label {
      display: inline-block;
      text-align: center;
      width: 50px;
    }
    div.controls:hover {
      color:white;
      font-weight:bold;
    }
    div.controls label, div.controls input, output {
        vertical-align: middle;
        padding: 0;
        margin: 0;
       font-family: "Open Sans",Verdana,Geneva,sans-serif,sans-serif;
      font-size: 12px;
    }

    #anim{
      margin-top: 5px;
      margin-bottom: 10px;
    }
  </style>
  <div id="contener">
  <audio id="myPlayer" crossorigin>
        <source src="https://mainline.i3s.unice.fr/mooc/LaSueur.mp3" type="audio/mp3" />
    </audio>

   <div id="btn">
    <webaudio-switch id="playpause" width="32" height="32" src="./assets/imgs/playpause.png" value=0>ON</webaudio-switch>
    <webaudio-switch id="backButton" width="32" height="32" src="./assets/imgs/back.png" type="kick">NEXT</webaudio-switch>
    <webaudio-switch id="nextButton" width="32" height="32" src="./assets/imgs/next.png" type="kick">BACK</webaudio-switch>
    <webaudio-switch id="currentTimeButton" width="32" height="32" src="./assets/imgs/retour.png" type="kick">BACK</webaudio-switch>   
   </div>
    <canvas id="myCanvas"></canvas>
    <webaudio-knob id="knobVolume" tooltip="Volume:%s" src="./assets/imgs/v2.png" height="80" width="80" sprites="16" value=0.5 min="0" max="1" step=0.01>
        Volume</webaudio-knob>

    <div id="anim">
    <webaudio-knob id="time" tooltip="Volume:%s" src="./assets/imgs/btn_vol_eguille.png" height="127" width="127" sprites="127" value=0.5 min="0" max="1" step=0.01>
    Volume</webaudio-knob>
    </div>
    <div class="controls">
    
    <label>60Hz</label>
    <webaudio-slider id="s0" type="range" value="0" step="1" min="-30" max="30" src="./assets/imgs/s3.png"  tracking="abs" width="200" height="20">
    </webaudio-slider>
    <output id="gain0">-1 dB</output>
    </div>

    <div class="controls">
    <label>170Hz</label>
    <webaudio-slider id="s1" type="range" value="0" step="1" min="-30" max="30" src="./assets/imgs/s3.png"  tracking="abs" width="200" height="20">
    </webaudio-slider>
    <output id="gain1">-3 dB</output>
    </div>

    <div class="controls">
    <label>350Hz</label>
    <webaudio-slider id="s2" type="range" value="0" step="1" min="-30" max="30" src="./assets/imgs/s3.png"  tracking="abs" width="200" height="20">
    </webaudio-slider>
    <output id="gain2">-4 dB</output>
    </div>

    <div class="controls">
    <label>1000Hz</label>
    <webaudio-slider id="s3" type="range" value="0" step="1" min="-30" max="30" src="./assets/imgs/s3.png"  tracking="abs" width="200" height="20">
    </webaudio-slider>
    <output id="gain3">0 dB</output>
    </div>

    <div class="controls">
    <label>3500Hz</label>
    <webaudio-slider id="s1" type="range" value="0" step="4" min="-30" max="30" src="./assets/imgs/s3.png"  tracking="abs" width="200" height="20">
    </webaudio-slider>
    <output id="gain4">0 dB</output>
    </div>

    <div class="controls">
    <label>10000Hz</label>
    <webaudio-slider id="s5" type="range" value="0" step="1" min="-30" max="30" src="./assets/imgs/s3.png"  tracking="abs" width="200" height="20">
    </webaudio-slider>
    <output id="gain5">0 dB</output>
    </div>

    </div>
  </div>
        `;

class MyAudioPlayer extends HTMLElement {
  isonplay=false;
  constructor() {
    super();
    this.volume = 0.5;
    this.attachShadow({ mode: "open" });
    //this.shadowRoot.innerHTML = template;
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.basePath = getBaseURL(); // url absolu du composant
    // Fix relative path in WebAudio Controls elements
		this.fixRelativeImagePaths();
  }

  async connectedCallback() {
    this.player = this.shadowRoot.querySelector("#myPlayer");
    this.playPause_swith=this.shadowRoot.querySelector("#playpause");
    this.time=this.shadowRoot.querySelector("#time");
    this.player.loop = true;

    let audioContext = new AudioContext();
let playerNode = audioContext.createMediaElementSource(this.player);

// panner
this.pannerNode = audioContext.createStereoPanner();

// visualization
this.analyser = audioContext.createAnalyser();

// Try changing for lower values: 512, 256, 128, 64...
this.analyser.fftSize = 1024;
this.bufferLength = this.analyser.frequencyBinCount;
this.dataArray = new Uint8Array(this.bufferLength);

playerNode
  .connect(this.pannerNode)
  .connect(this.analyser)
  .connect(audioContext.destination);

this.canvas = this.shadowRoot.querySelector("#myCanvas")
console.log('canvas', this.canvas.width);
this.canvasContext = this.canvas.getContext('2d');
    
   requestAnimationFrame(this.visualize);

    this.declareListeners();
  }

  fixRelativeImagePaths() {
		// change webaudiocontrols relative paths for spritesheets to absolute
		let webaudioControls = this.shadowRoot.querySelectorAll(
			'webaudio-knob, webaudio-slider, webaudio-switch, img'
		);
		webaudioControls.forEach((e) => {
			let currentImagePath = e.getAttribute('src');
			if (currentImagePath !== undefined) {
        
				//console.log("Got wc src as " + e.getAttribute("src"));
				let imagePath = e.getAttribute('src');
        //e.setAttribute('src', this.basePath  + "/" + imagePath);
        e.src = this.basePath  + "/" + imagePath;
        //console.log("After fix : wc src as " + e.getAttribute("src"));
			}
		});
  }
  
  declareListeners() {
    //Action play
    this.shadowRoot.querySelector("#playpause").addEventListener("click", (event) => {
      this.playPause();
    
    });


    this.shadowRoot
    .querySelector("#knobVolume")
    .addEventListener("input", (event) => {
      this.setVolume(event.target.value);
    });
  
    //Action Replay
    this.shadowRoot.querySelector("#currentTimeButton").addEventListener("click", (event) => {
      this.replay();
    
    });


    //Action Next
    this.shadowRoot.querySelector("#nextButton").addEventListener("click", (event) => {
      this.next();
    
    });

    //Action Back
    this.shadowRoot.querySelector("#backButton").addEventListener("click", (event) => {
      this.back();
    
    });
   

    // Equalizer
    this.shadowRoot.querySelector("#gain0").addEventListener("input", (event) => {
      this.changeGain(event.target.value, 0);
    });

    this.shadowRoot.querySelector("#gain1").addEventListener("input", (event) => {
      this.changeGain(event.target.value, 1);
    });

    this.shadowRoot.querySelector("#gain2").addEventListener("input", (event) => {
      this.changeGain(event.target.value, 2);
    });

    this.shadowRoot.querySelector("#gain3").addEventListener("input", (event) => {
      this.changeGain(event.target.value, 3);
    });

    this.shadowRoot.querySelector("#gain4").addEventListener("input", (event) => {
      this.changeGain(event.target.value, 4);
    });

    this.shadowRoot.querySelector("#gain5").addEventListener("input", (event) => {
      this.changeGain(event.target.value, 5);
    });

   
  }
  
  playpausevalues() {
    var value= this.playPause_swith.getAttribute("value");
    if (value=="0"){ this.playPause_swith.setAttribute("value","1"); }
     else { this.playPause_swith.setAttribute("value","0"); }
 
     return this.playPause_swith.getAttribute("value");
   }

  playPause(){
    var statut=  this.playpausevalues();
  
    if(statut=="0"){
      this.isonplay=false;
      this.player.pause();
      
    }  
    else  {
      this.player.play();
      this.isonplay=true;
    
    
    }

    }
    ////////////////////////////////////
  
  // API
  setVolume(val) {
    this.player.volume = val;
    if(val==0){
      this.isonplay=false;
    }else{
      this.isonplay=true;
    }
  }

  play() {
    this.player.play();
    this.timeupdate();
  }

  //Bouton Pause 
  pause() {
    this.player.pause();
  }

   //Bouton replay
  //Bouton replay
  replay() {
    this.player.currentTime=0;
  }

  //next 10s
  next() {
    this.player.currentTime+=10;
  }
  //Back 10s
  back() {
    this.player.currentTime-=10;
  }

  animbtn(){
    this.shadowRoot.querySelector("#time").setValue(Math.random() * 10-i);
  }

   changeGain(sliderVal,nbFilter) {
    var value = parseFloat(sliderVal);
    filters[nbFilter].gain.value = value;
    // update output labels
    var output = document.querySelector("#gain"+nbFilter);
    output.value = value + " dB";
  }
   changeMasterGain(sliderVal) {
    var value = parseFloat(sliderVal);
    masterGain.gain.value =  value/10;
    
     // update output labels
    var output = document.querySelector("#masterGainOutput");
    output.value = value;
  }
  
   changeBalance(sliderVal) {
    // between -1 and +1
    var value = parseFloat(sliderVal);
    
  stereoPanner.pan.value = value;
     // update output labels
    var output = document.querySelector("#balanceOutput");
    output.value = value;
  }


                      //////////////////////Build Audio graph///////////////////////////
  

  //
  visualize = () => {

    
    // clear the canvas
    // like this: canvasContext.clearRect(0, 0, width, height);
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Or use rgba fill to give a slight blur effect
    this.canvasContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.canvasContext.fillRect(0, 0, width, height);

    
    // Get the analyser data
    this.analyser.getByteTimeDomainData(this.dataArray);
  
    this.canvasContext.lineWidth = 2;
    this.canvasContext.strokeStyle = 'lightBlue';
  
    // all the waveform is in one single path, first let's
    // clear any previous path that could be in the buffer
    this.canvasContext.beginPath();
    
    var sliceWidth = width / this.bufferLength;
    var x = 0;
  
    for(var i = 0; i < this.bufferLength; i++) {
       // normalize the value, now between 0 and 1
       var v = this.dataArray[i] / 255;
      
       // We draw from y=0 to height
       var y = v * height;
  
       if(i === 0) {
          this.canvasContext.moveTo(x, y);
       } else {
          this.canvasContext.lineTo(x, y);
       }
       
       x += sliceWidth;
    }

    for(var j=0; j<this.bufferLength; j++){
      if(this.isonplay==true){
        this.shadowRoot.querySelector("#time").setValue(Math.random() * 10);
      }
      else 
      this.shadowRoot.querySelector("#time").setValue(5);
    
    }
    
  
    this.canvasContext.lineTo(this.canvas.width, this.canvas.height/2);
    
    // draw the path at once
    this.canvasContext.stroke();  
    
    // call again the visualize function at 60 frames/s
    requestAnimationFrame(this.visualize);
    
  }

  ///////////////////////////////////////
  


}

customElements.define("my-audioplayer", MyAudioPlayer);
