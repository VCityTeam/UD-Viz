import * as itowns from 'itowns';
// This is temporary, until we're able to build a vendor.js
// containing our dependencies.
export { itowns };
export { Setup3DScene }             from './Setup3DScene';

export { AuthenticationService }    from './Extensions/Authentication/services/AuthenticationService';

export { RequestService }           from './Utils/Request/RequestService';

export { GuidedTourController }     from './Modules/GuidedTour/GuidedTourController';

export { LoginRegistrationWindow }  from './Extensions/Authentication/views/AuthenticationView';

export { DocToValidateService }     from './Extensions/DocToValidate/services/DocToValidateService';
export { DocToValidateView }      from './Extensions/DocToValidate/views/DocToValidateView';

export { AboutWindow }              from './Modules/Others/About';
export { CompassController }        from './Modules/Others/Compass';
export { HelpWindow }               from './Modules/Others/Help';
export { MiniMapController }        from './Modules/Others/MiniMap';

export { TemporalController }       from './Modules/Temporal/Temporal';

export { DocumentController}        from './Modules/ConsultDoc/DocumentController';

export { ContributeController }     from './Extensions/Contribute/src/ContributeController';

export { DocumentCommentsService }  from './Extensions/DocumentComments/services/DocumentCommentsService';
export { DocumentCommentsWindow }   from './Extensions/DocumentComments/views/DocumentCommentsWindow';