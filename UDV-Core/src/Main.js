import * as itowns from 'itowns';

// This is temporary, until we're able to build a vendor.js
// containing our dependencies.
export { itowns };

export { AuthenticationService }    from './Extensions/Authentication/services/AuthenticationService';

export { RequestService }           from './Utils/Request/RequestService';

export { GuidedTourController }     from './Modules/GuidedTour/GuidedTourController';

export { AuthenticationView }  from './Extensions/Authentication/views/AuthenticationView';

export { DocToValidateService }     from './Extensions/DocToValidate/services/DocToValidateService';
export { DocToValidateView }        from './Extensions/DocToValidate/views/DocToValidateView';

export { AboutWindow }              from './Modules/Others/About';
export { HelpWindow }               from './Modules/Others/Help';

export { TemporalController }       from './Modules/Temporal/Temporal';

export { DocumentController}        from './Modules/ConsultDoc/DocumentController';

export { ContributeController }     from './Extensions/Contribute/src/ContributeController';

export { DocumentCommentsService }  from './Extensions/DocumentComments/services/DocumentCommentsService';
export { DocumentCommentsWindow }   from './Extensions/DocumentComments/views/DocumentCommentsWindow';

export { GeocodingService }         from './Extensions/Geocoding/services/GeocodingService';
export { GeocodingView }            from './Extensions/Geocoding/views/GeocodingView';

export { LinkVisualizationService } from './Extensions/LinkVisualization/services/LinkVisualizationService';
export { LinkVisualizationWindow }    from './Extensions/LinkVisualization/views/LinkVisualizationWindow';