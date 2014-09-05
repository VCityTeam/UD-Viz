/**
 *
 * @class VCC.Enum
 * @author Remi Baume
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
