() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const crs = 'EPSG:3857';

    const instance = new udviz.widgetGuidedTour.GuidedTour(
      new udviz.itowns.View(crs, document.createElement('div')),
      {
        steps: [
          {
            previous: 0,
            text: 1,
            layers: ['layer_1', 'layer_2'],
            media: [],
            position: { x: 10, y: 20, z: 30 },
            rotation: { x: 0.5, y: 0, z: 0.24, w: 0 },
          },
          {
            previous: 0,
            next: 1,
            layers: ['layer_3'],
            media: ['media_1'],
          },
        ],
        name: 'Example',
        description: 'This is an example of GuidedTour config',
        startIndex: 0,
        endIndex: 1,
      },
      [
        {
          id: 'media_1',
          type: 'text',
          value: 'This is an example',
        },
      ]
    );

    console.log(instance);

    resolve();
  });
};
