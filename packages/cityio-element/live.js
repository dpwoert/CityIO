//list with API handles
IO.liveAPI = {};

Router.map(function () {

    this.route('liveAPI', {
        where: 'server',
        path: '/API/:type',

        action: function () {

            var type = this.params.type;
            var responce = '';

            if(!IO.liveAPI[type]){
                responce = 'API not found';
                console.warn('API handle not found!');
            } else {
                responce = IO.liveAPI[type]();
            }

            if(responce.length == 0){
                responce = {error: 'no data'};
            }

            this.response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            this.response.end(JSON.stringify(responce));
        }

    });

});
