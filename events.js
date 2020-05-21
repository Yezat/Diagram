////////////////////////////////////////////////////////
// Custom Click Event Handlers
////////////////////////////////////////////////////////

async function nextClick() {
    console.log("nextclick");
    canvas.removeEventListener("click", handleMouseClick, false);
    canvas.state.rotationIndexOffset -= 1;
}

async function previousClick() {
    console.log("previousclick");
    canvas.removeEventListener("click", handleMouseClick, false);
    canvas.state.rotationIndexOffset += 1;
}

async function plusClick(bound) {
    console.log("plus clicked on index", bound[3]);
    console.log("plus clicked on angle", canvas.tree[bound[3]].angle)
    var event = new CustomEvent("plusButtonClick", {
        detail: canvas.tree[bound[3]]
    });
    canvas.dispatchEvent(event);
}

async function infoClick(bound) {
    console.log("info clicked on index", bound[3]);
    var event = new CustomEvent("infoButtonClick", {
        detail: canvas.tree[bound[3]]
    });
    canvas.dispatchEvent(event);
}




////////////////////////////////////////////////////////
// Event Handlers
////////////////////////////////////////////////////////

var mouseDown = false;

function handleMouseDown(event) {
    mouseDown = true;
}

function handleMouseUp(event) {
    mouseDown = false;
}

var lastX = 0;
var lastY = 0;
function handleMouseMove(event) {

    // Code for scrolling
    
    var X = event.clientX - this.offsetLeft - this.clientLeft + this.scrollLeft;
    var Y = event.clientY - this.offsetTop - this.clientTop + this.scrollTop;

    if (mouseDown) {
        var dx = (X - lastX) / canvas.config.widthCanvas * canvas.config.widthView;
        var dy = (Y - lastY) / canvas.config.heightCanvas * canvas.config.heightView;
        canvas.config.xleftView -= dx;
        canvas.config.ytopView -= dy;
        draw();
    }
    lastX = X;
    lastY = Y;

    // TODO make this code nicer, it's ugly as hell
    // TODO find a better way to unhover buttons than to redraw on every mouse move
    draw();

    var xy = getDrawingCoordinates(event);
    
    for (i = 0; i < buttons.length; i++) {
        if (isPointInRoundBound(xy[0], xy[1], buttons[i])) {
            clicked_index = i;
            if (buttons[clicked_index][6] == ButtonState.Normal) {
                // We need to redraw the button and make sure it's state gets hovered
                buttons[clicked_index][6] = ButtonState.Hovered;
                drawRoundIconButton(buttons[clicked_index][0], buttons[clicked_index][1], buttons[clicked_index][2], "black","white", buttons[clicked_index][5], true, "black");
            }

        }
    }


    var xy = getDrawingCoordinates(event);
    var clicked_index = null;
    var clicked_zindex = -10000;
    for (i = 0; i < notesInformationButtons.length; i++) {
        if (isPointInRoundBound(xy[0], xy[1], notesInformationButtons[i])) {
            if (canvas.tree[notesInformationButtons[i][3]].zIndex > clicked_zindex) {
                clicked_index = i;
                clicked_zindex = canvas.tree[notesInformationButtons[i][3]].zIndex;
            }
        }
    }
    if (clicked_index != null) {
        // how the button arrays look like TODO make this an object
        //[x - noteWidth * 1 / 5, y + noteHeight * 3 / 10, 18, index, infoClick,icon,ButtonState.Normal]
        if (notesInformationButtons[clicked_index][6] == ButtonState.Normal) {
            // We need to redraw the button and make sure it's state gets hovered
            notesInformationButtons[clicked_index][6] = ButtonState.Hovered;
            drawRoundIconButton(notesInformationButtons[clicked_index][0], notesInformationButtons[clicked_index][1], notesInformationButtons[clicked_index][2], canvas.tree[notesInformationButtons[clicked_index][3]].content.Typ.StrongColor, "white", notesInformationButtons[clicked_index][5], true, canvas.tree[notesInformationButtons[clicked_index][3]].content.Typ.StrongColor);
        }
    }
    var clicked_index = null;
    var clicked_zindex = -10000;
    for (i = 0; i < notesPlusButtons.length; i++) {
        if (isPointInRoundBound(xy[0], xy[1], notesPlusButtons[i])) {
            if (canvas.tree[notesPlusButtons[i][3]].zIndex > clicked_zindex) {
                clicked_index = i;
                clicked_zindex = canvas.tree[notesPlusButtons[i][3]].zIndex;
            }
        }
    }
    if (clicked_index != null) {
        if (notesPlusButtons[clicked_index][6] == ButtonState.Normal) {
            // We need to redraw the button and make sure it's state gets hovered
            notesPlusButtons[clicked_index][6] = ButtonState.Hovered;
            drawRoundIconButton(notesPlusButtons[clicked_index][0], notesPlusButtons[clicked_index][1], notesPlusButtons[clicked_index][2], canvas.tree[notesInformationButtons[clicked_index][3]].content.Typ.StrongColor, "white", notesPlusButtons[clicked_index][5], true, canvas.tree[notesInformationButtons[clicked_index][3]].content.Typ.StrongColor);
        }
    }
}

