class Energy {

    constructor(x_pos, y_pos) {
        this.body = Matter.Bodies.circle(x_pos, y_pos, 15, {
            isStatic: true,
            render: {
                fillStyle: '#0bcb11',
                //strokeStyle: 'black',
                //lineWidth: 1
            }
        });

        this.body.my_label = "Energy";
        this.body.my_active = true;
        this.body.my_parent = this;
    }
}