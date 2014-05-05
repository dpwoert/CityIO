IO.liveAPI.boats = function(){

    var data = mongo.Traffic.find(
        {'type':'AIS'},
        {sort: {$natural : 1}, limit: 1 }
    ).fetch();

    //var data = mongo.Traffic.find({}).fetch();
    return data[0].data;

}
