/**
 * Copyright University of Lyon, 2012 - 2017
 * Distributed under the GNU Lesser General Public License Version 2.1 (LGPLv2)
 * (Refer to accompanying file License.md or copy at
 *  https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html )
 */

/**
 * @class VCC.SchedulerTask
 * @constructor 
 **/

VCC.SchedulerTask = function(_taskCode, _tileRow, _tileCol, _params){
	
	this.taskCode =_taskCode;
	this.tileRow = _tileRow;
	this.tileCol = _tileCol;
	this.params =_params;

	
}

VCC.SchedulerTask.prototype.addToScheduler= function(hasHighPriority){
	
	VCC.ViewPort.tileManager.scheduler.addTaskToScheduler(this,hasHighPriority);

}
