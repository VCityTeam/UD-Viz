// eslint-disable-next-line no-unused-vars
const C3DTilesEditor = class {
  constructor(extent, frame3DPlanarOptions) {
    /** @type {udvizBrowser.itowns.Extent} */
    this.extent = extent; // ref it to add layers then

    /** @type {udvizBrowser.Frame3DPlanar} */
    this.frame3DPlanar = new udvizBrowser.Frame3DPlanar(
      extent,
      frame3DPlanarOptions
    );

    /** @type {udvizBrowser.THREE.Object3D} */
    this.object3D = null;

    /** @type {udvizBrowser.TransformControls} */
    const elementToListen =
      this.frame3DPlanar.itownsView.mainLoop.gfxEngine.label2dRenderer
        .domElement;
    this.transformControls = new udvizBrowser.TransformControls(
      this.frame3DPlanar.camera,
      elementToListen
    );
    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.frame3DPlanar.itownsView.controls.enabled = !event.value;
    });
    this.transformControls.addEventListener('change', () => {
      this.transformControls.updateMatrixWorld();
      this.frame3DPlanar.itownsView.notifyChange();
    });
    this.frame3DPlanar.itownsView.addFrameRequester(
      udvizBrowser.itowns.MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
      () => {
        this.transformControls.updateMatrixWorld();
      }
    );

    // initialize ui
    const inputFile = document.createElement('input');
    inputFile.setAttribute('type', 'file');
    inputFile.setAttribute('accept', '.glb, .gltf');
    this.frame3DPlanar.domElementUI.appendChild(inputFile);
    inputFile.onchange = async (e) => {
      const gltf = await udvizBrowser.readFileAsGltf(e);

      if (this.object3D) {
        this.frame3DPlanar.scene.remove(this.object3D);
      }

      this.object3D = gltf.scene;
      this.frame3DPlanar.scene.add(this.object3D);

      // to actually see it
      this.object3D.position.set(extent.center().x, extent.center().y, 500); // <== place at the center of the extent

      this.transformControls.attach(this.object3D);
      this.transformControls.updateMatrixWorld();
      this.frame3DPlanar.scene.add(this.transformControls);

      // camera focus
      udvizBrowser.focusCameraOn(
        this.frame3DPlanar.itownsView,
        this.frame3DPlanar.itownsView.controls,
        this.object3D.position
      );

      this.frame3DPlanar.itownsView.notifyChange();
    };

    // gizmo mode ui
    const addButtonMode = (mode) => {
      const buttonMode = document.createElement('button');
      buttonMode.innerText = mode;
      this.frame3DPlanar.domElementUI.appendChild(buttonMode);

      buttonMode.onclick = () => {
        this.transformControls.setMode(mode);
      };
    };
    addButtonMode('translate');
    addButtonMode('rotate');
    addButtonMode('scale');

    // result
    const dowloadButton = document.createElement('button');
    dowloadButton.innerText = 'Download transform';
    this.frame3DPlanar.domElementUI.appendChild(dowloadButton);
    dowloadButton.onclick = () => {
      if (!this.object3D) {
        alert('no object3D loaded');
        return;
      }

      const result = {
        position: this.object3D.position.toArray(),
        rotation: this.object3D.rotation.toArray(),
        scale: this.object3D.scale.toArray(),
      };

      udvizBrowser.downloadObjectAsJson(result, this.object3D.name);
    };
  }

  /**
   * Add layers of geo data
   *
   * @param {object} configs - different config
   * @todo describe all configs
   */
  addLayers(configs) {
    if (configs.$3DTiles) {
      configs.$3DTiles.forEach((layerConfig) => {
        udvizBrowser.itowns.View.prototype.addLayer.call(
          this.frame3DPlanar.itownsView,
          new udvizBrowser.itowns.C3DTilesLayer(
            layerConfig['id'],
            {
              style: this.c3DTilesStyle,
              name: layerConfig['id'],
              source: new udvizBrowser.itowns.C3DTilesSource({
                url: layerConfig['url'],
              }),
            },
            this.frame3DPlanar.itownsView
          )
        );
      });
    }
    if (configs.elevation) {
      const isTextureFormat =
        configs.elevation['format'] == 'image/jpeg' ||
        configs.elevation['format'] == 'image/png';
      this.frame3DPlanar.itownsView.addLayer(
        new udvizBrowser.itowns.ElevationLayer(
          configs.elevation['layer_name'],
          {
            useColorTextureElevation: isTextureFormat,
            colorTextureElevationMinZ: isTextureFormat
              ? configs.elevation['colorTextureElevationMinZ']
              : null,
            colorTextureElevationMaxZ: isTextureFormat
              ? configs.elevation['colorTextureElevationMaxZ']
              : null,
            source: new udvizBrowser.itowns.WMSSource({
              extent: this.extent,
              url: configs.elevation['url'],
              name: configs.elevation['name'],
              crs: this.extent.crs,
              heightMapWidth: 256,
              format: configs.elevation['format'],
            }),
          }
        )
      );
    }
    if (configs.baseMap) {
      this.frame3DPlanar.itownsView.addLayer(
        new udvizBrowser.itowns.ColorLayer(configs.baseMap['layer_name'], {
          updateStrategy: {
            type: udvizBrowser.itowns.STRATEGY_DICHOTOMY,
            options: {},
          },
          source: new udvizBrowser.itowns.WMSSource({
            extent: this.extent,
            name: configs.baseMap['name'],
            url: configs.baseMap['url'],
            version: configs.baseMap['version'],
            crs: this.extent.crs,
            format: configs.baseMap['format'],
          }),
          transparent: true,
        })
      );
    }
    if (configs.labels) {
      configs.labels.forEach((layerConfig) => {
        if (
          !layerConfig['id'] ||
          !layerConfig['url'] ||
          !layerConfig['sourceType']
        ) {
          console.warn(
            'Your "LabelLayer" field does not have either "url", "id" or "sourceType" properties. '
          );
          return;
        }

        let source = null;

        // Declare the data source for the LabelLayer
        if (layerConfig['sourceType'] == 'file') {
          source = new udvizBrowser.itowns.FileSource({
            url: layerConfig.url,
            crs: this.extent.crs,
            format: 'application/json',
          });
        } else if (layerConfig['sourceType'] == 'wfs') {
          source = new udvizBrowser.itowns.WFSSource({
            url: layerConfig.url,
            version: '2.0.0',
            typeName: layerConfig.name,
            crs: this.extent.crs,
            format: 'application/json',
          });
        } else {
          console.warn(
            'Unsupported LabelLayer sourceType ' + layerConfig['sourceType']
          );
          return;
        }

        const layerStyle = new udvizBrowser.itowns.Style(layerConfig.style);

        const zoom = { min: 0 };
        if (layerConfig.zoom) {
          if (layerConfig.zoom.min) zoom.min = layerConfig.zoom.min;
          if (layerConfig.zoom.max) zoom.max = layerConfig.zoom.max;
        }

        const labelLayer = new udvizBrowser.itowns.LabelLayer(layerConfig.id, {
          transparent: true,
          source: source,
          style: layerStyle,
          zoom: zoom,
        });
        this.frame3DPlanar.itownsView.addLayer(labelLayer);
      });
    }
    if (configs.geoJSON) {
      configs.geoJSON.forEach((layerConfig) => {
        this.frame3DPlanar.itownsView.addLayer(
          new udvizBrowser.itowns.ColorLayer(layerConfig.id, {
            name: layerConfig.id,
            transparent: true,
            source: new udvizBrowser.itowns.FileSource({
              url: layerConfig.url,
              crs: this.extent.crs,
              format: 'application/json',
            }),
            style: new udvizBrowser.itowns.Style(layerConfig.style),
          })
        );
      });
    }
  }
};
