class Eprobot {

    constructor(kind, x_pos, y_pos, program, init_data, size) {
        this.kind = kind;
        this.hue = kind*(360/simsettings.EPROBOT_CONCURRENCY);;
        this.size = size;
        this.energy_consumed = 0;

        let options_body = {
            //density: 0.04, //default 0.001
            //friction: 0.01, //default 0.1
            frictionAir: 0.001, //default 0.01
            restitution: 0.8, //default 0
            render: {
                fillStyle: "hsl("+this.hue+", 100%, 50%)",
                strokeStyle: 'black',
                lineWidth: 1
            }
        }

        let options_sensor = {
            //density: 0.04, //default 0.001
            friction: 0, //default 0.1
            frictionAir: 0, //default 0.01
            //restitution: 0.8, //default 0
            render: {
                //fillStyle: '#1400f5',
                //strokeStyle: 'black',
                //lineWidth: 1
                visible: false
            }
        }

        this.body = Matter.Bodies.circle(x_pos, y_pos, size, options_body);

        this.body.my_label = "Eprobot Body";
        this.body.my_parent = this;
        this.body.my_active = true;

        //let eprobot_sensor = Matter.Bodies.circle(x_pos, y_pos, 60, options_sensor);
        //eprobot_sensor.isSensor = true;

        //eprobot_sensor.my_label = "Eprobot Sensor";
        //eprobot_sensor.my_parent = this;

        /*let compound_options = {
            //parts: [eprobot_body, eprobot_sensor]
            parts: [eprobot_body]
        }*/
        if (!simsettings.BORDERS){
            compound_options["plugin"] = {
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
        }

        //let eprobot_compound = Matter.Body.create(compound_options);
        //this.body = eprobot_compound;

        this.program = program;

        this.init_data = init_data;
        this.working_data = init_data.slice(0);

        //console.log("density: "+ this.body.density);
        //console.log("friction: "+ this.body.friction);
        //console.log("frictionAir: "+ this.body.frictionAir);
        //console.log("restitution: "+ this.body.restitution);

        this.age=0;
        this.lifetime = simsettings.LIFETIME_BASE + tools_random2(200, 400);

        this.detected_energy = 0;
        this.detected_eprobots = 0;

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

    getMoveOISC(){
        let steps = tools_compute(this.program, this.working_data, simsettings.PROGRAM_STEPS);
        if (steps>=simsettings.PROGRAM_STEPS){
            stats_incr("high_stepcounter");
        }

        let penalty = parseInt(steps/10);
        this.lifetime = this.lifetime - penalty;

        var speed_val = this.working_data[0];
        var angle_val = this.working_data[1];

        if (isFinite(speed_val)){
            var speed = speed_val % simsettings.IMPULSE_MAX;
        }else{
            log("Infinite: "+speed_val);
            var speed = tools_random(simsettings.IMPULSE_MAX); // random
        }

        /*if (isFinite(angle_val)){
            var angle = angle_val % simsettings.IMPULSE_MAX/10;
        }else{
            console.log("Infinite: "+angle_val);
            var angle = tools_random(simsettings.IMPULSE_MAX); // random
        }*/

        if (isFinite(angle_val)){
            var angle_deg = Math.abs(angle_val) % 360;
        }else{
            log("Infinite: "+angle_val);
            var angle_deg = tools_random(360); // random
        }

        var angle = Math.radians(angle_deg);

        return [speed, angle];
    }



    q(){
        var all_bodies = Matter.Composite.allBodies(engine.world);

        var raylength = 200;
        var raywith = this.size;
        let pos_x = this.body.position.x + (raylength/2)*Math.cos(this.body.angle);
        let pos_y = this.body.position.y + (raylength/2)*Math.sin(this.body.angle);
        let ray = Matter.Bodies.rectangle(pos_x, pos_y, raylength, raywith, { angle: this.body.angle });
        //Matter.World.add(engine.world, ray);
        //var verts = Matter.Vertices.create([{ x: -500, y: -500 }, { x: -500, y: 500 }, { x: 500, y: 500 }, { x: 500, y: -500 }], eprobot.body)
        //var bounds = Matter.Bounds.create(verts);
        var bodies_in_bounds = Matter.Query.region(all_bodies, ray.bounds);
        let energy_counter = 0;
        for (let body_in_bounds of bodies_in_bounds){
            if (body_in_bounds.my_label == "Energy"){
                energy_counter++;
            }
        }
        return energy_counter;
    }

    update(){

        if (this.isAlive()){
            if (this.age%simsettings.UPDATE_RATE==0){

                // input
                //this.working_data[2] = this.detected_energy;
                //this.working_data[3] = this.detected_eprobots;
                this.working_data[2] = this.age;
                this.working_data[3] = this.energy_consumed;
                this.working_data[4] = tools_random2(-100, 100);
                this.working_data[5] = parseInt(this.body.position.x);
                this.working_data[6] = parseInt(this.body.position.y);
                this.working_data[7] = this.q();

                let speedangle = this.getMoveOISC();
                let speed = speedangle[0];
                let angle = speedangle[1];

                let speed_max=10;
                let anglespeed_max=0.1;

                /*if (speed>speed_max){
                    speed = speed_max;
                }else if (speed<-speed_max){
                    speed = -speed_max
                }

                if (anglespeed>anglespeed_max){
                    anglespeed = anglespeed_max;
                }else if (anglespeed<-anglespeed_max){
                    anglespeed = -anglespeed_max
                }*/

                /*let speed_x = this.body.velocity.x + speed * Math.cos(angle);
                if (speed_x > simsettings.VELOCITY_MAX){
                    speed_x = simsettings.VELOCITY_MAX;
                }else if (speed_x < -simsettings.VELOCITY_MAX){
                    speed_x = -simsettings.VELOCITY_MAX;
                }

                let speed_y = this.body.velocity.y + speed * Math.sin(angle);
                if (speed_y > simsettings.VELOCITY_MAX){
                    speed_y = simsettings.VELOCITY_MAX;
                }else if (speed_y < -simsettings.VELOCITY_MAX){
                    speed_y = -simsettings.VELOCITY_MAX;
                }*/

                /*if (this.size > simsettings.BODY_RADIUS){
                    speed_x = speed_x * (simsettings.BODY_RADIUS/(this.size*1.5));
                    speed_y = speed_y * (simsettings.BODY_RADIUS/(this.size*1.5));
                }*/

                //Matter.Body.applyForce(this.body, 0, [speed * Math.cos(angle), speed * Math.sin(angle)]);
                Matter.Body.setVelocity(this.body, { x: speed * Math.cos(this.body.angle), y: speed * Math.sin(this.body.angle) });
                //this.age = 0;
                //Body.setVelocity(ballA, { x: 0, y: -10 });
                //Body.setAngle(bodyC, -Math.PI * 0.26);
                Matter.Body.setAngle(this.body, angle);
            }
        }else{
            //this.body.render.fillStyle = "#000000";
            Matter.Body.setStatic(this.body, true);
        }

        this.age++;
    }

    procreation(){
        this.energy_consumed++;
        // b darf sich fortpflanzen!
        //console.log(b);
        let new_x = this.body.position.x+tools_random2(-10,10);
        let new_y = this.body.position.y+tools_random2(-10,10);
        //console.log(new_x,new_y);
        if (eprobots[this.kind].length <= simsettings.EPROBOTS_MAX){
            var new_program = tools_mutate(simsettings.MUTATE_POSSIBILITY, simsettings.MUTATE_STRENGTH, this.body.my_parent.program);
            var new_data = tools_mutate(simsettings.MUTATE_POSSIBILITY, simsettings.MUTATE_STRENGTH, this.body.my_parent.init_data);

            //var new_hue = body_eprobot.my_parent.hue + tools_random2(-9, 10);
            //if (new_hue > 360){
            //    new_hue = new_hue - 360;
            //}else if (new_hue < 0){
            //    new_hue = 360 + new_hue;
            //}

            var new_size = this.size + tools_random2(-2, 3);
            if (new_size<1){
                new_size=1;
            }else if (new_size>6){
                new_size=6;
            }

            var new_eprobot = new Eprobot(this.kind, new_x, new_y, new_program, new_data, new_size);
            eprobots[this.kind].push(new_eprobot);
            Matter.World.add(engine.world, new_eprobot.body);
        }else{
            this.lifetime += 50;
            if (this.lifetime > simsettings.LIFETIME_BASE * 3){
                this.lifetime = simsettings.LIFETIME_BASE * 3;
            }
        }
    }

    energy_collision(body_energy){
        // a entfernen
        if (body_energy.my_active === false){
            return;
        }

        body_energy.my_energycount--;
        if (body_energy.my_energycount<=0){
            body_energy.my_active = false;
            Matter.World.remove(engine.world, body_energy);

            // neues Energyobjekt
            var energy = new Energy(tools_random(WORLD_WIDTH), tools_random(WORLD_HEIGHT));
            Matter.World.add(engine.world, energy.body);
        }

        this.procreation();
    }

    isAlive(){
        if (!this.body.my_active){
            return false
        }else{
            return this.age < this.lifetime;
        }
    }

    isExistent(){
        return this.age < this.lifetime + simsettings.FOSSILTIME;
    }
}