
/**
 * 
 * @class VCC.SchedulerTask
 * @author Remi Baume
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
