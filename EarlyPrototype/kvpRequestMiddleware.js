var fs = require('fs');
var Throttle = require('throttle');
var zlib = require('zlib');


exports.handler = function(req, res, next) {
	//	/ressources/paris/LOD0/tiles
	var request = req.query.REQUEST;
	if (request == 'GetTile') {
		//	var resJson=tempfunc.buildJsonFromTuile(req.query.TILEROW,req.query.TILECOL,req.query.TILELEVEL);
		var stream;

		if (req.query.LAYER == 'dem') {
			if (req.query.CITY == 'paris') {
				stream = fs.createReadStream('./ressources/paris/LOD' + req.query.TILELEVEL + '/dem/ZoneAExporter_' + req.query.TILEROW + '_' + req.query.TILECOL + '_terrain.json');
			} else {
				stream = fs.createReadStream('./ressources/' + req.query.CITY + '/LOD' + req.query.TILELEVEL + '/dem/tile_' + req.query.TILEROW + '-' + req.query.TILECOL + '.json');
			}
		} else if (req.query.LAYER == 'build'){
			 
			if (req.query.CITY == 'paris') {
				stream = fs.createReadStream('./ressources/paris/LOD' + req.query.TILELEVEL + '/build/ZoneAExporter_' + req.query.TILEROW + '_' + req.query.TILECOL + '.json');
			} else {
				stream = fs.createReadStream('./ressources/' + req.query.CITY + '/LOD' + req.query.TILELEVEL + '/build/tile_' + req.query.TILEROW + '-' + req.query.TILECOL + '.json');
			}
		}else if(req.query.LAYER == 'noticeableBuild'){
				stream = fs.createReadStream('./ressources/' + req.query.CITY + '/LOD' + req.query.TILELEVEL + '/'+req.query.LAYER +'/tile_' + req.query.TILEROW + '-' + req.query.TILECOL + '.json');
		}else if(req.query.LAYER == 'lidar'){
				stream = fs.createReadStream('./ressources/' + req.query.CITY + '/LOD' + req.query.TILELEVEL + '/lidar/tile_' + req.query.TILEROW + '-' + req.query.TILECOL + '.json');
		}  
		else {
			var err = {};
			err.code = 404;
			err.API = true;
			err.msg = 'LAYER:' + req.query.LAYER + 'at LOD' + req.query.TILELEVEL + ' doesn\'t exist';
			next(err);
		}
	}
	if (stream) {
		var gzip = zlib.createGzip();

		stream.on('error', function(error) {
			console.log('GetTile Stream error :', error);
			var err = {};
			err.code = 404;
			err.API = true;
			err.msg = 'Bad parameter? check log for missing files ';
			next(err);
		});
		stream.once('readable', function() {
			var gzip = zlib.createGzip();
			if (req.params.bw) {
				var speed = parseInt(req.params.bw);
				if (speed == 0) {
					speed = 10240000;
				} else if (speed > 10240000) {
					speed = 10240000;
				}
				var throttle = new Throttle(speed * 1024);
				//res.set('Content-Encoding', 'gzip');
				//stream.pipe(gzip).pipe(throttle).pipe(res);
				stream.pipe(throttle).pipe(res);
			} else {
				res.set('Content-Encoding', 'gzip');
				stream.pipe(gzip).pipe(res);
			}
		});
	} else if (request == 'GetScene') {
		var err = {};
		err.code = 501;
		err.API = true;
		err.msg = 'Not implmented yet';
		next(err);

	} else if (request == "GetConfig") {
		var stream;
		if (req.query.CITY != '') {
			stream = fs.createReadStream('./ressources/' + req.query.CITY + '/config');
		}
		if (stream) {
			var gzip = zlib.createGzip();

			stream.on('error', function(error) {
				console.log('GetTile Stream error :', error);
				var err = {};
				err.code = 404;
				err.API = true;
				err.msg = 'Bad parameter? check log for missing files ';
				next(err);
			});

			stream.once('readable', function() {
				var gzip = zlib.createGzip();
				if (req.params.bw) {
					var speed = parseInt(req.params.bw);
					if (speed == 0) {
						speed = 10240000;
					} else if (speed > 10240000) {
						speed = 10240000;
					}
					var throttle = new Throttle(speed * 1024);
					//res.set('Content-Encoding', 'gzip');
					//stream.pipe(gzip).pipe(throttle).pipe(res);
					stream.pipe(throttle).pipe(res);
				} else {
					res.set('Content-Encoding', 'gzip');
					stream.pipe(gzip).pipe(res);
				}
			});
		}


	} else {
		var err = {};
		err.code = 418;
		err.API = true;
		err.msg = 'I\'m a teapot ! So leave me alone!';
		next(err);
	}
}



