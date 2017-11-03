window.onload = function() {
    Matter.use(
      'matter-wrap' // PLUGIN_NAME
    );

    var myCanvas = document.getElementById('world');

    // module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        World = Matter.World,
        Body = Matter.Body,
        Events = Matter.Events,
        Bodies = Matter.Bodies,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse;

    // create an engine
    var engine = Engine.create();

    // turn gravity off
    engine.world.gravity.y = 0;

    // create a renderer
    var render = Render.create({
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
    Render.run(render);

    var runner = Runner.create();
    Runner.run(runner, engine);

    // ====================================================== //

    // create two boxes and a ground

    //var ballA = Bodies.circle(450, 50, 40, balloptions);

    //var boxA = Bodies.rectangle(400, 200, 80, 80, balloptions);
    //var boxB = Bodies.rectangle(450, 50, 80, 80, balloptions);
    //var ground = Bodies.rectangle(400, 610, 810, 60, {isStatic: true});

    var eprobots = [];

    for (var i=0;i<30;i++){
        var eprobot = new Eprobot(tools_random(WORLD_WIDTH), tools_random(WORLD_HEIGHT));
        eprobots.push(eprobot);
        World.add(engine.world, eprobot.body);
    }

    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    World.add(engine.world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    Events.on(engine, 'beforeUpdate', function(event) {
        var eprobots_new = [];
        for (var i=0;i<eprobots.length;i++){
            var eprobot = eprobots[i];

            if (eprobot.isAlive()){
                eprobot.update();
                eprobots_new.push(eprobot);
            }else{
                World.remove(engine.world, eprobot.body);
            }

        }
        eprobots = eprobots_new;
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
}