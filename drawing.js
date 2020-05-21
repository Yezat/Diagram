
////////////////////////////////////////////////////////
// Drawing part
////////////////////////////////////////////////////////

// Some Text-Wrapping function
function getLines(ctx, text, maxWidth) {
    // hack TODO find a better way
    var ms = 1;
    var m = "M";
    while (ctx.measureText(m).width < maxWidth) {
        m += "M";
        ms += 1;
    }
    var maxIndexwidth = ms;

    var lines = [];
    var currentLine = "";
    var index = 0;

    while (index < text.length) {
        currentLine = "";

        while (ctx.measureText(currentLine).width < maxWidth && index < text.length) {

            var wordendindex = text.indexOf(" ", index);
            var word = text.substr(index, text.indexOf(" ", index) - index);
            if (wordendindex == -1) {
                word = text.substr(index, text.length - index);
            }
            if (word == "") {
                index += 1;
                continue;
            }



            if (ctx.measureText(word).width > maxWidth) {
                if (currentLine != "") {
                    break;
                }
                // TODO fix leading space
                currentLine = " " + text.substr(index, maxIndexwidth - 1);
                index += currentLine.length;
                break;
            }

            if (ctx.measureText(currentLine + " " + word).width > maxWidth) {
                break;
            }

            currentLine += " " + word;
            index += word.length + 1;

        }
        lines.push(currentLine);
    }
    return lines;
}



function drawButtons() {
    if (canvas.tree[0].children.length <= 6) {
        return;
    }
    var secondAngle = 79/64 * Math.PI;
    var firstAngle = 81/64 * Math.PI;
    var d1 = canvas.config.distance * 1.4;
    var d2 = canvas.config.distance * 1.45;
    var icon1 = "\uf061";
    var icon2 = "\uf060";
    if (canvas.config.chosen_layout == Layouts.Arc) {
        secondAngle = -3 / 64 * Math.PI;
        firstAngle = 3 / 64 * Math.PI;
        d1 = d2 = canvas.config.distance * .515;
        icon1 = "\uf063";
        icon2 = "\uf062";
    }
    buttons = [];
    drawButton(d1 * Math.cos(firstAngle), d1 * Math.sin(firstAngle),0,icon1,previousClick);
    drawButton(d2 * Math.cos(secondAngle), d2 * Math.sin(secondAngle), 1, icon2,nextClick);
}

function drawButton(x, y, index, icon, eventHandler) {
    drawRoundIconButton(x, y, 18, "black","black", icon);
    buttons.push([x, y, 18, index, eventHandler, icon, ButtonState.Normal]);
}


function drawRoundIconButton(x, y, radius, bordercolor, color, icon, fill = false, fillcolor = "white", fontsize = 20) {
    ctx.beginPath();
    
    ctx.strokeStyle = bordercolor;

    ctx.lineWidth = 0.4;
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    
    if (fill) {
        ctx.fillStyle = fillcolor;
        ctx.fill();
    }
    fontsize = radius;
    ctx.stroke();
    ctx.closePath();
    ctx.font = '600 ' + fontsize + 'px "Font Awesome 5 Free"';
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(icon, x, y);
    ctx.stroke();
}


function drawConnector(xfrom, yfrom, xto, yto) {
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    ctx.moveTo(xfrom, yfrom);
    ctx.lineTo(xto, yto);
    // TODO now make an arrow


    ctx.stroke();
    ctx.closePath();    

}



function roundRect(ctx, x, y, w, h, r, color) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
}


function LightenDarkenColor(col, amt) {
    var usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col, 16);

    var r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

function drawNote(x, y, content, index, state, width, height) {

    

    ctx.fillStyle = content.Typ.MediumColor;
    ctx.fillRect(x - width / 2, y - height / 2, width, height);

    

    
    var grd = ctx.createLinearGradient(x -width / 2, y - height / 2, x -width / 2, y + height / 2);
    grd.addColorStop(1, content.Typ.GradientEndColor);
    grd.addColorStop(0, content.Typ.GradientStartColor);

    ctx.fillStyle = grd;
    ctx.fillRect(x + 1 - width / 2, y + 1 - height / 2, width - 2, height - 2);
    ctx.fillStyle = content.Typ.StrongColor;

    ctx.font = "15px Arial";
    var maxWidth = Math.floor(width * 17 / 24);
    lines = getLines(ctx, content.Titel, maxWidth);
    var maxlines =  state == NoteState.Visible ?  4 : 2;
    for (i = 0; i < maxlines; i++) {
        if (lines[i] == undefined) {
            break;
        }
        if (i == maxlines - 1 && lines.length > maxlines) {
            var to_substract = 4;
            if (ctx.measureText(lines[i].substr(0, lines[i].length - 4)).width < maxWidth) {
                to_substract = 0;
            }
            lines[i] = lines[i].substr(0, lines[i].length - to_substract) + " ..."
        }
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        //var yval = state == NoteState.Visible ? y - height * (4 - i) / 10 + 20 : y - collapsedNoteHeight * (-i + 1) / 4 + 5 ;
        var yval = y - height/2 + 30 + i*20 ;
        ctx.fillText(lines[i], x - width / 2 + 5, yval);
    }

    // Autor
    ctx.font = "15px Arial";
    lines = getLines(ctx, content.Autor, maxWidth);
    if (lines.length > 1) {
        lines[0] += " ..."
    }
    var yval = state == NoteState.Visible ? y + 20 : y + 1 * canvas.config.collapsedNoteHeight / 4 + 5;
    ctx.fillText(lines[0], x - width / 2 + 5, yval);





    if (state == NoteState.Visible) {
        

        // Jahr und Medientyp
        ctx.fillStyle = content.Typ.MediumColor;
        ctx.fillText(" Jahr: " + content.Jahr, x - width / 2 + 5, y + 2 * height / 10)
        ctx.fillText(" Medientyp:", x - width / 2 + 5, y + 3 * height / 10)
        ctx.fillText(" " + content.Medientyp, x - width / 2 + 5, y + 4 * height / 10)
    
        ctx.closePath();

        if (content.BildID != undefined) {
            try {
                var img = document.getElementById(content.BildID);
                ctx.drawImage(img, x + 5 * width / 24, y - height * 4 / 10);
            } catch{
                console.log("failed to load image ", content.BildID);
            }
        }


    
        

        var radius = 15;

        drawRoundIconButton(x + width * 5 / 20, y + height * 3 / 10, radius,  content.Typ.StrongColor, content.Typ.StrongColor, "\uf129");
        drawRoundIconButton(x + width * 2 / 5, y + height * 3 / 10, radius, content.Typ.StrongColor,content.Typ.StrongColor, "\uf067");
        notesPlusButtons.push([x + width * 5 / 20, y + height * 3 / 10, radius, index, infoClick, "\uf129", ButtonState.Normal]);
        notesInformationButtons.push([x + width * 2 / 5, y + height * 3 / 10, radius, index, plusClick, "\uf067", ButtonState.Normal]);
    }

}


////////////////////////////////////////////////////////
// End Drawing part
////////////////////////////////////////////////////////
