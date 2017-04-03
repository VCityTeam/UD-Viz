/**
 * Copyright University of Lyon, 2012 - 2017
 * Distributed under the GNU Lesser General Public License Version 2.1 (LGPLv2)
 * (Refer to accompanying file License.md or copy at
 *  https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html )
 */

/**
 *
 * @class VCC.Enum
 **/

VCC.Utils = function(){
	VCC.Utils =this;
};

/**
 * Work only for natural number > 0
 * @return {bool} true if nb is a power of two
 * @method isPowerOfTwo
 * @param {int} number to test
 */
VCC.Utils.prototype.isPowerOfTwo = function(nb){
	var tmp = nb-1;
	return (tmp & nb)=== 0;
};
