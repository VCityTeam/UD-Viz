```mermaid
flowchart
 subgraph IDWidget["Widget"]
  IDWidgetC3DTilesjs["C3DTiles.js"]
  IDWidgetPlanarControlsjs["PlanarControls.js"]
  IDWidgetWidgetjs["Widget.js"]
  subgraph IDWidgetBaseMap["BaseMap"]
   IDWidgetBaseMapBaseMapWindowjs["BaseMapWindow.js"]
  end
  subgraph IDWidgetCameraPositioner["CameraPositioner"]
   IDWidgetCameraPositionerCameraPositionerjs["CameraPositioner.js"]
  end
  subgraph IDWidgetLayerChoice["LayerChoice"]
   subgraph IDWidgetLayerChoiceViews["views"]
    IDWidgetLayerChoiceViewsLayerChoicejs["LayerChoice.js"]
   end
  end
  subgraph IDWidgetServer["Server"]
   IDWidgetServerServerjs["Server.js"]
   subgraph IDWidgetServerAuthentication["Authentication"]
    subgraph IDWidgetServerAuthenticationServices["services"]
     IDWidgetServerAuthenticationServicesAuthenticationServicejs["AuthenticationService.js"]
    end
    subgraph IDWidgetServerAuthenticationViews["views"]
     IDWidgetServerAuthenticationViewsAuthenticationViewcss["AuthenticationView.css"]
     IDWidgetServerAuthenticationViewsAuthenticationViewjs["AuthenticationView.js"]
    end
   end
   subgraph IDWidgetServerDocument["Document"]
    IDWidgetServerDocumentDocumentjs["Document.js"]
    subgraph IDWidgetServerDocumentComment["Comment"]
     IDWidgetServerDocumentCommentDocumentCommentsModulejs["DocumentCommentsModule.js"]
     subgraph IDWidgetServerDocumentCommentServices["services"]
      IDWidgetServerDocumentCommentServicesDocumentCommentsServicejs["DocumentCommentsService.js"]
     end
     subgraph IDWidgetServerDocumentCommentViews["views"]
      IDWidgetServerDocumentCommentViewsDocumentCommentsStylecss["DocumentCommentsStyle.css"]
      IDWidgetServerDocumentCommentViewsDocumentCommentsWindowjs["DocumentCommentsWindow.js"]
     end
    end
    subgraph IDWidgetServerDocumentContribute["Contribute"]
     IDWidgetServerDocumentContributeContributeModulejs["ContributeModule.js"]
     subgraph IDWidgetServerDocumentContributeService["Service"]
      IDWidgetServerDocumentContributeServiceContributeServicejs["ContributeService.js"]
     end
     subgraph IDWidgetServerDocumentContributeView["View"]
      IDWidgetServerDocumentContributeViewContributecss["Contribute.css"]
      IDWidgetServerDocumentContributeViewDocumentCreationWindowjs["DocumentCreationWindow.js"]
      IDWidgetServerDocumentContributeViewDocumentUpdateWindowjs["DocumentUpdateWindow.js"]
     end
    end
    subgraph IDWidgetServerDocumentCore["Core"]
     IDWidgetServerDocumentCoreDocumentModulejs["DocumentModule.js"]
     subgraph IDWidgetServerDocumentCoreModel["Model"]
      IDWidgetServerDocumentCoreModelDocumentjs["Document.js"]
      IDWidgetServerDocumentCoreModelDocumentServicejs["DocumentService.js"]
     end
     subgraph IDWidgetServerDocumentCoreView["View"]
      IDWidgetServerDocumentCoreViewDocumentInspectorWindowjs["DocumentInspectorWindow.js"]
      IDWidgetServerDocumentCoreViewDocumentNavigatorWindowjs["DocumentNavigatorWindow.js"]
      IDWidgetServerDocumentCoreViewDocumentViewjs["DocumentView.js"]
      IDWidgetServerDocumentCoreViewDocumentWindowcss["DocumentWindow.css"]
     end
     subgraph IDWidgetServerDocumentCoreViewModel["ViewModel"]
      IDWidgetServerDocumentCoreViewModelDocumentFilterjs["DocumentFilter.js"]
      IDWidgetServerDocumentCoreViewModelDocumentProviderjs["DocumentProvider.js"]
      IDWidgetServerDocumentCoreViewModelDocumentSearchFilterjs["DocumentSearchFilter.js"]
     end
    end
    subgraph IDWidgetServerDocumentGuidedTour["GuidedTour"]
     IDWidgetServerDocumentGuidedTourGuidedTourcss["GuidedTour.css"]
     IDWidgetServerDocumentGuidedTourGuidedTourjs["GuidedTour.js"]
     IDWidgetServerDocumentGuidedTourGuidedTourControllerjs["GuidedTourController.js"]
    end
    subgraph IDWidgetServerDocumentValidation["Validation"]
     IDWidgetServerDocumentValidationDocumentValidationModulejs["DocumentValidationModule.js"]
     subgraph IDWidgetServerDocumentValidationService["Service"]
      IDWidgetServerDocumentValidationServiceDocumentsInValidationSourcejs["DocumentsInValidationSource.js"]
      IDWidgetServerDocumentValidationServiceValidationServicejs["ValidationService.js"]
     end
     subgraph IDWidgetServerDocumentValidationView["View"]
      IDWidgetServerDocumentValidationViewValidationViewjs["ValidationView.js"]
     end
    end
    subgraph IDWidgetServerDocumentVisualizer["Visualizer"]
     subgraph IDWidgetServerDocumentVisualizerView["View"]
      IDWidgetServerDocumentVisualizerViewDocumentVisualizercss["DocumentVisualizer.css"]
      IDWidgetServerDocumentVisualizerViewDocumentVisualizerWindowjs["DocumentVisualizerWindow.js"]
     end
    end
   end
   subgraph IDWidgetServerGeocoding["Geocoding"]
    subgraph IDWidgetServerGeocodingServices["services"]
     IDWidgetServerGeocodingServicesGeocodingServicejs["GeocodingService.js"]
    end
    subgraph IDWidgetServerGeocodingViews["views"]
     IDWidgetServerGeocodingViewsGeocodingStylecss["GeocodingStyle.css"]
     IDWidgetServerGeocodingViewsGeocodingViewjs["GeocodingView.js"]
    end
   end
   subgraph IDWidgetServerSPARQL["SPARQL"]
    subgraph IDWidgetServerSPARQLModel["Model"]
     IDWidgetServerSPARQLModelGraphjs["Graph.js"]
     IDWidgetServerSPARQLModelTablejs["Table.js"]
     IDWidgetServerSPARQLModelURIjs["URI.js"]
    end
    subgraph IDWidgetServerSPARQLService["Service"]
     IDWidgetServerSPARQLServiceSparqlEndpointResponseProviderjs["SparqlEndpointResponseProvider.js"]
     IDWidgetServerSPARQLServiceSparqlEndpointServicejs["SparqlEndpointService.js"]
    end
    subgraph IDWidgetServerSPARQLView["View"]
     IDWidgetServerSPARQLViewJsonRendererjs["JsonRenderer.js"]
     IDWidgetServerSPARQLViewSparqlQueryWindowcss["SparqlQueryWindow.css"]
     IDWidgetServerSPARQLViewSparqlQueryWindowjs["SparqlQueryWindow.js"]
    end
   end
  end
  subgraph IDWidgetSlideShow["SlideShow"]
   IDWidgetSlideShowSlideShowjs["SlideShow.js"]
  end
  subgraph IDWidgetTemporal["Temporal"]
   IDWidgetTemporalTemporaljs["Temporal.js"]
   subgraph IDWidgetTemporalModel["Model"]
    IDWidgetTemporalModel3DTemporalBatchTablejs["3DTemporalBatchTable.js"]
    IDWidgetTemporalModel3DTemporalBoundingVolumejs["3DTemporalBoundingVolume.js"]
    IDWidgetTemporalModel3DTemporalPrimaryTransactionjs["3DTemporalPrimaryTransaction.js"]
    IDWidgetTemporalModel3DTemporalTilesetjs["3DTemporalTileset.js"]
    IDWidgetTemporalModel3DTemporalTransactionjs["3DTemporalTransaction.js"]
    IDWidgetTemporalModel3DTemporalTransactionAggregatejs["3DTemporalTransactionAggregate.js"]
    IDWidgetTemporalModel3DTemporalVersionjs["3DTemporalVersion.js"]
    subgraph IDWidgetTemporalModelJsonSchemas["jsonSchemas"]
     IDWidgetTemporalModelJsonSchemas3DTILEStemporalbatchTableschemajson["3DTILES_temporal.batchTable.schema.json"]
     IDWidgetTemporalModelJsonSchemas3DTILEStemporalboundingVolumeschemajson["3DTILES_temporal.boundingVolume.schema.json"]
     IDWidgetTemporalModelJsonSchemas3DTILEStemporalprimaryTransactionjson["3DTILES_temporal.primaryTransaction.json"]
     IDWidgetTemporalModelJsonSchemas3DTILEStemporaltilesetschemajson["3DTILES_temporal.tileset.schema.json"]
     IDWidgetTemporalModelJsonSchemas3DTILEStemporaltransactionschemajson["3DTILES_temporal.transaction.schema.json"]
     IDWidgetTemporalModelJsonSchemas3DTILEStemporaltransactionAggregateschemajson["3DTILES_temporal.transactionAggregate.schema.json"]
     IDWidgetTemporalModelJsonSchemas3DTILEStemporalversionschemaschemajson["3DTILES_temporal.version.schema.schema.json"]
     IDWidgetTemporalModelJsonSchemas3DTILEStemporalversionTransitionschemajson["3DTILES_temporal.versionTransition.schema.json"]
    end
   end
  end
 end
IDWidgetWidgetjs-.->|import|IDWidgetTemporalTemporaljs
IDWidgetWidgetjs-.->|import|IDWidgetServerServerjs
IDWidgetServerServerjs-.->|import|IDWidgetServerDocumentDocumentjs
IDWidgetServerAuthenticationViewsAuthenticationViewjs-.->|import|IDWidgetServerAuthenticationServicesAuthenticationServicejs
IDWidgetServerDocumentCommentDocumentCommentsModulejs-.->|import|IDWidgetServerDocumentCommentServicesDocumentCommentsServicejs
IDWidgetServerDocumentCommentDocumentCommentsModulejs-.->|import|IDWidgetServerDocumentCommentViewsDocumentCommentsWindowjs
IDWidgetServerDocumentCommentDocumentCommentsModulejs-.->|import|IDWidgetServerDocumentCoreViewModelDocumentProviderjs
IDWidgetServerDocumentCommentServicesDocumentCommentsServicejs-.->|import|IDWidgetServerDocumentCoreViewModelDocumentProviderjs
IDWidgetServerDocumentCommentViewsDocumentCommentsWindowjs-.->|import|IDWidgetServerDocumentCommentServicesDocumentCommentsServicejs
IDWidgetServerDocumentContributeContributeModulejs-.->|import|IDWidgetServerDocumentContributeViewDocumentCreationWindowjs
IDWidgetServerDocumentContributeContributeModulejs-.->|import|IDWidgetServerDocumentContributeViewDocumentUpdateWindowjs
IDWidgetServerDocumentContributeContributeModulejs-.->|import|IDWidgetServerDocumentContributeServiceContributeServicejs
IDWidgetServerDocumentContributeContributeModulejs-.->|import|IDWidgetServerDocumentVisualizerViewDocumentVisualizerWindowjs
IDWidgetServerDocumentContributeServiceContributeServicejs-.->|import|IDWidgetServerDocumentCoreViewModelDocumentProviderjs
IDWidgetServerDocumentContributeServiceContributeServicejs-.->|import|IDWidgetServerDocumentCoreModelDocumentjs
IDWidgetServerDocumentContributeViewDocumentCreationWindowjs-.->|import|IDWidgetServerDocumentVisualizerViewDocumentVisualizerWindowjs
IDWidgetServerDocumentContributeViewDocumentCreationWindowjs-.->|import|IDWidgetCameraPositionerCameraPositionerjs
IDWidgetServerDocumentContributeViewDocumentCreationWindowjs-.->|import|IDWidgetServerDocumentContributeServiceContributeServicejs
IDWidgetServerDocumentContributeViewDocumentUpdateWindowjs-.->|import|IDWidgetServerDocumentCoreViewModelDocumentProviderjs
IDWidgetServerDocumentContributeViewDocumentUpdateWindowjs-.->|import|IDWidgetServerDocumentContributeServiceContributeServicejs
IDWidgetServerDocumentCoreDocumentModulejs-.->|import|IDWidgetServerDocumentCoreModelDocumentServicejs
IDWidgetServerDocumentCoreDocumentModulejs-.->|import|IDWidgetServerDocumentCoreViewModelDocumentProviderjs
IDWidgetServerDocumentCoreDocumentModulejs-.->|import|IDWidgetServerDocumentCoreViewDocumentViewjs
IDWidgetServerDocumentCoreModelDocumentServicejs-.->|import|IDWidgetServerDocumentCoreModelDocumentjs
IDWidgetServerDocumentCoreViewDocumentInspectorWindowjs-.->|import|IDWidgetServerDocumentCoreViewModelDocumentProviderjs
IDWidgetServerDocumentCoreViewDocumentInspectorWindowjs-.->|import|IDWidgetServerDocumentCoreModelDocumentjs
IDWidgetServerDocumentCoreViewDocumentNavigatorWindowjs-.->|import|IDWidgetServerDocumentCoreViewModelDocumentProviderjs
IDWidgetServerDocumentCoreViewDocumentNavigatorWindowjs-.->|import|IDWidgetServerDocumentCoreModelDocumentjs
IDWidgetServerDocumentCoreViewDocumentNavigatorWindowjs-.->|import|IDWidgetServerDocumentCoreViewModelDocumentSearchFilterjs
IDWidgetServerDocumentCoreViewDocumentViewjs-.->|import|IDWidgetServerDocumentCoreViewModelDocumentProviderjs
IDWidgetServerDocumentCoreViewDocumentViewjs-.->|import|IDWidgetServerDocumentCoreViewDocumentNavigatorWindowjs
IDWidgetServerDocumentCoreViewDocumentViewjs-.->|import|IDWidgetServerDocumentCoreViewDocumentInspectorWindowjs
IDWidgetServerDocumentCoreViewModelDocumentFilterjs-.->|import|IDWidgetServerDocumentCoreModelDocumentjs
IDWidgetServerDocumentCoreViewModelDocumentProviderjs-.->|import|IDWidgetServerDocumentCoreModelDocumentServicejs
IDWidgetServerDocumentCoreViewModelDocumentProviderjs-.->|import|IDWidgetServerDocumentCoreModelDocumentjs
IDWidgetServerDocumentCoreViewModelDocumentProviderjs-.->|import|IDWidgetServerDocumentCoreViewModelDocumentFilterjs
IDWidgetServerDocumentCoreViewModelDocumentSearchFilterjs-.->|import|IDWidgetServerDocumentCoreViewModelDocumentFilterjs
IDWidgetServerDocumentCoreViewModelDocumentSearchFilterjs-.->|import|IDWidgetServerDocumentCoreModelDocumentjs
IDWidgetServerDocumentGuidedTourGuidedTourControllerjs-.->|import|IDWidgetServerDocumentCoreDocumentModulejs
IDWidgetServerDocumentValidationDocumentValidationModulejs-.->|import|IDWidgetServerDocumentValidationServiceValidationServicejs
IDWidgetServerDocumentValidationDocumentValidationModulejs-.->|import|IDWidgetServerDocumentValidationServiceDocumentsInValidationSourcejs
IDWidgetServerDocumentValidationDocumentValidationModulejs-.->|import|IDWidgetServerDocumentValidationViewValidationViewjs
IDWidgetServerDocumentValidationServiceDocumentsInValidationSourcejs-.->|import|IDWidgetServerDocumentCoreModelDocumentServicejs
IDWidgetServerDocumentValidationServiceValidationServicejs-.->|import|IDWidgetServerDocumentCoreModelDocumentjs
IDWidgetServerDocumentValidationViewValidationViewjs-.->|import|IDWidgetServerDocumentCoreModelDocumentServicejs
IDWidgetServerDocumentValidationViewValidationViewjs-.->|import|IDWidgetServerDocumentValidationServiceValidationServicejs
IDWidgetServerDocumentValidationViewValidationViewjs-.->|import|IDWidgetServerDocumentValidationServiceDocumentsInValidationSourcejs
IDWidgetServerDocumentVisualizerViewDocumentVisualizerWindowjs-.->|import|IDWidgetServerDocumentCoreViewModelDocumentProviderjs
IDWidgetServerGeocodingViewsGeocodingViewjs-.->|import|IDWidgetServerGeocodingServicesGeocodingServicejs
IDWidgetServerSPARQLModelGraphjs-.->|import|IDWidgetServerSPARQLModelURIjs
IDWidgetServerSPARQLModelGraphjs-.->|import|IDWidgetServerSPARQLViewSparqlQueryWindowjs
IDWidgetServerSPARQLModelTablejs-.->|import|IDWidgetServerSPARQLViewSparqlQueryWindowjs
IDWidgetServerSPARQLServiceSparqlEndpointResponseProviderjs-.->|import|IDWidgetServerSPARQLServiceSparqlEndpointServicejs
IDWidgetServerSPARQLViewSparqlQueryWindowjs-.->|import|IDWidgetServerSPARQLServiceSparqlEndpointResponseProviderjs
IDWidgetServerSPARQLViewSparqlQueryWindowjs-.->|import|IDWidgetServerSPARQLModelGraphjs
IDWidgetServerSPARQLViewSparqlQueryWindowjs-.->|import|IDWidgetServerSPARQLModelTablejs
IDWidgetServerSPARQLViewSparqlQueryWindowjs-.->|import|IDWidgetServerSPARQLModelURIjs
IDWidgetServerSPARQLViewSparqlQueryWindowjs-.->|import|IDWidgetServerSPARQLViewJsonRendererjs
IDWidgetTemporalTemporaljs-.->|import|IDWidgetTemporalModel3DTemporalBatchTablejs
IDWidgetTemporalTemporaljs-.->|import|IDWidgetTemporalModel3DTemporalBoundingVolumejs
IDWidgetTemporalTemporaljs-.->|import|IDWidgetTemporalModel3DTemporalTilesetjs
```