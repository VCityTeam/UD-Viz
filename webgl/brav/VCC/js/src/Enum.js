/**
 *
 * @class VCC.Enum
 * @author Remi Baume, Alexandre Vienne
 **/

VCC.Enum = {
	SCHEDULER_TASK : {
		ST_LOAD_GEOM : 0,
		ST_LOAD_TEXTURE : 1,
		ST_LOAD_HIGHER_RES : 2
	},

	SCHEDULER_PRIO :{
		SP_HIGH : true,
		SP_LOW : false
	},
	DELETION_LAYER :{
		DL_ALL : "all",
		DL_TERRAIN : "dem",
		DL_BUILDING : "build",
	}
};
