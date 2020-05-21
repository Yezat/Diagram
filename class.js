class PositionInformation {
    /////////////////////////////////
    //  
    //  Idea: based on the graph of the tree:
    //  store fixed angle positions
    //  store zIndex distributions of size 2n+1 for each zIndexGroup (Why 2n+1? suppose we did n, how would we ensure smoots zIndex transitioning based on zIndexOffset?) #Might be unsatisfying answer, written before actual implementation
    //  store distance information for each node
    //  store visibility (NoteState) information for each node
    //  store zIndex angle offset  
    //
    /////////////////////////////////
    constructor(tree) {


        this.tree = tree;
        this.angles = [];
        this.z_indices = [];
        this.distances = [];
        this.note_states = [];
        
        if (canvas.config.chosen_layout == Layouts.Symmetric) {
            this.symmetric();
            return;
        }
        if (canvas.config.chosen_layout == Layouts.Arc) {
            this.arc();
            return;
        }
        console.log("Warning, no valid chosen layout, going for symmetric");
        this.symmetric()

    }
    arc() {
      

        for (var i = 3; i < this.tree[0].children.length-1; i++) { // WARNING TODO note the range from 2 to length -2 -> has implications on allowed rotationIndex!
            // in the arc positioning we define an entire set of positionings per child
            // this means we have n**2 memory consumption
            // the ith child is always considered to have an angle of zero and to be exactly to the right of the root node
            // from there on we do the assignments of distance, note_state, z_index and angle for the rest of the children
            // TODO this means we have to change the way the positionTree() function works for the arc distribution as well as limit the possible rotation index -> disable rotation buttons at the end of rotation...


            var angles = new Array();
            var distances = new Array();
            var note_states = new Array();
            var z_indices = new Array();

            for (var j = 0; j < this.tree[0].children.length; j++) {

                // A different approach, dynamically dependent on i
                if (j == i - 1) {
                    angles.push(Math.PI / 5);
                    distances.push(canvas.config.distance*1.15);
                    note_states.push(NoteState.Visible);
                    z_indices.push(1000);
                }
                else if (j == i - 2) {
                    angles.push(5*Math.PI / 14);
                    distances.push(canvas.config.distance* 1.43);
                    note_states.push(NoteState.Visible);
                    z_indices.push(1000);
                }
                else if (j == i) {
                    angles.push(0);
                    distances.push(canvas.config.distance*1.02);
                    note_states.push(NoteState.Visible);
                    z_indices.push(2000);
                }
                else if (j == i - 3 && i == 3) {
                    angles.push(Math.PI/2);
                    distances.push(canvas.config.distance*1.89);
                    note_states.push(NoteState.Visible);
                    z_indices.push(500);
                }
                else if (j == this.tree[0].children.length - 1 && i == this.tree[0].children.length - 2) {
                    angles.push(25*Math.PI/14);
                    distances.push(canvas.config.distance* 1);
                    note_states.push(NoteState.Visible);
                    z_indices.push(500);
                } else {
                    note_states.push(NoteState.Collapsed);
                    if (j <= i - 3) {
                        // below horizontal at origin
                        z_indices.push(j);
                        

                        var angle_range = -2 / 60 * Math.PI;
                        var base = 1 * Math.PI / 2;

                        var angle = (j / (i - 1)) * angle_range;

                        

                        angles.push(base + angle);

                        

                        var b = 1.89 * canvas.config.distance;
                        var a = 10 * b;

                        var factor = (0.1 - j / (10 * i));
                        
                        distances.push((1.79 + factor) * canvas.config.distance)

                        
                        


                    } else {
                        // above horizontal at origin



                        
                        var jdx = j - i;


                        var angle_range = /*260 / 729*/ 270/730 /*1/2*/ * Math.PI;
                        var base = 6 * Math.PI / 4;

                        // next assign angle and radius
                        var radius = 620 -240; // subtracting 250 to make sure things are within fibonacci circle
                        
                        var angle = (this.tree[0].children.length - jdx - i-1) / (this.tree[0].children.length - i) * angle_range;
                        

                        
                        // use ellipse with parameters
                        var a = 15 / 20 * radius;
                        var b = radius;
                        var d = Math.sqrt(Math.pow(a * Math.cos(angle), 2) + Math.pow(b * Math.sin(angle), 2));

                        distances.push(d);
                        
                        angles.push(angle+base);

                        

                        z_indices.push(-j);

                    }

                }
                

            }
            this.angles.push(angles);
            this.distances.push(distances);
            this.z_indices.push(z_indices);
            this.note_states.push(note_states);
            
        }
        //console.log(this.angles,this.distances,this.z_indices,this.note_states)
        
    }
    symmetric() {
        //fill root Node information
        this.angles.push(new Array()); // contains the angles of first order children
        this.distances.push(new Array()); // distances of first order children
        this.note_states.push(new Array()); // states of first order children
        this.z_indices.push(new Array()); // here we store zIndex information for all first order children


        var zIndexDefaults = [];


        //Fill zIndex information for first order children
        for (var i = 0; i < this.tree[0].children.length * 2 + 1; i++) { // TODO still necessary to have 2n+1 zindices? Was necessary in the past for sure
            this.z_indices[0].push(zIndexFromIndex(i, 2 * this.tree[0].children.length + 1) + 1000) // Arbitrary large number to make zindex of second order children smaller
        }


        zIndexDefaults.push(Math.floor(this.tree[0].children.length / 2));

        for (var i = 0; i < this.tree[0].children.length; i++) {

            // make the cut between collapsed and visible first order children at 4 and lenght -1
            // the state in turn is used to figure out the angle and the distance of first order children

            //This bit of code is a index to position mapping
            var angle = 0;
            var state = null;

            var controlValue = this.tree[0].children.length - 5;
            if (i <= 3) {
                angle = canvas.config.base_angle * i;
                state = NoteState.Visible;
                this.distances[0].push(canvas.config.distance);
            } else if (i < this.tree[0].children.length - 1) {
                var j = Math.floor(i - 3);
                var t = controlValue;
                j -= Math.ceil(t / 2);
                var angle_diff = 5 / 20 * Math.PI;

                angle = Math.atan(j * angle_diff / (1.5 * t));
                angle += 10 / 8 * Math.PI;

                state = controlValue <= 1 ? NoteState.Visible : NoteState.Collapsed;
                angle = controlValue <= 1 ? base_angle * i : angle;


                var factor = Math.exp(-1 / 2 * Math.pow((j / Math.pow(controlValue, 1.3)), 2))
                this.distances[0].push(canvas.config.distance * factor);

            } else {
                angle = canvas.config.base_angle * (i - this.tree[0].children.length);
                angle = (angle < 0) ? angle + 2 * Math.PI : angle;
                state = NoteState.Visible;
                this.distances[0].push(canvas.config.distance);
            }
            this.angles[0].push(angle);
            this.note_states[0].push(state);

        }
        canvas.state.zIndexOffsets = zIndexDefaults; // TODO is this still necessary?
    }
    initialTree() {
        this.positionTree();

        for (var i = 0; i < this.tree[0].children.length; i++) {
            canvas.tree[canvas.tree[0].children[i]].distance = 0; // set distances to zero in inital state.
        }
    }
    positionTree() {

        canvas.tree[0].zIndex = 1000000; // set root node zIndex, sould be drawn last
        canvas.tree[0].distance = 0;
        canvas.tree[0].state = NoteState.Visible;

        for (var i = 0; i < this.tree[0].children.length; i++) {

            if (canvas.config.chosen_layout == Layouts.Symmetric) {

                var index = (i + canvas.state.rotationIndexOffset) % this.tree[0].children.length; // index is the rotated index.


                canvas.tree[canvas.tree[0].children[i]].angle = this.angles[0][index];
                canvas.tree[canvas.tree[0].children[i]].zIndex = this.z_indices[0][canvas.state.zIndexOffsets[0] + index];
                canvas.tree[canvas.tree[0].children[i]].state = this.note_states[0][index];
                canvas.tree[canvas.tree[0].children[i]].distance = this.distances[0][index];

            } else {
                // Arc TODO for now ^^
                canvas.tree[canvas.tree[0].children[i]].angle = this.angles[canvas.state.rotationIndexOffset][i];
                canvas.tree[canvas.tree[0].children[i]].zIndex = this.z_indices[canvas.state.rotationIndexOffset][i];
                canvas.tree[canvas.tree[0].children[i]].state = this.note_states[canvas.state.rotationIndexOffset][i];
                canvas.tree[canvas.tree[0].children[i]].distance = this.distances[canvas.state.rotationIndexOffset][i];

            }

        }
    }

}

