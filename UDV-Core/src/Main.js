import * as itowns from 'itowns';

// This is temporary, until we're able to build a vendor.js
// containing our dependencies.
export { itowns };

export { AuthenticationService }    from './Extensions/Authentication/services/AuthenticationService';

export { RequestService }           from './Utils/Request/RequestService';

export { GuidedTourController }     from './Modules/GuidedTour/GuidedTourController';

export { AuthenticationView }       from './Extensions/Authentication/views/AuthenticationView';

export { AboutWindow }              from './Modules/Others/About';
export { HelpWindow }               from './Modules/Others/Help';

export { TemporalController }       from './Modules/Temporal/Temporal';

export { ContributeController }     from './Extensions/Contribute/src/ContributeController';

export { DocumentCommentsModule }   from './Extensions/DocumentComments/DocumentCommentsModule';

export { GeocodingService }         from './Extensions/Geocoding/services/GeocodingService';
export { GeocodingView }            from './Extensions/Geocoding/views/GeocodingView';

export { Debug3DTilesWindow }       from './Extensions/3DTilesDebug/views/3DTilesDebugWindow';

export { DocumentModule }           from './Modules/Documents/DocumentModule';
export { DocumentVisualizerWindow } from './Modules/DocumentVisualizer/View/DocumentVisualizerWindow';

export { CameraPositionerView }     from './Modules/CameraPositioner/View/CameraPositionerView';

export { ContributeModule }         from './Extensions/Contribute/ContributeModule';
export { DocumentValidationModule } from './Extensions/DocumentValidation/DocumentValidationModule';

export { LinkModule }               from './Modules/Links/LinkModule';