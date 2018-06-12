import * as itowns from 'itowns';
// This is temporary, until we're able to build a vendor.js
// containing our dependencies.
export { itowns };
export { Setup3DScene }         from './Setup3DScene';

export { DocumentsBrowser }     from './Modules/Contribute/DocumentsBrowser'; //used in DemoBrowser.html

export { DocumentsHandler }     from './Modules/Documents/DocumentsHandler'; //used in Demo.js

export { GuidedTourController } from './Modules/GuidedTour/GuidedTour';

export { AboutWindow }          from './Modules/Others/About';
export { CompassController }    from './Modules/Others/Compass';
export { HelpWindow }           from './Modules/Others/Help';
export { MiniMapController }    from './Modules/Others/MiniMap';

export { TemporalController }   from './Modules/Temporal/Temporal';