function handleMouseWheel(event) {
    // Zooming code
    if (event.shiftKey) {
        var x = canvas.config.widthView / 2 + canvas.config.xleftView;  // View coordinates
        var y = canvas.config.heightView / 2 + canvas.config.ytopView;

        var scale = (event.wheelDelta < 0 || event.detail > 0) ? 1.1 : 0.9;
        canvas.config.widthView *= scale;
        canvas.config.heightView *= scale;

        // scale about center of view, rather than mouse position. This is different than dblclick behavior.
        canvas.config.xleftView = x - canvas.config.widthView / 2;
        canvas.config.ytopView = y - canvas.config.heightView / 2;
        draw();
    }
}

function disableScrolling(event) {
    var x = window.scrollX;
    var y = window.scrollY;
    window.onscroll = function () { window.scrollTo(x, y); };
}

function enableScrolling(event) {
    window.onscroll = function () { };
}

function handleMouseClick(event) {

    var xy = getDrawingCoordinates(event);
    for (i = 0; i < buttons.length; i++) {
        if (isPointInRoundBound(xy[0], xy[1], buttons[i])) {
            console.log("Point in bound")
            buttons[i][4]();
        }
    }

    var xy = getDrawingCoordinates(event);
    var clicked_index = null;
    var clicked_zindex = -10000;
    for (i = 0; i < notesInformationButtons.length; i++) {
        if (isPointInRoundBound(xy[0], xy[1], notesInformationButtons[i])) {
            if (canvas.tree[notesInformationButtons[i][3]].zIndex > clicked_zindex) { // TODO, as we aren't drawing buttons on collapse nodes anymore, we can rewrite this bit of code
                clicked_index = i;
                clicked_zindex = canvas.tree[notesInformationButtons[i][3]].zIndex;
            }
        }
    }
    if (clicked_index != null) {
        notesInformationButtons[clicked_index][4](notesInformationButtons[clicked_index]);
    }
    var clicked_index = null;
    var clicked_zindex = -10000;
    for (i = 0; i < notesPlusButtons.length; i++) {
        if (isPointInRoundBound(xy[0], xy[1], notesPlusButtons[i])) {
            if (canvas.tree[notesPlusButtons[i][3]].zIndex > clicked_zindex) {
                clicked_index = i;
                clicked_zindex = canvas.tree[notesPlusButtons[i][3]].zIndex;
            }
        }
    }
    if (clicked_index != null) {
        notesPlusButtons[clicked_index][4](notesPlusButtons[clicked_index]);
    }

}

function isPointInBound(x, y, bound) {
    if (x > bound[0] && x < bound[0] + bound[2] && y > bound[1] && y < bound[1] + bound[3]) {
        return true;
    }
    return false;
}

function isPointInRoundBound(x, y, bound) {
    // bound[0] x coordinate origin bound
    // bound[1] y coordinate origin bound
    // bound[2] radius
    var cx = x - bound[0];
    var cy = y - bound[1];
    var distance = Math.sqrt(Math.pow(cx, 2) + Math.pow(cy, 2));
    if (distance <= bound[2]) {
        return true;
    }
    return false;
}

function getDrawingCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    x = (x) * canvas.config.widthView / canvas.config.widthCanvas + canvas.config.xleftView;
    y = (y) * canvas.config.heightView / canvas.config.heightCanvas + canvas.config.ytopView;
    document.getElementById("mousePosition").innerHTML = x + "  " + y; // According to this site: https://reactjs.org/docs/dom-elements.html the usage of innerHTML is dangerous ^^
    return [x, y];
}

