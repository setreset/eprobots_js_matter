class Eprobot {

    constructor(x_pos, y_pos, program, init_data) {
        let options_body = {
            //density: 0.04, //default 0.001
            //friction: 0.01, //default 0.1
            frictionAir: 0.001, //default 0.01
            restitution: 0.8, //default 0
            render: {
                //fillStyle: '#1400f5',
                //strokeStyle: 'black',
                //lineWidth: 1
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

        let eprobot_body = Matter.Bodies.circle(x_pos, y_pos, simsettings.BODY_RADIUS, options_body);
        let eprobot_sensor = Matter.Bodies.circle(x_pos, y_pos, 60, options_sensor);
        eprobot_sensor.isSensor = true;

        let compound_options = {
            //parts: [eprobot_body, eprobot_sensor]
            parts: [eprobot_body]
        }
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

        let eprobot_compound = Matter.Body.create(compound_options);
        this.body = eprobot_compound;

        eprobot_body.my_label = "Eprobot Body";
        eprobot_body.my_parent = this;

        eprobot_sensor.my_label = "Eprobot Sensor";
        eprobot_sensor.my_parent = this;

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
        tools_compute(this.program, this.working_data, simsettings.PROGRAM_STEPS);

        var speed_val = this.working_data[0];
        var angle_val = this.working_data[1];

        if (isFinite(speed_val)){
            var speed = Math.abs(speed_val) % simsettings.IMPULSE_MAX;
        }else{
            console.log("Infinite: "+speed_val);
            var speed = tools_random(simsettings.IMPULSE_MAX); // random
        }

        if (isFinite(angle_val)){
            var angle_deg = Math.abs(angle_val) % 360;
        }else{
            console.log("Infinite: "+angle_val);
            var angle_deg = tools_random(360); // random
        }

        var angle = Math.radians(angle_deg);

        return [speed, angle];
    }



    update(){

        if (this.isAlive()){
            if (this.age%simsettings.UPDATE_RATE==0){

                // input
                //this.working_data[2] = this.detected_energy;
                //this.working_data[3] = this.detected_eprobots;
                //this.working_data[4] = this.age;
                //this.working_data[5] = tools_random2(-100, 100);

                let speedangle = this.getMoveOISC();
                let speed = speedangle[0];
                let angle = speedangle[1];

                let speed_x = this.body.velocity.x + speed * Math.cos(angle);
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
                }


                //Matter.Body.applyForce(this.body, 0, [speed * Math.cos(angle), speed * Math.sin(angle)]);
                Matter.Body.setVelocity(this.body, { x: speed_x, y: speed_y });
                //this.age = 0;
                //Body.setVelocity(ballA, { x: 0, y: -10 });
                //Body.setAngle(bodyC, -Math.PI * 0.26);
                //Body.setAngularVelocity(bodyD, 0.2);
            }
        }else{
            this.body.render.fillStyle = "#000000";
            Matter.Body.setStatic(this.body, true);
        }

        this.age++;
    }

    isAlive(){
        return this.age < this.lifetime;
    }

    isExistent(){
        return this.age < this.lifetime + simsettings.FOSSILTIME;
    }
}