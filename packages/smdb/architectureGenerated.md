```mermaid
flowchart
 subgraph IDsrc["src"]
  IDsrcIndex2ejs["index.js"]
  subgraph IDsrcAuthentication["Authentication"]
   subgraph IDsrcAuthenticationServices["services"]
    IDsrcAuthenticationServicesAuthenticationService2ejs["AuthenticationService.js"]
   end
   subgraph IDsrcAuthenticationViews["views"]
    IDsrcAuthenticationViewsAuthenticationView2ejs["AuthenticationView.js"]
   end
  end
  subgraph IDsrcComment["Comment"]
   IDsrcCommentDocumentCommentsModule2ejs["DocumentCommentsModule.js"]
   subgraph IDsrcCommentServices["services"]
    IDsrcCommentServicesDocumentCommentsService2ejs["DocumentCommentsService.js"]
   end
   subgraph IDsrcCommentViews["views"]
    IDsrcCommentViewsDocumentCommentsWindow2ejs["DocumentCommentsWindow.js"]
   end
  end
  subgraph IDsrcContribute["Contribute"]
   IDsrcContributeContributeModule2ejs["ContributeModule.js"]
   subgraph IDsrcContributeService["Service"]
    IDsrcContributeServiceContributeService2ejs["ContributeService.js"]
   end
   subgraph IDsrcContributeView["View"]
    IDsrcContributeViewDocumentCreationWindow2ejs["DocumentCreationWindow.js"]
    IDsrcContributeViewDocumentUpdateWindow2ejs["DocumentUpdateWindow.js"]
   end
  end
  subgraph IDsrcCore["Core"]
   IDsrcCoreDocumentModule2ejs["DocumentModule.js"]
   subgraph IDsrcCoreModel["Model"]
    IDsrcCoreModelDocument2ejs["Document.js"]
    IDsrcCoreModelDocumentService2ejs["DocumentService.js"]
   end
   subgraph IDsrcCoreView["View"]
    IDsrcCoreViewDocumentInspectorWindow2ejs["DocumentInspectorWindow.js"]
    IDsrcCoreViewDocumentNavigatorWindow2ejs["DocumentNavigatorWindow.js"]
    IDsrcCoreViewDocumentView2ejs["DocumentView.js"]
   end
   subgraph IDsrcCoreViewModel["ViewModel"]
    IDsrcCoreViewModelDocumentFilter2ejs["DocumentFilter.js"]
    IDsrcCoreViewModelDocumentProvider2ejs["DocumentProvider.js"]
    IDsrcCoreViewModelDocumentSearchFilter2ejs["DocumentSearchFilter.js"]
   end
  end
  subgraph IDsrcGuidedTour["GuidedTour"]
   IDsrcGuidedTourGuidedTour2ejs["GuidedTour.js"]
   IDsrcGuidedTourGuidedTourController2ejs["GuidedTourController.js"]
  end
  subgraph IDsrcValidation["Validation"]
   IDsrcValidationDocumentValidationModule2ejs["DocumentValidationModule.js"]
   subgraph IDsrcValidationService["Service"]
    IDsrcValidationServiceDocumentsInValidationSource2ejs["DocumentsInValidationSource.js"]
    IDsrcValidationServiceValidationService2ejs["ValidationService.js"]
   end
   subgraph IDsrcValidationView["View"]
    IDsrcValidationViewValidationView2ejs["ValidationView.js"]
   end
  end
  subgraph IDsrcVisualizer["Visualizer"]
   IDsrcVisualizerDocumentVisualizerWindow2ejs["DocumentVisualizerWindow.js"]
  end
 end
IDsrcIndex2ejs-.->|import|IDsrcCoreDocumentModule2ejs
IDsrcIndex2ejs-.->|import|IDsrcVisualizerDocumentVisualizerWindow2ejs
IDsrcIndex2ejs-.->|import|IDsrcContributeContributeModule2ejs
IDsrcIndex2ejs-.->|import|IDsrcValidationDocumentValidationModule2ejs
IDsrcIndex2ejs-.->|import|IDsrcCommentDocumentCommentsModule2ejs
IDsrcIndex2ejs-.->|import|IDsrcGuidedTourGuidedTourController2ejs
IDsrcIndex2ejs-.->|import|IDsrcAuthenticationViewsAuthenticationView2ejs
IDsrcIndex2ejs-.->|import|IDsrcAuthenticationServicesAuthenticationService2ejs
IDsrcAuthenticationViewsAuthenticationView2ejs-.->|import|IDsrcAuthenticationServicesAuthenticationService2ejs
IDsrcCommentDocumentCommentsModule2ejs-.->|import|IDsrcCommentServicesDocumentCommentsService2ejs
IDsrcCommentDocumentCommentsModule2ejs-.->|import|IDsrcCommentViewsDocumentCommentsWindow2ejs
IDsrcCommentDocumentCommentsModule2ejs-.->|import|IDsrcCoreViewModelDocumentProvider2ejs
IDsrcCommentServicesDocumentCommentsService2ejs-.->|import|IDsrcCoreViewModelDocumentProvider2ejs
IDsrcCommentViewsDocumentCommentsWindow2ejs-.->|import|IDsrcCommentServicesDocumentCommentsService2ejs
IDsrcContributeContributeModule2ejs-.->|import|IDsrcContributeViewDocumentCreationWindow2ejs
IDsrcContributeContributeModule2ejs-.->|import|IDsrcContributeViewDocumentUpdateWindow2ejs
IDsrcContributeContributeModule2ejs-.->|import|IDsrcContributeServiceContributeService2ejs
IDsrcContributeContributeModule2ejs-.->|import|IDsrcVisualizerDocumentVisualizerWindow2ejs
IDsrcContributeServiceContributeService2ejs-.->|import|IDsrcCoreViewModelDocumentProvider2ejs
IDsrcContributeServiceContributeService2ejs-.->|import|IDsrcCoreModelDocument2ejs
IDsrcContributeViewDocumentCreationWindow2ejs-.->|import|IDsrcVisualizerDocumentVisualizerWindow2ejs
IDsrcContributeViewDocumentCreationWindow2ejs-.->|import|IDsrcContributeServiceContributeService2ejs
IDsrcContributeViewDocumentUpdateWindow2ejs-.->|import|IDsrcCoreViewModelDocumentProvider2ejs
IDsrcContributeViewDocumentUpdateWindow2ejs-.->|import|IDsrcContributeServiceContributeService2ejs
IDsrcCoreDocumentModule2ejs-.->|import|IDsrcCoreModelDocumentService2ejs
IDsrcCoreDocumentModule2ejs-.->|import|IDsrcCoreViewModelDocumentProvider2ejs
IDsrcCoreDocumentModule2ejs-.->|import|IDsrcCoreViewDocumentView2ejs
IDsrcCoreModelDocumentService2ejs-.->|import|IDsrcCoreModelDocument2ejs
IDsrcCoreViewDocumentInspectorWindow2ejs-.->|import|IDsrcCoreViewModelDocumentProvider2ejs
IDsrcCoreViewDocumentInspectorWindow2ejs-.->|import|IDsrcCoreModelDocument2ejs
IDsrcCoreViewDocumentNavigatorWindow2ejs-.->|import|IDsrcCoreViewModelDocumentProvider2ejs
IDsrcCoreViewDocumentNavigatorWindow2ejs-.->|import|IDsrcCoreModelDocument2ejs
IDsrcCoreViewDocumentNavigatorWindow2ejs-.->|import|IDsrcCoreViewModelDocumentSearchFilter2ejs
IDsrcCoreViewDocumentView2ejs-.->|import|IDsrcCoreViewModelDocumentProvider2ejs
IDsrcCoreViewDocumentView2ejs-.->|import|IDsrcCoreViewDocumentNavigatorWindow2ejs
IDsrcCoreViewDocumentView2ejs-.->|import|IDsrcCoreViewDocumentInspectorWindow2ejs
IDsrcCoreViewModelDocumentFilter2ejs-.->|import|IDsrcCoreModelDocument2ejs
IDsrcCoreViewModelDocumentProvider2ejs-.->|import|IDsrcCoreModelDocumentService2ejs
IDsrcCoreViewModelDocumentProvider2ejs-.->|import|IDsrcCoreModelDocument2ejs
IDsrcCoreViewModelDocumentProvider2ejs-.->|import|IDsrcCoreViewModelDocumentFilter2ejs
IDsrcCoreViewModelDocumentSearchFilter2ejs-.->|import|IDsrcCoreViewModelDocumentFilter2ejs
IDsrcCoreViewModelDocumentSearchFilter2ejs-.->|import|IDsrcCoreModelDocument2ejs
IDsrcGuidedTourGuidedTourController2ejs-.->|import|IDsrcCoreDocumentModule2ejs
IDsrcValidationDocumentValidationModule2ejs-.->|import|IDsrcValidationServiceValidationService2ejs
IDsrcValidationDocumentValidationModule2ejs-.->|import|IDsrcValidationServiceDocumentsInValidationSource2ejs
IDsrcValidationDocumentValidationModule2ejs-.->|import|IDsrcValidationViewValidationView2ejs
IDsrcValidationServiceDocumentsInValidationSource2ejs-.->|import|IDsrcCoreModelDocumentService2ejs
IDsrcValidationServiceValidationService2ejs-.->|import|IDsrcCoreModelDocument2ejs
IDsrcValidationViewValidationView2ejs-.->|import|IDsrcCoreModelDocumentService2ejs
IDsrcValidationViewValidationView2ejs-.->|import|IDsrcValidationServiceValidationService2ejs
IDsrcValidationViewValidationView2ejs-.->|import|IDsrcValidationServiceDocumentsInValidationSource2ejs
IDsrcVisualizerDocumentVisualizerWindow2ejs-.->|import|IDsrcCoreViewModelDocumentProvider2ejs
```