/*
Section descriptions  in order, current
1.1 $(document).ready
1.2	pseudo-global variables
1.3 tab display, new game button and form
1.4 Utility functions (randomizer, debounce, etc.)

2.1 Stat change rule functions
2.2 updater  function, takes stats, rules, and postdreamFunc as arguments
2.3 Sceneset function
// END OF NUMBERING
Unordered List:
Further pseudo-global variables
Dream constructor 'Nocturne'
	Constructed dream objects defined
	dream array is defined
	current dream function

Stat constructor 'statDefine'
 	Constructed stat objects, stat array is filled in by constructor

Button and button event constructor function
Button display function

Officer constructor function
	Constructed officer objects defined
	officer array is defined
	officer array specific functions

Constructed button objects defined

turn rules are defined, along with day display

actionCounter, dreamEnter, dreamDisplay, dreamLeaver functions all defined

scenesArray defined

subVal object contains functions for calculating speed and morale

Data and UI display function, New Game form display and submit function

gameFinish function

subHalvesDisp function controls sub images and opening/closing of details tags

cptNameSet function, local storage of captains name or default if none found

dossierManage function appends text to dossier tab

toCaptainLog function appends text to the log

*/

//1.1 $(document).ready, sets basic tab display
$(document).ready(function(){

//1.2	pseudo-global variables
var cptName; //stores captain name
var $input; //
var destinationReached = false;
var haveDescended = false;


//1.3 tab display, new game button and form
$('#tabs-first a').click(function (e) {
          e.preventDefault();
          $(this).tab('show');
       });

$('.newgame').on("click", formDisplay);
$('.namediv').submit(formSubmitNewGame);


//1.4 General utility functions (randomizer, debounce, etc.)

function randomizer (min, max){
	return Math.floor(Math.random()*((max-min) +1)) + min;
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

function byLeast(propName) {
	return function(obj1, obj2) {
		var v1 = obj1[propName];
		var v2 = obj2[propName];
	    if (v1 < v2) {
	    	return -1;
	    } else if (v1 > v2) {
	    	return 1;
	    } else {
	    	return 0;
	    }
	};
}

function returnLeast(arr, stat){
	var newOrder = arr.sort(byLeast(stat));
	return newOrder;
}


//whenever stats are changed a check is performed
function statChange (stat, order, changeby){
	var oldValue = stat.curVal;
	if (order === "+"){
		stat.curVal += changeby;
	}
	if (order === "-"){
		stat.curVal -= changeby;
	}
	if (order === "*"){
		stat.curVal *= changeby;
	}
	if (order === "/"){
		stat.curVal /= changeby;
	}
	return statRules(oldValue, stat);
}

function statRules(old, cur, onLoop){
	if (cur.curVal <= 0 && cur.name !== "miles" && cur.name !== "depth"){
			$('<p>').text(cur.dispName + " has dropped below the minimum level. Your mission and your life end here. Start a new game in game options, or hit refresh.").appendTo('.shortdesc');
			$('.mainOptions').addClass("inactive");
	}
	if (onLoop){
		return cur.setDisp();
	} else {
		return statMsg(old, cur);
	}
}

function statMsg (old, cur){
	if (cur.curVal > old && cur.name !== "miles"){
		$('<p>').text(cur.dispName + " has increased.").appendTo('.shortdesc');
	}
	if (cur.curVal < old && cur.name !== "miles"){
		$('<p>').text(cur.dispName + " has decreased.").appendTo('.shortdesc');
	}
	cur.setDisp();
}

//2.2 updater  function, takes stats, rules, and postdreamFunc as arguments
function updater (statArr, rules, postDreamFunc){
	var i;
	if (postDreamFunc){
		postDreamFunc()
	}
	if (rules){
		rules();
	}
	for (i=0; i < statArr.length; i++){
		statRules(null, statArr[i], true)
	  	}
}

//2.3 sceneSet
function sceneSet(choices, mainDesc, shortDesc){
	var i;
	if(mainDesc){
		$('<p>').text(mainDesc).appendTo('.desc');
	}
	if(shortDesc){
		$('<p>').text(shortDesc).appendTo('.shortdesc');
	}
	if (choices) {
		for (i=0; i < choices.length; i++){
			butDisplay(choices[i], $('.mainoptions'));
		}
	} else {
		return;
	}
	if (destinationReached && !haveDescended){
		$('.mainOptions  > button').addClass('inactive');
		haveDescended = true;
		var descendArr = [descend0];
		return sceneSet(descendArr, "We arrived at the coordinates of the anomaly.", "We've reached our destination. We'll need to descend far enough down to deploy the SPURV device.");
	}
}

// further pseudo-global variables
var secondary = false;
var statArray = [];
var day = 1;
var actionCount = 0;
var actionMax = 2;
var saneCount = 0;
var dreamCount = 0;
var oceanBottom = false;

/* var  count = {
	day: 1,
	actionCount: 0,
	actionMax: 2,
	dreamCount: 0,
	saneCount: 0
} */



//Constructor (Dream)
function  Nocturne (imgS, audS, dreamDesc, nextDayDesc, textColor, dreamOpts, nextDayOpts) {
	this.imgS = imgS;
	this.audS = audS;
	this.dreamDesc = dreamDesc;
	this.nextDayDesc = nextDayDesc;
	this.textColor = textColor;
}

//Variables made by dream constructor
var dream0 = new Nocturne ("shop.jpg", "dream0.mp3", "I dreamed that I was lost in the winding streets of a strange city and couldn't find anyone to ask for directions. I wandered for a long time until I finally came across a small curio shop. The store was dimly lit and the shelves were stuffed with cheap trinkets, although a small dagger styled to look like a squid caught my eye. It cost almost nothing, so I bought it. As I walked out of the shop I remembered that I\x27d forgotten to ask for directions, but when I turned around to go back in, there was nothing behind me.",
	"The dream was so I vivid I half-expected to see the dagger on my desk this morning. Riduculous. I couldn't quite shake the dream. During my morning rounds I saw a leatherbound book with a squid eye drawing on the bookshelf of the officers\x27 ward room. I hadn't consciously noticed it before, but it must've been there. I could take a look at it today", "white");
var dream1 = new Nocturne ("monoliths.jpg", "dream1.mp3", "I was on a mountain path, heading towards something familiar, but not remembering what. The path was incandescent, glowing faintly and I felt a strange sense of anticipation. As I crested the peak, I saw an obelisk, and then a bright flash of green light, and then...",
	"I did not sleep very well last night, and some of the others look tired as well. I expect it will take a few days for all of us to readjust.", "white");
var dream2 = new Nocturne ("submerged.jpg", "dream2.mp3", "I saw rock formations that looked like columns. I had a sensation of not walking, but floating, being rushed forward, then realized I was underwater and caught in a current, drowning. It suddenly occurred to me that those were not rock formations at all, but buildings...", "I had an unusual dream about a sunken city, but at least I got a decent night's rest.", "white");
var dream3 = new Nocturne ("visit.jpg", "dream3.mp3", "There was an impossibly massive, unidentifiable thing looming over the landscape, rumbling forward slowly. It was like a living tidal wave but made of eyes and glistening tendrils and mouths. Horrible. When I looked at it I was filled with dread and tried to hide, but there was no cover to be found anywhere. The creature looked in my direction but if it saw me, it gave no acknowledgement. Even with it evidentally ignoring me, I felt a  feeling beyond fear, a feeling of my mind being disintegrated, being drained away, overwhelmed by something beyond... ", "I've been having strange dreams for a few days, but should I tell anyone about them?", "white");
var dream4 = new Nocturne ("last.jpg", "dream4.mp3", "A glass room with no doors, men in robes dressed in white, and at the center, a bizarre, grotesque creature with the head of a cephalopod . It opened its mouths, (yes, mouths!) wide and made noises like nothing of this world, while all the others at the table bowed their heads. Everything around them began to bend and warp as it raised its hand. I felt tremendous pressure on my eyes...", "I awoke to find flecks of blood on my pillow. I do not feel well, but I am fine, I can continue with the mission. I must continue with the mission.", "black");
var dream5 = new Nocturne ("roaming.jpg", "dream5.mp3", "Ph\x27nglui mglw\x27nafh Cthulhu R\x27lyeh wgah'nagl fhtagn. Cthulhu R\x27lyeh wgah'nagl fhtagn. Ph\x27nglui mglw\x27nafh Cthulhu R\x27lyeh wgah'nagl fhtagn!", "All will be wiped away by the absent-minded musings of the dead gods.", "white");
var dream6 = new Nocturne ("spire.jpg", "dream6.mp3", "There is nothing to be done, it has already, already happened, before the first humans, after the last. My eyes, my eyes, my eyes... Sw\x27vewith, myest-esth crowol R\x27lyeh fhtagn", "All must return to the Deeps. All must return, all and more...", "black");

//Dream Array
var allDreams =[dream0, dream1, dream2, dream3, dream4, dream5, dream6];
//dream test function, random

var currentDream = function(){
	return allDreams[dreamCount];
};

//Stat constructor (note, pushes into statArray automatically)
var StatDefine = function(name, dispName, startVal, percent, arr) {
 	var that = this;
 	var per = "";
 	if (percent){
 		per = "%";
 	}
	this.name = name;
	this.dispName = dispName;
	this.curVal = startVal;
	that.setDisp = function(){
		var $alreadyExists = $("." + this.name);
		if($alreadyExists){
			$alreadyExists.remove()
		};
		$('<li>')
   			.attr("class", name)
    		.addClass("stat")
    		.text(this.dispName +": " + this.curVal + per)
    		.appendTo('.stats');
    };
    that.setDisp();
    arr.push(this);
};

//1.5a stats created from constructor
var morale = new StatDefine("morale", "Crew Morale", 90, false, statArray);
var oxygen = new StatDefine("oxygen", "Oxygen Generator Efficency", 100, true, statArray);
var engine = new StatDefine ("engine", "Engine Efficency", 90, true, statArray);
var depth = new StatDefine("depth", "Current Depth In Feet", 200, false, statArray);
var miles =  new StatDefine("miles", "Miles to Destination", 1000, false, statArray);
//1.5b stat-likes, non-displayed
var baseSpeed = 300;


// Button constructor function and display functions
//pre-defined div with class "mainopts", pre-defined div with class "subopts"

function ButAct (butDom, butDesc, resultDesc, shortDesc, butFunc, subOpts){
	this.butDom = butDom;
	this.butDesc = butDesc;
	this.resultDesc = resultDesc;
	this.shortDesc = shortDesc;
	this.butFunc = butFunc;
	this.subOpts = subOpts;
}


function butDisplay(action, $selector){
	var i;
	var $button = $('<button>').text(action.butDesc).addClass("btn-primary");
	$button.appendTo($selector);

	$button.on("click", function(e){	//Now that the button's been made and attached, add click event
		$('<p></p>').text(action.resultDesc).appendTo('.desc');
		$('.desc').removeAttr('open');
		$('.stats').removeAttr('open');
		$('.shortdesc').text(action.shortDesc);
		action.butFunc();
	  	var $target = $(e.target);
	  	$target.addClass("inactive");
	  	$target.siblings().addClass("invisible");
	  	if (action.subOpts){
	  		if (action.subOpts[0] === "endgame"){
	  			actionCount = 10;
	  			actionCounter()
	  			return $('.suboptions').empty();
	  		}
	  		if (action.subOpts[0] === "last"){
	  			$('.mainoptions > button').removeClass("invisible");
	  			actionCounter();
				return $('.suboptions').empty();
				}
	  		for (i = 0; i < action.subOpts.length; i++){
	  			butDisplay(action.subOpts[i], $('.suboptions'));	//recursive for suboptions
	  		}
		}
	});
}

// 1.7 Officer Constructor function
function Officer(name, loyVal, saneVal){
	this.name = name;
	this.loyVal = loyVal;
	this.saneVal = saneVal;
	this.friend = false;
	this.foe = false;
	    Object.defineProperties(this, {
          loy: {
             "get": function() {
				 return this.loyVal;
			 },
             "set": function(newVal) {
				  this.loyVal = newVal;
				 	  	  if(this.loyVal <= -5){
		 					this.mutineer = true;
		 					// console.log(this.name + " is plotting a mutiny!");
						  }
              },
		  },
	      sane: {
             "get": function() {
				 return this.saneVal;
			 },
             "set": function(newVal) {
				  this.saneVal = newVal;
				 	  	  if(this.saneVal <= -5){
				 	  	  	this.insane = true;
		 					// console.log(this.name + " is a madman, a madman!");
						  }
              },
		  }
		});
}

// 1.7a  officer variables loyalty [1], sanity[2]
var scopes = new Officer("Scopes", 0, 0);
var robbins = new Officer("Robbins", -1, 1);
var marlowe = new Officer("Marlowe", 0, 0);
var officerArray = [scopes, robbins, marlowe];

//1.7b officer lemmas and iterator
function officerChange(officer, stat, amount){
	var oldAmount = officer[stat];
	var newAmount = officer[stat] += amount;
	if(oldAmount < newAmount && stat === "loy" && officer[stat] > 4 && officer.friend === false){
		officer.friend = true;
		$('<p>').text(officer.name + " and I have a real connection that goes beyond duty. I feel sure that I can trust him no matter what.").appendTo('.shortdesc');
	}
	if (oldAmount > newAmount && stat === "loy" && officer[stat] < -2 && officer.foe === false){
		officer.foe = true;
		$('<p>').text(officer.name + " seems to have become less confident in my ability to lead.").appendTo('.shortdesc');
		$('<p>').text(officer.name + " has been brusque with me several times and is sometimes slow to carry out orders.").appendTo("." + officer.name.toLowerCase());
	}
}

function arrModify(arr, stat, amount, lemma){
	arr.forEach(function (element) {
		lemma(element, stat, amount);
	});
}

//general arcs, non-arcs
var inspection0A = new ButAct ("inspection0A", "The ship stores", "I inspected the ship stores.", "Looks like everything's here... and also some additional equipment that wasn't listed on the manifest. I can ask Robbins about it sometime, but it's probably just an oversight.",
	function(){
		dossierManage("medusa", "The Medusa has recently taken on equipment for underwater excavation and seismological measurement, but it looks like we have than is listed on the manifest. None of it appears to be illicit, and nothing that's on the manifest is missing.")
	}, ["last"]
);

var inspection0B = new ButAct ("inspection0B", "The crew quarters", "I did a full headcount and inspection of the crew quarters. Everything appears to be to standard.", "All of the crew who were sleeping had to be woken up for the inspection."
	+ " It caused some grumbling, but combat readiness is important, even on a mission like this.",
	 function(){
		statChange(morale, "-", 10);
	}, ["last"]
);

var inspection0 = new ButAct("inspection0", "Do a surprise inspection", "I decided to conduct a surprise inspection.", "Which part of the ship?",
	function(){
	},[inspection0A, inspection0B]
);

var pressure = new ButAct ("pressure", "Lose core pressure", "We're losing core pressure! Oxygen has decreased, somehow!", "CORE PRESSURE",
	function(){
		statChange(oxygen, "-", 20);
	}, ["last"]
);

//engine arc, reactor arc, oxygen arc
var engineMod0A = new ButAct ("engineMod01", "Permission denied.", "I told him our engine efficency is more than adequate for the current mission, no need to take risks.",
	"Our engine efficency is more than adequate for the current mission, no need to take risks.",
	function(){
		officerChange(robbins, "loy", -1)
	}, ["last"]
);

var engineMod0B = new ButAct ("engineMod02", "Permission granted.", "I granted Robbins permission to make the modification on the main system.",
	"Robbins is an excellent engineer and would never have asked if he didn't think it was safe.",
	function(){
		officerChange(robbins, "loy", 1)
		statChange(engine, "+", 5);
	}, ["last"]
);
var engineMod0 = new ButAct ("engineMod0", "Meet with the Chief Engineer", "Robbins seemed to be annoyed by presence, but he was willing to show me a retrofitting he'd done in port that could increase engine efficency."
	+ " Right now the modification is only on the backup pumps, but he asked for my permission to use it on the primary pump system as well.", "Chief Engineer Robbins showed me a modification he made to the backup system"
	+ " that could improve engine efficency. He wants my permision to implement it on the primary pump system.",
	function(){
	}, [engineMod0A, engineMod0B]
);

var oxygenProb0A = new ButAct ("oxygenProb0A", "Divert some engine power to the oxygen generator.", "Our oxygen generator was using an unanticipated"
	+ " amount of power, so I diverted some power from the engine to the oxygen, just to be safe.",
	"Robbins strongly disagreed with my decision, but safety is my top priority and we're still making excellent time.",
	function(){
		statChange(engine, "*", .75);
		officerChange(robbins, "loy", -1);
	}, ["last"]
);

var oxygenProb0B = new ButAct ("oxygenProb0B", "Take no action.", "Our oxygen generator was using an unanticipated"
	+ " amount of power and is operating at reduced efficency, but will be fine for the duration of our mission.", "If the oxygen generator has further issues I may reconsider, but for now it's fine.",
	function(){
		statChange(oxygen, "-", 20);
	}, ["last"]
);

var oxygenProb0 = new ButAct("oxygenProb0", "Talk to Robbins about the oxygen generator.", "Robbins called me on the ship phone to report a problem.", "Our oxygen generator needs more power than expected to function at maximum efficiency, which is well over what we need. We can pull some power from the engines, or we can can do nothing for now.", function(){}, [oxygenProb0A, oxygenProb0B]
	);

//officerTalk arc
var officerTalk0 = new ButAct ("officertalk", "Have an informal chat with the First Officer", "First Officer Marlowe was very pleasant company. He reports that the men are excited about the mission"
	+ " and are confident in the ship.",
	"First Officer Marlowe and I had a pleasant conversation. I conveyed to him how pleased I am with the crew's capability and he told me that the recent shore leave was greatly appreciated by the men.",
	function(){
		officerChange(marlowe, "loy", 1);
		statChange(morale, "+", 5);
	}, ["last"]
);

//read arc
var read0 = new ButAct ("read0", "Read the leatherbound book", "I spent about about a half hour carefully considering the book. Other than the squid eye on the spine it has no markings. It appears to be divided into four sections."
	+ " Two of the sections are written in a strange runic script interspersed with illustrations of sea creatures, and the other two written in what looks to be greek. Science Office Scopes speaks several langauges, I can ask him about it tomorrow.",
	"I tried to read the leatherbound book with the squid eye mark but didn't get past the illustrations. It was written in two different languages: greek, and some alphabet I didn't recognize. Science Officer Scopes speaks several langauges, I can ask him about it tomorrow.",
	function(){
		saneCount--;
	}, ["last"]
);

var read1A = new ButAct ("read1A", "The section with the sea creature illustrations", "I asked Scopes to start translating the chapter with the sea creature illustrations.", "Scopes said he expects to have something to show me by tomorrow, as he does not have much to occupy his time until we reach the area of the anomaly.",
	function(){
		officerChange(scopes, "saneVal", -1);
	}, ["last"]
);
var read1B = new ButAct ("read1B", "The section with the greek and runic lists", "I asked Scopes to start translating the mixed greek and runic lists at the end of the second section.", "Scopes said he expects to have something to show me by tomorrow, as he does not have much to occupy his time until we reach the area of the anomaly.",
	function(){
		officerChange(scopes, "saneVal", -1);
	}, ["last"]
);

var read1 = new ButAct("read1", "Discuss the book with Scopes", "Scopes confirmed the first half of the leatherbound book is written in greek but couldn't identify what language the second half was written in."
	+ " but.", "Scopes said he hadn't seen the leathbound book before. He confirmed that the first two sections are greek, but he couldn't identify what language the second half was written in. He offered to try his hand at translating it, but asked me to pick the section he should start with.",
	function(){
	}, [read1A, read1B]
);

var read2A = new ButAct ("read2A", "chant with him", "He even taught me a chant, which was oddly lyrical, despite being guttural and clipped. I think I'll say it regularly, it was oddly calming.", "I chanted with him for a few minutes: \x27Ph\x27nglui mglw\x27nafh Cthulhu R\x27lyeh wgah'nagl fhtagn. Cthulhu R\x27lyeh wgah'nagl fhtagn\x27. Somehow I felt relieved after we'd finished, almost catatonic.",
	function(){
		actionCount = 10;
		officerChange(scopes, "sane", -2);
		officerChange(scopes, "loy", 2);
	}, ["last"]
);

var read2B = new ButAct ("read2B", "just listen", "He even learned a chant, which was oddly lyrical, despite being guttural and clipped.", "I listened to him chant and I found it soothing and hypnotic, but I suddenly felt the urge to scream and excused myself instead. I was shaking and nearly passed out on the way back to my room.",
	function(){
		actionCount = 10;
		officerChange(scopes, "sane", -1);
		officerChange(scopes, "loy", -1);
	}, ["last"]
);

var read2 = new ButAct ("read2", "Check in with Scopes", "I was interested to see what progress Scopes had made on the translation, and he had made quite a lot.", "Scopes had dark circles under his eyes but had managed to translate not only the greek but a phonetic version of the rune alphabet. He said it was all in slant rhyme verses that were almost like hymns. He demonstrated a chant out loud, and I felt a sudden impuse to join him.",function(){
	officerChange(scopes, "saneVal", -1);
	}, [read2A, read2B]
);


var descend0 = new ButAct ("descend0", "Begin the descent", "Our target depth is 1800 feet and we'll reach it with a controlled descent.", "The increased pressure is putting stress on our systems, but none of our readings are outside of acceptable ranges.",
	function(){
		$('.mainoptions > button').removeClass('inactive');
		// console.log("descend0 was called");
		statChange(depth, "+", 400);
		statChange(oxygen, "-", 20);
		statChange(engine, "/", 2);
		// console.log(depth.curVal);
	}, ["last"]
);

var descend1 = new ButAct ("descend1", "Descend all the way to the bottom", "I descended futher, further, further.", "I have locked myself in the command center, and disabled all steering. This is the way our world ends. I'm getting sleepy, this can't continue.",
	function(){
		oceanBottom = true;
		statChange(depth, "+", 3000);
		actionCount = 10;
		actionCounter();
	}, ["endgame"]
);

var nightmare0 = new ButAct ("nightmare0", "Talk about my dream with the other officers", "I told the officers about my dream, and " + returnLeast(officerArray, "saneVal")[0].name + " had the exact same dream, but the other two seemed very disturbed by our conversation." , "I mentioned to the officers that I'd had a really bizarre dream, and described it in some detail."
	+ " To my surprise " + returnLeast(officerArray, "saneVal")[0].name + " said he had the exact same dream. We couldn't help discussing it, and all of the details matched. It can't be a coincidence, but I don't know what it means.",
	function(){
		statChange(morale, "-", 5);
		officerChange(officerArray[officerArray.length-1], "loy", -2);
		officerChange(officerArray[officerArray.length-2], "loy", -2);
		officerChange(officerArray[0], "loy", 2);
	}, ["last"]
);

var nightmare1 = new ButAct ("nightmare1", "Put " + returnLeast(officerArray, "loyVal")[0].name + " in the brig for plotting a mutiny against me.", "I know what he's planning, I know what they're all planning.", "Nothing can stop it, nothing.",
	function(){
		statChange(morale, "-", 20);
	}, ["last"]
);


// Turn rules
function dayUpdate(){
	$('.currentstatus').text(function(){
		return "Day " + day + ", Status:";
	});
}

function turnRules(){
	day++;
	if (day > 2) {
		arrModify(officerArray, "sane", -1, officerChange);
		officerChange(officerArray[randomizer(0, officerArray.length-1)], "sane", -1);
	}
	subVal.speed();
	subVal.morale(officerArray, "loyVal");
	dayUpdate();
}



//2.2 Action Counter (checks to see if over limit, cretes sleep button, enters dream when clicked)
function actionCounter(){
	actionCount++;
		// console.log("action count: " + actionCount);
	if (actionCount >= actionMax){
		$('.mainoptions button').addClass('inactive');
		var $needSleep = $('<p>').text("I'm too tired to do anything else today.");
		$needSleep.appendTo('.shortdesc');
		actionCount = 0;
		$('<button>')
   		.addClass("nextturn btn-primary")
    	.text("Go to sleep")
    	.appendTo('.mainoptions');
    	$(".nextturn").on("click", debounce(
    		function(){
    			$(".nextturn").remove();
    			dreamEnter(currentDream());
    		}, 750)
    	);
	}
}

//2.3 dreamEnter function (makes everything invisible except the background image for dream)
function dreamEnter (todream){
	toCaptainLog();
	$("*").toggleClass('inactive');
	$('html').toggleClass('inactive');
	$('html').hide().toggleClass('full').fadeIn(5000);
	$('html').css("background", "url(" + "images/" + todream.imgS + ")" + "no-repeat center fixed");
	$('html').css("background-size", "cover");
	$(".btn-primary").remove();
	// console.log("first remove");
	dreamDisplay(todream);
}

//2.4 dreamDisplay function (disp/appends image, audio, text, goes to dreamLeaver, no click events)
function dreamDisplay (adream) {
	var $dreamAud = null;
	var $dreamtext = null;
	if($('html').hasClass('full') === true){
		$dreamtext = $('<p></p>').addClass("dreamtext");
		$dreamtext.text(adream.dreamDesc);
		$dreamtext.css("color", adream.textColor);
		$dreamtext.insertBefore('body');
		//butDisplay(engineMod0, $('body'));  //does not quite work, but also doesn't fail. Better to put in  dreamleaver
		$dreamAud = $('<audio src=' + 'audio/' + adream.audS + ' autoplay>' + '</audio>');
		$dreamAud.appendTo('html');
		dreamLeaver(adream);
	}
}

//2.5 Called at end of dreamDisplay to leave dream, return pre-dream elements to visible, update
function dreamLeaver(dreamed){
	$('html').one("click", debounce( function(){
		$(".btn-primary").remove();
		// console.log("second remove");
		$('.dreamtext').remove();
		$('html').toggleClass('full');
		$("*").toggleClass('inactive');
		$('html').toggleClass('inactive');
		$('.shortdesc').text(dreamed.nextDayDesc); //clears the shortDesc from previous day
		$('.nextturn').toggle();
        updater(statArray, turnRules);
        $('.stats').removeAttr('open');
         $('.desc').removeAttr('open');
         $('audio').remove();
         if(oceanBottom){
         	// console.log("it's finished")
         	return gameFinish();
         }
         dreamCount++;//will advance to next dream in story;
		sceneSet(scenesArray[dreamCount]);
	}, 750));
}



var scenesArray =[
[ inspection0, officerTalk0],
[read0, oxygenProb0],
[engineMod0, read1],
[read2],
[nightmare0, nightmare1],
[nightmare0, descend0],
[descend1]
]

//subVal object calculates speed and morale effects
var subVal = {
	speed: function(){
		statChange(miles, "-", (engine.curVal * baseSpeed) / 100);
		if (miles.curVal <= 0){
			miles.curVal = 0;
			destinationReached = true;
		}
	},
	morale: function(arr, stat){
		var moraleEffect = [];
		arr.forEach(function(element, index, array){
			moraleEffect.push(element[stat]);
		})
		// console.log(moraleEffect);
		moraleEffect = moraleEffect.reduce(
		  	function(previousValue, currentValue) {
  				return previousValue + currentValue
  			})
		  statChange(morale, "+", moraleEffect);
	}
};

//Data and UI display function, New Game form display and submit function
function dossierInit(){
dossierManage("captain", "This is my first ship command and I don't intend for it to be my last. I've only been captain for a month,"
+ " but with an experienced crew and good officers I'm certain we won't run into any issues we can't handle.")
dossierManage("medusa", "The USS Medusa is the first of the next generation of nuclear submarines on its first official mission. She has"
+ " a skeleton crew of thirty sailors and four officers, including myself. The estimated duration of this mission is just under two weeks,"
+ " after which we'll rendezvous with the USS Henley near the coast of Corvo Island and take on a full crew.")
dossierManage("robbins", "Chief Engineer Robbins has been with the ship since it was comissioned, but has been reluctant"
+ " to discuss anything with me that's not directly related to his role. His personal record is good, except for a drunken incident that occurred almost ten years ago.")
dossierManage("scopes", " Science Officer Scopes joined us right before we left the Naples Naval Support Base. His personnel record says he's"
+ " served in the Naval Meteorology and Oceanography Command since its creation, but he doesn't seem to have much real military experience, if any.")
dossierManage("marlowe", "First Officer Marlowe is a highly capable and well-liked officer who knows how to gain the loyalty of a crew."
+ " His personnel record is exemplary, and in the short time we've worked together I've learned to trust his judgement.")
}


//New game button form display and form submit functions
function formDisplay(){
	$('.nav').addClass("inactive");
	$('.newgame').addClass("inactive invisible");
	$('.guide').addClass("inactive invisible");
	$('.formdiv').removeClass("invisible");
	$("form input:text")[0].value = localStorage.getItem("sunkCache");
	$('.captain summary').text("Captain " + localStorage.getItem("sunkCache"));
}
function formSubmitNewGame(e){
	e.preventDefault();
	$input = $("form input:text");
	cptName = ($input[0].value);
	$('.namediv').addClass('invisible inactive');
	$('.captain summary').text("Captain " + cptName);
	localStorage.setItem("sunkCache", cptName);
	location.reload();
}

// function returned on game end
function gameFinish(){
	$('.shortdesc').text("Silence and darkness, at last. R\x27lyeh wgah'nagl fhtagn. Start a new game in the options menu, or hit refresh.")
		$('.mainOptions').addClass("inactive");
		return;
}

//controls sub images and opening/closing of details tags
function  subHalvesDisp () {
	$('.sub1').on(
		"mouseover", debounce (function (){ $('.sub1').addClass('currentimg');
			if ($('.sub2').hasClass('currentimg')){
					$('.sub2').removeClass('currentimg');
					$('.desc').removeAttr('open');
					$('.stats').attr('open', '');
			}
		}, 100)
	);

	$('.sub2').on(
		"mouseover", debounce (function (){ $('.sub2').addClass('currentimg');
			if ($('.sub1').hasClass('currentimg')){
					$('.sub1').removeClass('currentimg');
					$('.stats').removeAttr('open');
					$('.desc').attr('open', '');
			}
		}, 100)
	);
}

//local storage of captains name, new game created by reload
function cptNameSet(){
	if (localStorage.getItem("sunkCache") === null || localStorage.getItem("sunkCache") === undefined || localStorage.getItem("sunkCache") ===  ""){
			localStorage.setItem("sunkCache", "James W. Harvey");
			// console.log("Couldn't find, setting to default " + localStorage.getItem("sunkCache"))
	}
	var cachedName = localStorage.getItem("sunkCache")
	// console.log("Found, is " + cachedName);
			$("form input:text")[0].value = cachedName;
			$('.captain summary').text("Captain " + cachedName);
			$('.playerlog').text("The Logbook of " + cachedName + ", Captain of the USS Medusa");
}

//Functions that add explicit HTML tags to the DOM
function dossierManage(domClass, toAdd){
	$('<p>').text(toAdd).appendTo('.' + domClass);
}

function toCaptainLog() {
	$("<div>").addClass("day" + day).text("Day " + day + ":").appendTo(".playerlog");
	$( ".desc" ).contents().filter("p").appendTo("div." + "day" + day);
}

function init(){
	cptNameSet();
	subHalvesDisp();
	dossierInit();
	dayUpdate();
	updater(statArray, null);
	sceneSet(scenesArray[dreamCount], "We left the Naples Naval Support Base this morning and we'll be past the Strait of Gibraltar by tomorrow. Our mission is to investigate an area in the middle of the Atlantic"
	+ " where seismologists have detected some unusual readings, gather whatever data we can, then head towards the Azores for rendezvous.",
	"I completed all my duties and now there's time to do a few things this evening.");
	// console.log(scenesArray[dreamCount]);
}
init();
//butDisplay(descend0, $('.mainoptions'))
}); //document ready end