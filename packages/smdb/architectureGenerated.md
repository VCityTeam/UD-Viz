```mermaid
flowchart
 subgraph IDsmdb["smdb"]
  IDsmdbArchitectureGenerated2emd["architectureGenerated.md"]
  IDsmdbPackage2ejson["package.json"]
  IDsmdbReadme2emd["Readme.md"]
  subgraph IDsmdbImg["img"]
   IDsmdbImgDependencies2epng["dependencies.png"]
   IDsmdbImgView2epng["view.png"]
  end
  subgraph IDsmdbSrc["src"]
   IDsmdbSrcIndex2ejs["index.js"]
   subgraph IDsmdbSrcAuthentication["Authentication"]
    subgraph IDsmdbSrcAuthenticationServices["services"]
     IDsmdbSrcAuthenticationServicesAuthenticationService2ejs["AuthenticationService.js"]
    end
    subgraph IDsmdbSrcAuthenticationViews["views"]
     IDsmdbSrcAuthenticationViewsAuthenticationView2ejs["AuthenticationView.js"]
    end
   end
   subgraph IDsmdbSrcComment["Comment"]
    IDsmdbSrcCommentDocumentCommentsModule2ejs["DocumentCommentsModule.js"]
    subgraph IDsmdbSrcCommentServices["services"]
     IDsmdbSrcCommentServicesDocumentCommentsService2ejs["DocumentCommentsService.js"]
    end
    subgraph IDsmdbSrcCommentViews["views"]
     IDsmdbSrcCommentViewsDocumentCommentsWindow2ejs["DocumentCommentsWindow.js"]
    end
   end
   subgraph IDsmdbSrcContribute["Contribute"]
    IDsmdbSrcContributeContributeModule2ejs["ContributeModule.js"]
    subgraph IDsmdbSrcContributeService["Service"]
     IDsmdbSrcContributeServiceContributeService2ejs["ContributeService.js"]
    end
    subgraph IDsmdbSrcContributeView["View"]
     IDsmdbSrcContributeViewDocumentCreationWindow2ejs["DocumentCreationWindow.js"]
     IDsmdbSrcContributeViewDocumentUpdateWindow2ejs["DocumentUpdateWindow.js"]
    end
   end
   subgraph IDsmdbSrcCore["Core"]
    IDsmdbSrcCoreDocumentModule2ejs["DocumentModule.js"]
    subgraph IDsmdbSrcCoreModel["Model"]
     IDsmdbSrcCoreModelDocument2ejs["Document.js"]
     IDsmdbSrcCoreModelDocumentService2ejs["DocumentService.js"]
    end
    subgraph IDsmdbSrcCoreView["View"]
     IDsmdbSrcCoreViewDocumentInspectorWindow2ejs["DocumentInspectorWindow.js"]
     IDsmdbSrcCoreViewDocumentNavigatorWindow2ejs["DocumentNavigatorWindow.js"]
     IDsmdbSrcCoreViewDocumentView2ejs["DocumentView.js"]
    end
    subgraph IDsmdbSrcCoreViewModel["ViewModel"]
     IDsmdbSrcCoreViewModelDocumentFilter2ejs["DocumentFilter.js"]
     IDsmdbSrcCoreViewModelDocumentProvider2ejs["DocumentProvider.js"]
     IDsmdbSrcCoreViewModelDocumentSearchFilter2ejs["DocumentSearchFilter.js"]
    end
   end
   subgraph IDsmdbSrcGuidedTour["GuidedTour"]
    IDsmdbSrcGuidedTourGuidedTour2ejs["GuidedTour.js"]
    IDsmdbSrcGuidedTourGuidedTourController2ejs["GuidedTourController.js"]
   end
   subgraph IDsmdbSrcValidation["Validation"]
    IDsmdbSrcValidationDocumentValidationModule2ejs["DocumentValidationModule.js"]
    subgraph IDsmdbSrcValidationService["Service"]
     IDsmdbSrcValidationServiceDocumentsInValidationSource2ejs["DocumentsInValidationSource.js"]
     IDsmdbSrcValidationServiceValidationService2ejs["ValidationService.js"]
    end
    subgraph IDsmdbSrcValidationView["View"]
     IDsmdbSrcValidationViewValidationView2ejs["ValidationView.js"]
    end
   end
   subgraph IDsmdbSrcVisualizer["Visualizer"]
    IDsmdbSrcVisualizerDocumentVisualizerWindow2ejs["DocumentVisualizerWindow.js"]
   end
  end
  subgraph IDsmdbTest["test"]
   IDsmdbTestTest5f12ejs["test_1.js"]
  end
 end
IDsmdbSrcIndex2ejs-.->|import|IDsmdbSrcCoreDocumentModule2ejs
IDsmdbSrcIndex2ejs-.->|import|IDsmdbSrcVisualizerDocumentVisualizerWindow2ejs
IDsmdbSrcIndex2ejs-.->|import|IDsmdbSrcContributeContributeModule2ejs
IDsmdbSrcIndex2ejs-.->|import|IDsmdbSrcValidationDocumentValidationModule2ejs
IDsmdbSrcIndex2ejs-.->|import|IDsmdbSrcCommentDocumentCommentsModule2ejs
IDsmdbSrcIndex2ejs-.->|import|IDsmdbSrcGuidedTourGuidedTourController2ejs
IDsmdbSrcIndex2ejs-.->|import|IDsmdbSrcAuthenticationViewsAuthenticationView2ejs
IDsmdbSrcIndex2ejs-.->|import|IDsmdbSrcAuthenticationServicesAuthenticationService2ejs
IDsmdbSrcAuthenticationViewsAuthenticationView2ejs-.->|import|IDsmdbSrcAuthenticationServicesAuthenticationService2ejs
IDsmdbSrcCommentDocumentCommentsModule2ejs-.->|import|IDsmdbSrcCommentServicesDocumentCommentsService2ejs
IDsmdbSrcCommentDocumentCommentsModule2ejs-.->|import|IDsmdbSrcCommentViewsDocumentCommentsWindow2ejs
IDsmdbSrcCommentDocumentCommentsModule2ejs-.->|import|IDsmdbSrcCoreViewModelDocumentProvider2ejs
IDsmdbSrcCommentServicesDocumentCommentsService2ejs-.->|import|IDsmdbSrcCoreViewModelDocumentProvider2ejs
IDsmdbSrcCommentViewsDocumentCommentsWindow2ejs-.->|import|IDsmdbSrcCommentServicesDocumentCommentsService2ejs
IDsmdbSrcContributeContributeModule2ejs-.->|import|IDsmdbSrcContributeViewDocumentCreationWindow2ejs
IDsmdbSrcContributeContributeModule2ejs-.->|import|IDsmdbSrcContributeViewDocumentUpdateWindow2ejs
IDsmdbSrcContributeContributeModule2ejs-.->|import|IDsmdbSrcContributeServiceContributeService2ejs
IDsmdbSrcContributeContributeModule2ejs-.->|import|IDsmdbSrcVisualizerDocumentVisualizerWindow2ejs
IDsmdbSrcContributeServiceContributeService2ejs-.->|import|IDsmdbSrcCoreViewModelDocumentProvider2ejs
IDsmdbSrcContributeServiceContributeService2ejs-.->|import|IDsmdbSrcCoreModelDocument2ejs
IDsmdbSrcContributeViewDocumentCreationWindow2ejs-.->|import|IDsmdbSrcVisualizerDocumentVisualizerWindow2ejs
IDsmdbSrcContributeViewDocumentCreationWindow2ejs-.->|import|IDsmdbSrcContributeServiceContributeService2ejs
IDsmdbSrcContributeViewDocumentUpdateWindow2ejs-.->|import|IDsmdbSrcCoreViewModelDocumentProvider2ejs
IDsmdbSrcContributeViewDocumentUpdateWindow2ejs-.->|import|IDsmdbSrcContributeServiceContributeService2ejs
IDsmdbSrcCoreDocumentModule2ejs-.->|import|IDsmdbSrcCoreModelDocumentService2ejs
IDsmdbSrcCoreDocumentModule2ejs-.->|import|IDsmdbSrcCoreViewModelDocumentProvider2ejs
IDsmdbSrcCoreDocumentModule2ejs-.->|import|IDsmdbSrcCoreViewDocumentView2ejs
IDsmdbSrcCoreModelDocumentService2ejs-.->|import|IDsmdbSrcCoreModelDocument2ejs
IDsmdbSrcCoreViewDocumentInspectorWindow2ejs-.->|import|IDsmdbSrcCoreViewModelDocumentProvider2ejs
IDsmdbSrcCoreViewDocumentInspectorWindow2ejs-.->|import|IDsmdbSrcCoreModelDocument2ejs
IDsmdbSrcCoreViewDocumentNavigatorWindow2ejs-.->|import|IDsmdbSrcCoreViewModelDocumentProvider2ejs
IDsmdbSrcCoreViewDocumentNavigatorWindow2ejs-.->|import|IDsmdbSrcCoreModelDocument2ejs
IDsmdbSrcCoreViewDocumentNavigatorWindow2ejs-.->|import|IDsmdbSrcCoreViewModelDocumentSearchFilter2ejs
IDsmdbSrcCoreViewDocumentView2ejs-.->|import|IDsmdbSrcCoreViewModelDocumentProvider2ejs
IDsmdbSrcCoreViewDocumentView2ejs-.->|import|IDsmdbSrcCoreViewDocumentNavigatorWindow2ejs
IDsmdbSrcCoreViewDocumentView2ejs-.->|import|IDsmdbSrcCoreViewDocumentInspectorWindow2ejs
IDsmdbSrcCoreViewModelDocumentFilter2ejs-.->|import|IDsmdbSrcCoreModelDocument2ejs
IDsmdbSrcCoreViewModelDocumentProvider2ejs-.->|import|IDsmdbSrcCoreModelDocumentService2ejs
IDsmdbSrcCoreViewModelDocumentProvider2ejs-.->|import|IDsmdbSrcCoreModelDocument2ejs
IDsmdbSrcCoreViewModelDocumentProvider2ejs-.->|import|IDsmdbSrcCoreViewModelDocumentFilter2ejs
IDsmdbSrcCoreViewModelDocumentSearchFilter2ejs-.->|import|IDsmdbSrcCoreViewModelDocumentFilter2ejs
IDsmdbSrcCoreViewModelDocumentSearchFilter2ejs-.->|import|IDsmdbSrcCoreModelDocument2ejs
IDsmdbSrcGuidedTourGuidedTourController2ejs-.->|import|IDsmdbSrcCoreDocumentModule2ejs
IDsmdbSrcValidationDocumentValidationModule2ejs-.->|import|IDsmdbSrcValidationServiceValidationService2ejs
IDsmdbSrcValidationDocumentValidationModule2ejs-.->|import|IDsmdbSrcValidationServiceDocumentsInValidationSource2ejs
IDsmdbSrcValidationDocumentValidationModule2ejs-.->|import|IDsmdbSrcValidationViewValidationView2ejs
IDsmdbSrcValidationServiceDocumentsInValidationSource2ejs-.->|import|IDsmdbSrcCoreModelDocumentService2ejs
IDsmdbSrcValidationServiceValidationService2ejs-.->|import|IDsmdbSrcCoreModelDocument2ejs
IDsmdbSrcValidationViewValidationView2ejs-.->|import|IDsmdbSrcCoreModelDocumentService2ejs
IDsmdbSrcValidationViewValidationView2ejs-.->|import|IDsmdbSrcValidationServiceValidationService2ejs
IDsmdbSrcValidationViewValidationView2ejs-.->|import|IDsmdbSrcValidationServiceDocumentsInValidationSource2ejs
IDsmdbSrcVisualizerDocumentVisualizerWindow2ejs-.->|import|IDsmdbSrcCoreViewModelDocumentProvider2ejs
```