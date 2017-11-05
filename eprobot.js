class Eprobot {

    constructor(x_pos, y_pos) {
        this.body = Matter.Bodies.circle(x_pos, y_pos, 20, {
            //density: 0.04, //default 0.001
            //friction: 0.01, //default 0.1
            frictionAir: 0.001, //default 0.01
            restitution: 0.5, //default 0
            render: {
                fillStyle: '#1400f5',
                //strokeStyle: 'black',
                //lineWidth: 1
            },
            plugin: {
                wrap: {
                    min: {
                        x: 0,
                        y: 0
                    },
                    max: {
                        x: WORLD_WIDTH,
                        y: WORLD_HEIGHT
                    }
                }
            }
        });

        this.body.my_label = "Eprobot";
        this.body.my_parent = this;
        //console.log("density: "+ this.body.density);
        //console.log("friction: "+ this.body.friction);
        //console.log("frictionAir: "+ this.body.frictionAir);
        //console.log("restitution: "+ this.body.restitution);

        this.age=0;
        this.lifetime = 200 + tools_random2(200, 300);

        //// init
        //var t = s.getWorld().getTerrain(x_pos, y_pos);
        //t.setSlotObject(this);
        //
        //this.age = 0;
        //
        //this.s = s;
        //this.x_pos = x_pos;
        //this.y_pos = y_pos;
        //
        //this.init_programm = init_programm;
        //this.working_programm = init_programm.slice(0);
    }

    // MAIN

    getMoveRandom(){
        var speed = tools_random(10);
        var angle = Math.random() * Math.PI * 2; // random angle
        return [speed, angle];
    }

    update(){

        if (this.age%50==0){
            let speedangle = this.getMoveRandom();
            let speed = speedangle[0];
            let angle = speedangle[1];

            let speed_x = this.body.velocity.x + speed * Math.cos(angle);
            /*if (this.body.velocity.x > VELOCITY_MAX){
                this.body.velocity.x = VELOCITY_MAX;
            }else if (this.body.velocity.x < -VELOCITY_MAX){
                this.body.velocity.x = -VELOCITY_MAX;
            }*/

            let speed_y = this.body.velocity.y + speed * Math.sin(angle);
            /*if (this.body.velocity.y > VELOCITY_MAX){
                this.body.velocity.y = VELOCITY_MAX;
            }else if (this.body.velocity.y < -VELOCITY_MAX){
                this.body.velocity.y = -VELOCITY_MAX;
            }*/


            //Matter.Body.applyForce(this.body, 0, [speed * Math.cos(angle), speed * Math.sin(angle)]);
            Matter.Body.setVelocity(this.body, { x: speed_x, y: speed_y });
            //this.age = 0;
            //Body.setVelocity(ballA, { x: 0, y: -10 });
            //Body.setAngle(bodyC, -Math.PI * 0.26);
            //Body.setAngularVelocity(bodyD, 0.2);
        }
        this.age++;
    }

    isAlive(){
        return this.age < this.lifetime;
    }

    //newStep(){
    //    var forked_ep = null;
    //
    //    // set input
    //    if (this.s.getSettings().SENSE){
    //        this.set_input();
    //    }
    //
    //    var control_vals = this.get_control_vals();
    //
    //    var control_val = control_vals[0];
    //    //var control_val = this.get_move_random();
    //    if (isFinite(control_val)){
    //        var move_action = Math.abs(control_val) % 9;
    //    }else{
    //        console.log("Infinite: "+control_val);
    //        var move_action = tools_random(9); // random
    //    }
    //
    //    var rep_val = control_vals[1];
    //    if (isFinite(rep_val)){
    //        var rep_action = Math.abs(rep_val) % 2;
    //    }else{
    //        console.log("Infinite: "+rep_val);
    //        var rep_action = 0; // do nothing
    //    }
    //
    //    var toxin_val = control_vals[2];
    //    if (isFinite(toxin_val)){
    //        var tox_action = Math.abs(toxin_val) % 2;
    //    }else{
    //        console.log("Infinite: "+toxin_val);
    //        var tox_action = 0; // do nothing
    //    }
    //
    //    var ocstacle_val = control_vals[3];
    //    if (isFinite(ocstacle_val)){
    //        var obstacle_action = Math.abs(ocstacle_val) % 2;
    //    }else{
    //        console.log("Infinite: "+ocstacle_val);
    //        var obstacle_action = 0; // do nothing
    //    }
    //
    //    forked_ep = this.processAction(move_action, rep_action, tox_action, obstacle_action);
    //
    //    return forked_ep;
    //}
    //
    //processAction(move_action, rep_action, toxin_action, obstacle_action){
    //    var forked_ep = null;
    //
    //    if (move_action > 0){
    //        var coord__new = this.s.getWorld().getCoordinates(this, move_action-1);
    //        if (coord__new){
    //            var t_new = this.s.getWorld().getTerrain(coord__new[0],coord__new[1]);
    //
    //            // ist da auch nichts?
    //            if (this.canMoveToField(t_new)){
    //                this.preMove(t_new);
    //
    //                // position verschieben
    //                // alte position loeschen
    //                var t_old = this.s.getWorld().getTerrain(this.x_pos, this.y_pos);
    //                t_old.setSlotObject(null);
    //                t_new.setSlotObject(this);
    //                t_new.set_trace(this.getId(), this.s.getSettings().TRACETIME);
    //                this.setPos(coord__new[0],coord__new[1]);
    //            }
    //        }
    //    }
    //
    //    if (obstacle_action > 0 && this.energy >= this.s.getSettings().ENERGYCOST_OBSTACLE) {
    //        var my_t = this.s.getWorld().getTerrain(this.x_pos,this.y_pos);
    //        my_t.setObstacle(this.s.getSettings().OBSTACLETIME);
    //        this.addEnergy(-this.s.getSettings().ENERGYCOST_OBSTACLE);
    //    }
    //
    //    if (rep_action==1 && this.energy >= this.s.getSettings().ENERGYCOST_SEED) {
    //        var t = this.s.getWorld().getTerrain(this.x_pos, this.y_pos);
    //        t.addFruitfulness(this.s.getSettings().SEED_POWER);
    //        this.addEnergy(-this.s.getSettings().ENERGYCOST_SEED);
    //    }
    //
    //    if (toxin_action==1 && this.energy >= this.s.getSettings().ENERGYCOST_TOXIN) {
    //        var t = this.s.getWorld().getTerrain(this.x_pos, this.y_pos);
    //        t.addToxin(this.s.getSettings().TOXIN_POWER);
    //        this.addEnergy(-this.s.getSettings().ENERGYCOST_TOXIN);
    //    }
    //
    //    if (this.getForkCondition()){
    //        forked_ep = this.fork();
    //    }
    //
    //    return forked_ep
    //}
    //
    //// HELPER
    //
    //set_input() {
    //    var inputval = this.s.getWorld().get_environment_val(this.x_pos,this.y_pos);
    //    //console.log(inputval);
    //    var program_length = this.s.getSettings().PROGRAM_LENGTH;
    //
    //    var working_programm = this.working_programm;
    //    working_programm[program_length-5] = inputval.local_foodcount;
    //
    //    working_programm[program_length-6] = inputval.local_eprobotcount_0;
    //    working_programm[program_length-7] = inputval.local_tracecount_0;
    //
    //    working_programm[program_length-8] = inputval.local_eprobotcount_1;
    //    working_programm[program_length-9] = inputval.local_tracecount_1;
    //
    //    working_programm[program_length-10] = inputval.local_fossilcount;
    //
    //    working_programm[program_length-11] = inputval.local_fruitfulness;
    //    working_programm[program_length-12] = inputval.local_toxin;
    //
    //    working_programm[program_length-13] = this.getAge();
    //    working_programm[program_length-14] = this.getEnergy();
    //    working_programm[program_length-15] = this.x_pos;
    //    working_programm[program_length-16] = this.y_pos;
    //}
    //
    //get_control_vals() {
    //    var working_programm = this.working_programm;
    //    var stepcounter = tools_compute(working_programm, this.s);
    //    //if (stepcounter>20){
    //    //    //var penalty = parseInt((stepcounter-20)/10);
    //    //    var penalty = stepcounter;
    //    //    this.addEnergy(-penalty);
    //    //}
    //
    //    return [
    //        working_programm[this.s.getSettings().PROGRAM_LENGTH-1],
    //        working_programm[this.s.getSettings().PROGRAM_LENGTH-2],
    //        working_programm[this.s.getSettings().PROGRAM_LENGTH-3],
    //        working_programm[this.s.getSettings().PROGRAM_LENGTH-4]
    //    ];
    //}
    //
    //// MISC
    //
    //doAge(){
    //    this.addEnergy(-1);
    //    this.incrAge();
    //};
    //
    //// GETTER / SETTER
    //
    //getAge(){
    //    return this.age;
    //}
    //
    //setAge(new_age){
    //    this.age = new_age;
    //}
    //
    //incrAge(){
    //    this.age++;
    //}
    //
    //addEnergy(number) {
    //    this.energy += number;
    //    if (this.energy < 0){
    //        this.energy = 0;
    //    }
    //};
    //
    //getEnergy(){
    //    return this.energy;
    //}
    //
    //setEnergy(new_energy){
    //    this.energy = new_energy;
    //}
    //
    //getPos(){
    //    return {"x": this.x_pos, "y": this.y_pos}
    //}
    //
    //setPos(new_x_pos, new_y_pos){
    //    this.x_pos = new_x_pos;
    //    this.y_pos = new_y_pos;
    //}
    //
    //// SERIALIZATION
    //
    //toJSON() {
    //    return {
    //        id: this.getId(),
    //        age: this.age,
    //        energy: this.energy,
    //        x_pos: this.x_pos,
    //        y_pos: this.y_pos,
    //        init_programm: this.init_programm,
    //        working_programm: this.working_programm
    //    };
    //}
    //
    //loadState(e_state) {
    //    this.age = e_state.age;
    //    this.energy = e_state.energy;
    //    this.working_programm = e_state.working_programm;
    //}
}