class PositionState {
    constructor() {
        /////////////////////////////////
        //  rotationIndexOffset: a variable to store the current rotation state.
        //  zIndexOffsets: an array of size second + 1 to store the zIndex offset from the middle position of the zIndex of each zIndex group
        //                  a zIndex group is considered the collapsed region and each child tree of each first order child
        /////////////////////////////////
        this._rotationIndexOffset = 0;
        this.second = parseInt(document.getElementById("second").value, 10);
    }
    set rotationIndexOffset(offset) {

        this.rotation_direction = Math.sign(offset - this._rotationIndexOffset);
        this._rotationIndexOffset = offset;

        if (canvas.config.chosen_layout == Layouts.Symmetric) {

            this._rotationIndexOffset = (this._rotationIndexOffset < 0 ? this._rotationIndexOffset + this.second : this._rotationIndexOffset); // don't let the state.rotationIndexOffset go negative, modulo doesn't work otherwise
        }
        else {
            // Arc
            
            if (this._rotationIndexOffset < 0) {
                this._rotationIndexOffset = 0;
            }
            if (this._rotationIndexOffset > canvas.tree[0].children.length - 5) {
                this._rotationIndexOffset = canvas.tree[0].children.length - 5;
            }
        }
        
        
        this.animateRotation();
    }
    get rotationIndexOffset() {
        return this._rotationIndexOffset;
    }

