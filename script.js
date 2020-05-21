///////////////////////////
//
//  Meta:
//  https://stackoverflow.com/questions/6856953/does-it-make-sense-to-create-canvas-based-ui-components
//  On why to not use canvas and why it's a good idea for diagrams
//  Problems I have with this: What about UI components on Diagrams? Interactive Buttons, images, copyable text etc...
//
///////////////////////////

// 
// with rising complexity I find myself having an issue
// if I look at GoJS https://gojs.net/latest/index.html
// I find that they have a model-view design pattern for diagrams
// the more stuff I draw the more I can relate to this choice
// What if I suddendly want the nodes to have hover properties
// This would be an awful code change
// On the other hand changing to gojs is a lot of work as well
// it does cost something and even though there is support for custom layouts
// one would have to build the layout, should my abstraction be good enough it might be an easy change
// but the more I work on this version the tougher the choice, since I invested quite something into this
// this could be a bias though, that is, the sunk cost fallacy
// Update 28.11.2019, using SVG Graphics or React JS could also be an interesting path to follow
// Update 05.12.2019 a few weeks ago we decided to keep using canvas

var canvas;
var ctx;

var colors = ["#a8e6cf", "#dcedc1", "#ffd3b6", "#ffaaa5", "#ff8b94", "#ff8b94"];
var cappuccino = ["#4b3832", "#854442", " #fff4e6", "#3c2f2f", "#be9b7b", "#be9b7b"];
var beach = ["#96ceb4", "#ffeead", "#ff6f69", "#ffcc5c", "#ff6f69", "#ffcc5c"];
var rainbow = ["#ee4035", "#f37736", "#fdf498", "#7bc043", "#0392cf", "#7bc043"];
var names = ["Notiz","Werk","Autor","Schlagwort","Reihen","Klassifikation"];

colors = beach; // TODO not all colors are working, with LightenDarkenColor I suppose

var objectToFreeze = {};
for (i = 0; i < names.length; i++) {
    objectToFreeze[names[i]] = {
        StrongColor: LightenDarkenColor(colors[i], -100),
        MediumColor: LightenDarkenColor(colors[i], -50),
        GradientStartColor: LightenDarkenColor(colors[i], 10),
        GradientEndColor: LightenDarkenColor(colors[i], -10),
        Name: names[i]
    }
}
var NoteType = Object.freeze(objectToFreeze);




var NoteState = Object.freeze({
    "Visible": 1,
    "Collapsed": 2,
    "Hidden": 3 // At this point I'm not convinced this state is necessary TODO: check if it is
});

var ButtonState = Object.freeze({
    "Normal": 1,
    "Hovered": 2,
    "Clicked": 3
});

async function loadimages() { // Some super strange hack to make images appear immediately. Wooow ^^ that was a pain in the ass. So basically images can only be drawn when they are loaded, so loadimages is redrawing as soon as onload is triggered, the weird part is, that sleep still needs to be called with some value before images get drawn, one could probably just put a sleep before drawing or something ^^ Maybe there is a way with Promises (well sleep is a promise too, but I don't understand promises)
    await sleep(10);
    //draw(); // TODO since we're animating the start, the images will pop in roughly in time when loading. Problem is this thing interferes with the startup animation. Good thing is it buys us time to load images. It's a tradeof. I'll go with this being useless.
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



function setup(tree,params) {

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.config = params;


    //canvas.addEventListener("dblclick", handleDblClick, false);  // dblclick to zoom in at point, shift dblclick to zoom out.
    canvas.addEventListener("mousedown", handleMouseDown, false); // click and hold to pan
    canvas.addEventListener("mousemove", handleMouseMove, false);
    canvas.addEventListener("mouseup", handleMouseUp, false);
    canvas.addEventListener("mousewheel", handleMouseWheel, false); // mousewheel duplicates dblclick function
    canvas.addEventListener("DOMMouseScroll", handleMouseWheel, false); // for Firefox
    canvas.addEventListener("mouseenter", disableScrolling, false);
    canvas.addEventListener("mouseleave", enableScrolling, false);
    canvas.addEventListener("click", handleMouseClick, false);



    return init(tree); 
    
}

function loadParams() {
    // TODO update values in html or wherever in order to change params actually
    canvas.width = canvas.config.widthViewOriginal;
    canvas.height = canvas.config.heightViewOriginal;
}

var Layouts = Object.freeze({
    "Symmetric": 1,
    "Arc": 2,
});


function init(tree) {
    ////////////////////////////////////
    //
    // Idea: 
    // At first we load the tree, that is the graph
    // Then we load parameters for drawing
    // PositionState (state variable) manages rotation and zIndex offsets and we init them to a default setting.
    // positioning_information creates the fixed spatial layout of the graph
    // positionTree takes the positioning_information and applies the state (PositionState) to it in order to allow user input to change the view of the graph
    //
    ////////////////////////////////////


    canvas.tree = getTree(tree);
    setUpImageCallback();
    loadParams();
    canvas.state = new PositionState();
    canvas.positioning_information = new PositionInformation(canvas.tree);
    canvas.positioning_information.initialTree();
    
    
    canvas.state.animateRotation();
    return canvas;
}

function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(canvas.config.widthCanvas / canvas.config.widthView, canvas.config.heightCanvas / canvas.config.heightView);
    ctx.translate(-canvas.config.xleftView, -canvas.config.ytopView);
    
    
    ctx.fillStyle = "white";
	//Appears to clean the view
    // TODO text clearRect to clear the view ^^
    ctx.fillRect(canvas.config.xleftView, canvas.config.ytopView, canvas.config.widthView, canvas.config.heightView);
	
	//Looks like here comes the drawing part
    notesPlusButtons = [];
    notesInformationButtons = [];
    drawTree(canvas.tree);
}

