/**
 * Copyright University of Lyon, 2012 - 2017
 * Distributed under the GNU Lesser General Public License Version 2.1 (LGPLv2)
 * (Refer to accompanying file License.md or copy at
 *  https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html )
 */

/**
 * @class VCC.Enum
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