exports.mandatoryParamValidator = function(req, res, next) {
	var code = 200;
	var msg = '';
	var temp;

	if (req.query.REQUEST == 'GetConfig') {
		if (!req.query.hasOwnProperty('CITY')) {
			code = 400;
			msg += ' Missing mandatory argument CITY;';
		}
		//next();
	} else {
		if (!req.query.hasOwnProperty('SERVICE')) {
			code = 400;
			msg += ' Missing mandatory argument SERVICE;';
		} else if (req.query.SERVICE != 'W3DS') {
			code = 400;
			msg += ' Incorect Value for parameter SERVICE: ' + req.query.SERVICE + ' Expected Value: W3DS ';
		}

		if (!req.query.hasOwnProperty('REQUEST')) {
			code = 400;
			msg += ' Missing mandatory argument REQUEST;';
		}

		if (!req.query.hasOwnProperty('VERSION')) {
			code = 400;
			msg += ' Missing mandatory argument VERSION;';
		} else if (req.query.VERSION != '0.4.0') {
			code = 400;
			msg += ' Incorect Value for parameter VERSION: ' + req.query.VERSION + ' Expected Value: 0.4.0';
		}

		if (!req.query.hasOwnProperty('CRS')) {
			code = 400;
			msg += ' Missing mandatory argument CRS;';
		} else if (false) { //dono what to check
			code = 400;
			msg += ' Incorect Value for parameter CRS: ' + req.query.CRS + ' Expected Value: TO DO ';
		}

		if (!req.query.hasOwnProperty('LAYER')) {
			code = 400;
			msg += ' Missing mandatory argument LAYER;';
		} else if (false && req.query.LAYER) { //todo list availlable layer
			code = 400;
			msg += ' Incorect Value for parameter LAYER: ' + req.query.LAYER + ' Expected Value: TO DO ';
		}

		if (!req.query.hasOwnProperty('FORMAT')) {
			code = 400;
			msg += ' Missing mandatory argument FORMAT;';
		} else if (req.query.FORMAT != 'application/json') {
			code = 400;
			msg += ' Incorect Value for parameter FORMAT: ' + req.query.FORMAT + ' Expected Value: application/json ';
		}

		if (!req.query.hasOwnProperty('TILELEVEL')) {
			code = 400;
			msg += ' Missing mandatory argument TILELEVEL;';
		} else if ((temp = parseInt(req.query.TILELEVEL)) > 3 || temp < 0) {
			code = 400;
			msg += ' Incorect Value for parameter TILELEVEL: ' + temp + ' Expected Value: integer in [0-2] ';
		}

		if (!req.query.hasOwnProperty('TILEROW')) {
			code = 400;
			msg += ' Missing mandatory argument TILEROW;';
		}

		if (!req.query.hasOwnProperty('TILECOL')) {
			code = 400;
			msg += ' Missing mandatory argument TILECOL;';
		}
	}
	if (code != 200) {
		//restError(res, code, msg);
		var err = {};
		err.code = code;
		err.API = true;
		err.msg = msg;
		next(err);
	} else
		next();
}
