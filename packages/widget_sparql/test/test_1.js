() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const instance = new udviz.widgetSPARQL.SparqlQueryWindow(
      new udviz.widgetSPARQL.SparqlEndpointResponseProvider({
        url_parameters:
          'Query?handle=download&format=SPARQL/JSON&view=HTML&query=',
        url: 'http://fake_url/strabon/',
        options: {},
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
