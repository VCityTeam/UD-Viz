() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const instance = new udviz.widgetVersioning.SparqlVersioningQueryWindow(
      new udviz.widgetSPARQL.SparqlEndpointResponseProvider({
        url: 'http://fake_url/rdf/query',
        options: {
          query: 'body',
        },
      }),
      {
        height: 500,
        width: 500,
        fontSize: 20,
        queries: [],
      }
    );

    console.log(instance);

    resolve();
  });
};
