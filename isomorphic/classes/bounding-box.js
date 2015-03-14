module.exports = function(point1, point2){

    this.getArray = function(){
        return [point1, point2];
    };

    this.inBox = function(point){
        //todo
    };

    this.getCenter = function(){
        return point1.lerp(point2, 0.5);
    };

    this.getRadius = function(){
        return {
            'center': this.getCenter(),
            'radius': point1.distanceTo(point2)
        };
    };

}
