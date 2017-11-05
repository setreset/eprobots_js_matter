window.onload = function() {
    Matter.use(
      'matter-wrap' // PLUGIN_NAME
    );

    var myCanvas = document.getElementById('world');

    // create an engine
    var engine = Matter.Engine.create();

    // turn gravity off
    engine.world.gravity.y = 0;

    // create a renderer
    var render = Matter.Render.create({
        canvas: myCanvas,
        engine: engine,
        options: {
            width: WORLD_WIDTH,
            height: WORLD_HEIGHT,
            background: '#eeeeee',
            wireframes: false,
            showAngleIndicator: false
        }
    });

    // run the engine
    //Engine.run(engine);

    //(function run() {
    //    window.requestAnimationFrame(run);
    //    Engine.update(engine, 1000 / 60);
    //})();

    // run the renderer
    Matter.Render.run(render);

    var runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // ====================================================== //

    // create two boxes and a ground

    //var ballA = Bodies.circle(450, 50, 40, balloptions);

    //var boxA = Bodies.rectangle(400, 200, 80, 80, balloptions);
    //var boxB = Bodies.rectangle(450, 50, 80, 80, balloptions);
    //var ground = Bodies.rectangle(400, 610, 810, 60, {isStatic: true});

    for (var i=0;i<10;i++){
        var energy = new Energy(tools_random(WORLD_WIDTH), tools_random(WORLD_HEIGHT));
        Matter.World.add(engine.world, energy.body);
    }

    var eprobots = [];

    // add mouse control
    var mouse = Matter.Mouse.create(render.canvas),
        mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    Matter.World.add(engine.world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    Matter.Events.on(engine, 'beforeUpdate', function(event) {
        // init wenn keine eprobots vorhanden
        if (eprobots.length==0){
            for (var i=0;i<15;i++){
                var eprobot = new Eprobot(tools_random(WORLD_WIDTH), tools_random(WORLD_HEIGHT));
                eprobots.push(eprobot);
                Matter.World.add(engine.world, eprobot.body);
            }
        }

        var eprobots_new = [];
        for (var i=0;i<eprobots.length;i++){
            var eprobot = eprobots[i];

            if (eprobot.isAlive()){
                eprobot.update();
                eprobots_new.push(eprobot);
            }else{
                Matter.World.remove(engine.world, eprobot.body);
            }

        }
        eprobots = eprobots_new;
     });

    function eprobotEnergyCollision(body_eprobot, body_energy){
        // a entfernen
        if (body_energy.my_active === false){
            return;
        }

        body_energy.my_active = false;
        Matter.World.remove(engine.world, body_energy);

        // neues Energyobjekt
        var energy = new Energy(tools_random(WORLD_WIDTH), tools_random(WORLD_HEIGHT));
        Matter.World.add(engine.world, energy.body);

        // b darf sich fortpflanzen!
        //console.log(b);
        let new_x = body_eprobot.position.x+tools_random2(-10,10);
        let new_y = body_eprobot.position.y+tools_random2(-10,10);
        //console.log(new_x,new_y);
        if (eprobots.length <= 50){
            var new_eprobot = new Eprobot(new_x, new_y);
            eprobots.push(new_eprobot);
            Matter.World.add(engine.world, new_eprobot.body);
        }
    }

    Matter.Events.on(engine, 'collisionStart', function(event) {
        let pairs = event.pairs;

        // change object colours to show those starting a collision
        //console.log(pairs.length);
        for (var i = 0; i < pairs.length; i++) {
            let pair = pairs[i];
            let a = pair.bodyA;
            let b = pair.bodyB;

            //console.log(pair.bodyA.label);

            if (a.my_label == "Eprobot" && b.my_label == "Energy"){
                //console.log("Bang");
                eprobotEnergyCollision(a, b);
            }else if(a.my_label == "Energy" && b.my_label == "Eprobot"){
                //console.log("Bang2");
                eprobotEnergyCollision(b, a);

            }
            //pair.bodyA.render.fillStyle = '#333';
            //pair.bodyB.render.fillStyle = '#333';
        }
    });

    function toggle_run(){
        console.log("click");
        if (runner.enabled){
            console.log("stop");
            runner.enabled=false;
        }else{
            console.log("start");
            runner.enabled=true;
        }

    }

    document.getElementById("toggle_run").addEventListener("click", toggle_run);
};