/** 
 * Copyright University of Lyon, 2012 - 2017
 * Distributed under the GNU Lesser General Public License Version 2.1 (LGPLv2)
 * (Refer to accompanying file License.md or copy at
 *  https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html )
 */

/**
 *
 *StategyManager Class, holds parameters of tile configurations and calls to strategy class methods
 *
 * @class ViewPort
*/
 VCC.StrategyManager = function(config){
 	

 	/**
    * strategy to be used for tile loading
    * @property strategy
    * @type VCC.Strategy
    */
 	this.strategy = new VCC.DefaultStrategy();
 	

 	/**
    * rangeCameraTile How far does we need to lead tiles wr to the main tile.
    * @property rangeCameraTile
    * @type int
    */
 	this.rangeCameraTile = config.rangeCameraTile;

 	/**
    * X coordinates of the tile that we want to create first
    * @property mainTileX
    * @type int
    */
 	this.mainTileX = config.mainTuileRow; 
 	/**
    * Y coordinates of the tile that we want to create first
    * @property mainTileY
    * @type int
    */
 	this.mainTileY = config.mainTuileCol; 
 	/**
    * At wich disdance do we load only DEM 
    * @property demDistance
    * @type int
    */
 	this.demDistance = config.demDistance;


 	/**
    * Are we in high altitude, used to remove building when reaching high altitudes
    * @property isHigh
    * @type boolean
    */
   this.isHigh = false;

   this.mockupMode = true;

   this.layerList = VCC.ViewPort.config.layersList;
 }

/**
  * calls to strategy tile priority to load 
  * @method tilePriorityManager
  */
 VCC.StrategyManager.prototype.tilePriorityManager = function (){
 	this.strategy.tilePriorityManager();
 }

/**
  * When going up, can remove some layers (the not mandatory ones)
  * @method updateViewableLayers
  */

 VCC.StrategyManager.prototype.updateViewableLayers = function(){
 	this.strategy.updateViewableLayers();
 }
