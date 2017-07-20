var express = require('express');
var fs= require('fs');
var Throttle = require('throttle');
var zlib = require('zlib');


var kvpRequest = require('./kvpRequestMiddleware');


var app = express();

/******************************************************************************/
/*                         Basic web server                                   */
/******************************************************************************/

//return the content of /webapp

app.use('/', express.static(__dirname +'/WEBAPP'));

/******************************************************************************/
/*                             API KVP                                        */
/******************************************************************************/

//http://localhost:8080/api/kvp?SERVICE=W3DS&REQUEST=GetTile&VERSION=0.4.0&CRS=lambert93&LAYER=dem&FORMAT=application/json&TILELEVEL=0&TILEROW=10&TILECOL=16

app.get('/api/kvp', kvpRequest.mandatoryParamValidator,kvpRequest.handler);
app.get('/api/:bw/kvp', kvpRequest.mandatoryParamValidator,kvpRequest.handler);


/******************************************************************************/
/*                         textures serving                                   */
/******************************************************************************/
//bandwith tweaking

app.get('/dyn/textures/:bw/*', function(req,res){
	var speed = parseInt(req.params.bw); 
	if(speed == 0) {
		speed = 10240000;
	}else if (speed >10240000){
		speed = 10240000;
	}
	//console.log(req.params[0]);//show file path
	var stream = fs.createReadStream('./ressources/'+req.query.CITY+'/textures/'+req.params[0]);
	
	stream.on('error',function(error){
		console.log('dyn ReadStream error :',error);
		res.send('use with url like /dyn/bandwithInKb/filePath');
	});
		
	stream.once('readable',function(){
		var gzip = zlib.createGzip();
		var throttle = new Throttle(speed*1024);
		res.set('Content-Encoding', 'gzip');
		stream.pipe(gzip).pipe(throttle).pipe(res);
		//stream.pipe(throttle).pipe(res);
	});

});

//mini doc to remove ?
app.get('/dyn/textures', function(req,res){
	res.send(400,'use with url like /dyn/textures/bandwithInKb/filePath');
});

//staticserving (file server)
app.use('/static/textures', express.static(__dirname +'/ressources/paris/textures'));

/******************************************************************************/
/*                        Error handling                                      */
/******************************************************************************/

app.use(function(req, res ,next){
	res.setHeader('Content-Type','text/plain');
	res.send(404,'Page introuvable ...');
});

app.use(APIerrorHandler);
app.use(errorHandler);






/** Listening port, please change here if needed  */
app.listen(8080);







console.log('server up and running on port 8080');

function APIerrorHandler (err, req, res, next) {
	if(err.API === true){
		console.error('warning: error :' + err.code + '('+ err.msg +')');
		res.send(err.code,{ httpCode: err.code , error: err.msg});
	}else{
		next(err);
	}
}

function errorHandler (err, req, res, next) {
	console.error(err.stack);
	res.send(500,{ httpCode:500, error: 'somthing blew up !'});
}

function restError (res, code, msg){
	console.error('httpCode:'+ code+',error:'+ msg);
	res.send(code,{httpCode: code,error: msg});
}