    //////////////////////////////////
    //
    //  Idea:
    //  We know the precise positioning of each Node and we know that user input changed the position state
    //  Let's calculate the new node positions based on user input, that is call positionTree()
    //  Hence we know the difference of each node in the last two state we can calculate the "infinitesimal" positioning steps from last to new position and draw them quickly which creates the animation
    //
    //////////////////////////////////
    animatezIndexChange() {
        canvas.positioning_information.positionTree();
        draw();
    }
    animateRotation(speed = canvas.config.animation_speed) {
        var last_state = JSON.parse(JSON.stringify(canvas.tree));
        canvas.positioning_information.positionTree();
        var new_state = JSON.parse(JSON.stringify(canvas.tree));
        var transition_state = JSON.parse(JSON.stringify(last_state));

        var rotation_direction = this.rotation_direction;

        var animation_percentage = 0;
        var animation_stopper = 1;


        var id = setInterval(frame, speed);
        function frame() {

            if (animation_percentage >= animation_stopper) {
                for (var i = 0; i < new_state.length; i++) {
                    new_state[i] = Object.assign(new Note, new_state[i]);
                }
                canvas.tree = new_state;
                draw();
                clearInterval(id);
                canvas.addEventListener("click", handleMouseClick, false);

            } else {

                animation_percentage += canvas.config.animation_step;

                for (var i = 0; i < transition_state.length; i++) {
                    var newangle = new_state[i].angle;
                    var lastangle = last_state[i].angle; //because of numerical ungenauigkeit, möglicherweise nicht mehr notwendig
                    if (rotation_direction == 1 && newangle < lastangle) {
                        newangle += 2 * Math.PI;
                    }
                    if (rotation_direction == -1 && lastangle < newangle) {
                        newangle -= 2 * Math.PI;
                    }
                    var diff = newangle - lastangle;

                    if (new_state[i].angle == null || last_state[i].angle == null) {
                        transition_state[i].angle = null;
                    } else {
                        transition_state[i].angle = lastangle + diff * animation_percentage;
                    }

                    if (new_state[i].state != last_state[i].state) {

                        if (new_state[i].state == NoteState.Visible) {

                            transition_state[i].height = (canvas.config.noteHeight - canvas.config.collapsedNoteHeight) * animation_percentage + canvas.config.collapsedNoteHeight;
                            transition_state[i].width = (canvas.config.noteWidth - canvas.config.collapsedNoteWidth) * animation_percentage + canvas.config.collapsedNoteWidth;
                        } else {

                            transition_state[i].height = (canvas.config.noteHeight - canvas.config.collapsedNoteHeight) * (1 - animation_percentage) + canvas.config.collapsedNoteHeight;
                            transition_state[i].width = (canvas.config.noteWidth - canvas.config.collapsedNoteWidth) * (1 - animation_percentage) + canvas.config.collapsedNoteWidth;
                        }


  

                    }

                    if (animation_percentage > 0.5) {
                        transition_state[i].state = new_state[i].state;
                        transition_state[i].zIndex = new_state[i].zIndex;
                    }

                    var newdistance = new_state[i].distance;
                    var lastdistance = last_state[i].distance;
                    var signum = 1 - animation_percentage;
                    if (newdistance > lastdistance) {
                        signum = animation_percentage;
                    }
                    transition_state[i].distance = Math.abs((newdistance - lastdistance)) * signum + Math.min(newdistance, lastdistance);

                    if (last_state[i].state == NoteState.Hidden && new_state[i].state == NoteState.Visible) {
                        transition_state[i].state = NoteState.Visible;
                    }

                }
                for (var i = 0; i < transition_state.length; i++) {
                    transition_state[i] = Object.assign(new Note, transition_state[i]) // wegen javascripts referenzmechanismus
                }
                canvas.tree = transition_state;
                draw();
            }
        }
    }

}


