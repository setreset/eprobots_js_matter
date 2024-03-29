class Energy {

    constructor(x_pos, y_pos) {
        this.body = Matter.Bodies.circle(x_pos, y_pos, 25, {
            isStatic: false,
            render: {
                fillStyle: '#0bcb11',
                //strokeStyle: 'black',
                //lineWidth: 1
            }
        });
        Matter.Body.setDensity(this.body.parent, 1000000000000);

        this.body.my_label = "Energy";
        this.body.my_active = true;
        this.body.my_parent = this;
        this.body.my_energycount = 2500000;
    }
}