var buttons = []; // TODO create Objects for these Arrays
var notesInformationButtons = [];
var notesPlusButtons = [];

function drawTree(tree) {
    var sortedByZIndex = Array.prototype.slice.call(tree).sort(compareByzIndex);
    for (var i = 0; i < sortedByZIndex.length; i++) {
        sortedByZIndex[i].drawConnector();
    }
    for (var i = 0; i < sortedByZIndex.length; i++) {
        sortedByZIndex[i].draw();
    }
    drawButtons();
}

function compareByzIndex(a, b) {
    if (a.zIndex < b.zIndex) {
        return -1;
    } else if (a.zIndex > b.zIndex) {
        return 1;
    }
    return 0;
}



function zIndexFromIndex(index, n) {
    n -= 1;
    maximumzIndex = Math.ceil(n / 2);
    maximumzIndexIndex = Math.ceil(n / 2);
    return  maximumzIndex - Math.abs(index - maximumzIndexIndex);
}


var example_tree = [
    {
        Titel: "Bekenntnisse eines jungen Schriftstellers",
        Autor: "Eco, Umberto",
        Jahr: "2019",
        Medientyp: "E-Book",
        Typ: NoteType.Autor,
        Bild: "http://netbiblio.tg.ch/repository/frau-kb/covers/Cover473872_SmallView.jpg"
    },
    {
        Titel: "Pape Satàn : Chroniken einer flüssigen Gesellschaft, oder, Die Kunst, die Welt zu verstehen",
        Autor: "Eco, Umberto",
        Jahr: "2017",
        Medientyp: "Buch/Sachmedium",
        Typ: NoteType.Klassifikation,
        Bild: "https://images-eu.ssl-images-amazon.com/images/I/51c7WyNd8gL.03._SY75_.jpg",
    },
    {
        Titel: "Nullnummer : Roman",
        Autor: "Eco, Umberto",
        Jahr: "2015",
        Medientyp: "Buch/Belletristik",
        Typ: NoteType.Notiz,
        Bild: "http://netbiblio.tg.ch/repository/frau-kb/covers/Cover351756_SmallView.jpg",
    },
    {
        Titel: "Sind wir alle verrückt?",
        Autor: "Eco, Umberto",
        Jahr: "2015",
        Medientyp: "E-Book",
        Typ: NoteType.Autor,
        Bild: "http://netbiblio.tg.ch/repository/frau-kb/covers/Cover348382_SmallView.jpg",
    },
    {
        Titel: "E-Book-Reader : Tolino Vision",
        Autor: "-",
        Jahr: "2014",
        Medientyp: "E-Reader",
        Typ: NoteType.Reihen,
        Bild: null,
    },
    {
        Titel: "Istanbul, Hauptstadt der Welt",
        Autor: "De Amicis, Edmondo",
        Jahr: "2014",
        Medientyp: "Buch/Sachmedium",
        Typ: NoteType.Klassifikation,
        Bild: "https://images-eu.ssl-images-amazon.com/images/I/51BSfmOX5AL.03._SY75_.jpg",
    },
    {
        Titel: "Die Fabrikation des Feindes und andere Gelegenheitsschriften",
        Autor: "Eco, Umberto",
        Jahr: "2014",
        Medientyp: "Buch/Belletristik",
        Typ: NoteType.Notiz,
        Bild: "https://images-eu.ssl-images-amazon.com/images/I/41eCjsKNLzL.03._SY75_.jpg",
    },
    {
        Titel: "Geschichten für aufgeweckte Kinder",
        Autor: "Eco, Umberto",
        Jahr: "2012",
        Medientyp: "Buch/Belletristik",
        Typ: NoteType.Notiz,
        Bild: "https://images-eu.ssl-images-amazon.com/images/I/51HKGLoPWqL.03._SY75_.jpg",
        //Bild: "https://images-eu.ssl-images-amazon.com/images/I/51HKGLoPWqL.03._SY75_.jpgrr",
    },
];

function createTreeOfSize(n) {
    if (n == example_tree.length-1) {
        return example_tree;
    }
    var tree = [];
    for (i = 0; i <= n; i++) {
        tree.push(example_tree[Math.floor(Math.random() * example_tree.length)]);
    }
    return tree;
}


var totalImages = 0;
var loadedImages = 0;

function setUpImageCallback() {
    for (var i = 0; i < canvas.tree.length; i++) {
        if (canvas.tree[i].content.Bild != null) {
            canvas.tree[i].content.BildObjekt.onload = loadimages();
        }
    }
}


function getTree(givenTree) {
    //////////////////////////////
    //
    //  this should later on generalize, that is, it should be given a graph from a REST-WEB service (or similar) and not create a graph from scratch
    //
    //////////////////////////////
    
    // NOTE do preprocessing for images, what the hell did I mean by that? Making sure that size is ok?
    // I think this doesn't really matter anymore. Maybe one could remove the image creation here and move it to the drawing part
    // The image rendering was messy anyway so I guess it's ok to leave it like that for now, especially because it is working right now.
    for (var i = 0; i < givenTree.length; i++) {
        if (givenTree[i].Bild != null) {
            var image = document.createElement("img");
            image.src = givenTree[i].Bild;
            image.id = "image" + i;
            document.getElementById("images").appendChild(image);
            givenTree[i].BildID = "image" + i;
            givenTree[i].BildObjekt = image;
            totalImages += 1;
        }
    }
    notes = [];
    notes.push(new Note(0, null, null,0,-1,givenTree[0]));

    for (var i = 1; i < givenTree.length; i++) {
        notes.push(new Note(i, 0, notes[0], 1, i-1, givenTree[i]));
        notes[0].children.push(i);
        // WARNING this now disables third level children
    }
    return notes;
}