class Note {
    constructor(id, parentId, parent, depth, childIndex, content) {
        this.content = content;
        this.id = id;
        this.parentId = parentId;
        this.parent = parent;
        this.depth = depth;
        this.children = [];
        this.childIndex = childIndex;
        this._height = canvas.config.noteHeight;
        this._width = canvas.config.noteWidth;
    }

    draw() {
        //console.log("drawing node", this.text, this.x, this.y,this.parent.state, this.distance, this.depth,this.angle);
        // Won't work just now, state not defined ^^
        if (this.angle == null && this.parentId != null || this.state == NoteState.Hidden) {
            return;
        }
        drawNote(this.x, this.y, this.content, this.id, this.state,this.width,this.height);
    }

    drawConnector() {
        if (this.parentId != null) { // don't draw a connector for root node
            drawConnector(canvas.tree[this.parentId].x, canvas.tree[this.parentId].y, this.x, this.y);
        }
    }

    set height(value) {
        this._height = value;
    }
    set width(value) {
        this._width = value;
    }

    get height() { // TODO implemenation would be nicer if whe could always return this._height. Altough we use a teeny tiny bit less memory this way
        if (this._height != canvas.config.noteHeight && this._height != canvas.config.collapsedNoteHeight) {
            return this._height;
        }
        if (this.state == NoteState.Visible) {
            return canvas.config.noteHeight;
        }
        if (this.state == NoteState.Collapsed) {
            return canvas.config.collapsedNoteHeight;
        }
    }

    get width() {
        if (this._width != canvas.config.noteHeight && this._width != canvas.config.collapsedNoteWidth) {
            return this._width;
        }
        if (this.state == NoteState.Visible) {
            return canvas.config.noteWidth;
        }
        if (this.state == NoteState.Collapsed) {
            return canvas.config.collapsedNoteWidth;
        }
    }

    get x() {
        if (this.parentId == null) return 0;
        return this.distance * Math.cos(this.angle);
    }
    get y() {
        if (this.parentId == null) return 0;
        return this.distance * Math.sin(this.angle);
    }
}