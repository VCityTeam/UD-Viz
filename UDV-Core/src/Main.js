import * as itowns from 'itowns';
// This is temporary, until we're able to build a vendor.js
// containing our dependencies.
export { itowns };
export { Setup3DScene }             from './Setup3DScene';

export { AuthenticationService }    from './Extensions/Authentication/src/AuthenticationService';

export { RequestService }           from './Modules/Request/RequestService';

export { GuidedTourController }     from './Modules/GuidedTour/GuidedTourController';

export { AuthenticationController } from './Extensions/Authentication/src/AuthenticationController';
export { LoginRegistrationWindow }  from './Extensions/Authentication/LoginRegistration';

export { DocToValidateService }     from './Extensions/DocToValidate/services/DocToValidateService';
export { DocToValidateView }      from './Extensions/DocToValidate/views/DocToValidateView';

export { AboutWindow }              from './Modules/Others/About';
export { CompassController }        from './Modules/Others/Compass';
export { HelpWindow }               from './Modules/Others/Help';
export { MiniMapController }        from './Modules/Others/MiniMap';

export { TemporalController }       from './Modules/Temporal/Temporal';

export { DocumentController}        from './Modules/ConsultDoc/DocumentController';

export { ContributeController }     from './Extensions/Contribute/src/ContributeController';

