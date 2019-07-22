import * as itowns from 'itowns';

// This is temporary, until we're able to build a vendor.js
// containing our dependencies.
export { itowns };

export { AuthenticationService }    from './Extensions/Authentication/services/AuthenticationService';

export { RequestService }           from './Utils/Request/RequestService';

export { GuidedTourController }     from './Modules/GuidedTour/GuidedTourController';

export { AuthenticationView }  from './Extensions/Authentication/views/AuthenticationView';

export { AboutWindow }              from './Modules/Others/About';
export { HelpWindow }               from './Modules/Others/Help';

export { TemporalController }       from './Modules/Temporal/Temporal';

export { ContributeController }     from './Extensions/Contribute/src/ContributeController';

export { DocumentComments }         from './Extensions/DocumentComments/DocumentComments';

export { GeocodingService }         from './Extensions/Geocoding/services/GeocodingService';
export { GeocodingView }            from './Extensions/Geocoding/views/GeocodingView';

export { Debug3DTilesWindow }       from './Extensions/3DTilesDebug/views/3DTilesDebugWindow';

export { DocumentModule }           from './Modules/Documents/DocumentModule';
export { DocumentImageOrienter }    from './Modules/DocumentVisualizer/View/DocumentImageOrienter';

export { CameraPositioner }         from './Modules/CameraPositioner/CameraPositioner';

export { ContributeModule }         from './Extensions/Contribute/ContributeModule';
export { DocumentValidation }       from './Extensions/DocumentValidation/DocumentValidation';

export { LinkModule }               from './Modules/Links/LinkModule';