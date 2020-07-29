import { Window } from "../../../Utils/GUI/js/Window";
import './TemporalWindow.css';

// TODO: MANAGE DATES WITH MOMENT

/**
 * Constructor for TemporalWindow Class
 * Handles the GUI part enabling the user to specify the chosen "time" (moment or
 * date) of observation for displayal of the (3D) scene.
 * Note that it is not the Temporal View's responsability to
 * alter/modify/update the scene according to the user specified moment (but
 * only to trigger the possible hook-ups).
 * This View represents a timestamp with the Moment.js library.
 * @param refreshCallback : callback to be called when the time has changed.
 * @param options : optional parameters (min time, max time and current time)
 */
export class TemporalWindow extends Window {
    constructor(module_name, window_name, bool) {
        super(module_name, window_name, bool);
    }

    get innerContentHtml() {
    // TO OVERRIDE
    }

    windowTemplateCreation() {
    // TO OVERRIDE
    }

    // change the current date and sync the temporal version to this new date
    changeTime(time) {
    // TO OVERRIDE
    }
}
