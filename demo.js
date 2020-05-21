
window.addEventListener("load", load, false);

var symmetric_layout_params = { // TODO which params do we actually need?
    widthCanvas: 1000,
    heightCanvas: 850,

    chosen_layout: Layouts.Symmetric,

    noteHeight : 200,
    noteWidth : 300,
    collapsedNoteHeight : 80,
    collapsedNoteWidth : 300,
    distance : 340,

    buttonWidth : 90,
    buttonHeight : 60,


    //// View parameters
    widthViewOriginal : 1000,           //actual width and height of zoomed and panned displa,
    heightViewOriginal : 850,
    xleftView : -1000 / 2,
    ytopView : -850 / 2,
    widthView : 1000,           //actual width and height of zoomed and panned displa,
    heightView : 850,

    animation_speed : 10,
    animation_step : 0.015,



    chosen_layout : Layouts.Symmetric,


    //// Positioning Parameters
    base_angle : 1 / 3 * Math.PI

};

var arc_layout_params = { // TODO which params do we actually need?
    widthCanvas: 700,
    heightCanvas: 1100,

    chosen_layout: Layouts.Symmetric,

    noteHeight: 200,
    noteWidth: 300,
    collapsedNoteHeight: 80,
    collapsedNoteWidth: 300,
    distance: 340,

    buttonWidth: 90,
    buttonHeight: 60,


    //// View parameters
    widthViewOriginal: 700,           //actual width and height of zoomed and panned displa,
    heightViewOriginal: 1100,
    xleftView: -700/4,
    ytopView: -1100 * 17 / 54 ,
    widthView: 700,           //actual width and height of zoomed and panned displa,
    heightView: 1100,

    animation_speed: 10,
    animation_step: 0.015,



    chosen_layout: Layouts.Arc,


    //// Positioning Parameters
    base_angle: 1 / 3 * Math.PI

};

var LayoutSource = Object.freeze({
    "Symmetric": 1,
    "Arc": 2,
    "Custom":3,
});

function prepareParams() {
    var layout_source = document.getElementById("layoutSource").value;
    var chosen_params;
    if (layout_source == LayoutSource.Symmetric) {
        chosen_params = symmetric_layout_params;
    } else if (layout_source == LayoutSource.Arc) {
        chosen_params = arc_layout_params;
    } else if (layout_source == LayoutSource.Custom) {
        chosen_params = customParams();
    }
    console.log(customParams(),symmetric_layout_params)
    display_params(chosen_params);
    return chosen_params;
}

function display_params(params) {
    //Set original parameters:
    document.querySelector("#widthViewOriginal").value = params.widthViewOriginal;
    document.querySelector("#heightViewOriginal").value = params.heightViewOriginal;
    document.querySelector("#noteHeight").value = params.noteHeight;
    document.querySelector("#noteWidth").value = params.noteWidth;
    document.querySelector("#collapsedNoteHeight").value = params.collapsedNoteHeight;
    document.querySelector("#collapsedNoteWidth").value = params.collapsedNoteWidth;
    document.querySelector("#distance").value = params.distance;
    document.querySelector("#buttonWidth").value = params.buttonWidth;
    document.querySelector("#buttonHeight").value = params.buttonHeight;
    document.querySelector("#baseAngle").value = params.base_angle;
    document.querySelector("#animationSpeed").value = params.animation_speed;
    document.querySelector("#animationStep").value = params.animation_step;
    document.querySelector("#layout").value = params.chosen_layout;
}

function customParams() {
    var params = {};
    //Width and height parameters
    params.widthViewOriginal = parseInt(document.getElementById("widthViewOriginal").value, 10);
    params.heightViewOriginal = parseInt(document.getElementById("heightViewOriginal").value, 10);
    params.xleftView = -params.widthViewOriginal / 2;
    params.ytopView = -params.heightViewOriginal / 2;
    params.widthView = params.widthViewOriginal;
    params.heightView = params.heightViewOriginal;
    params.widthCanvas = params.widthViewOriginal;
    params.heightCanvas = params.heightViewOriginal;
    //Node parameters
    params.noteHeight = parseInt(document.getElementById("noteHeight").value, 10);
    params.noteWidth = parseInt(document.getElementById("noteWidth").value, 10);
    params.collapsedNoteHeight = parseInt(document.getElementById("collapsedNoteHeight").value, 10);
    params.collapsedNoteWidth = parseInt(document.getElementById("collapsedNoteWidth").value, 10);
    params.distance = parseInt(document.getElementById("distance").value, 10);
    //Button parameters
    params.buttonWidth = parseInt(document.getElementById("buttonWidth").value, 10);
    params.buttonHeight = parseInt(document.getElementById("buttonHeight").value, 10);
    params.base_angle = parseFloat(document.getElementById("baseAngle").value);
    // Animation parameters
    params.animation_speed = parseInt(document.getElementById("animationSpeed").value, 10);
    params.animation_step = parseFloat(document.getElementById("animationStep").value);
    // Layout selecting
    params.chosen_layout = document.getElementById("layout").value;

    if (params.chosen_layout != Layouts.Symmetric && params.chosen_layout != Layouts.Arc) {
        params.chosen_layout = Layouts.Symmetric;
    }
    return params
}


function load() {
    canvas = setup(createTreeOfSize(document.getElementById("second").value),prepareParams());

    canvas.addEventListener("infoButtonClick", infoButtonEventHandler);
    canvas.addEventListener("plusButtonClick", plusButtonEventHandler);

}


function infoButtonEventHandler(e) {
    
    document.getElementById("buttonMessage").innerHTML = "Info Knopf gedrückt auf " +  e.detail.content.Titel
}
function plusButtonEventHandler(e) {

    document.getElementById("buttonMessage").innerHTML = "Plus Knopf gedrückt auf " + e.detail.content.Titel
}