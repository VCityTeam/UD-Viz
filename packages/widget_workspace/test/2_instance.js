() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const widgetWorkspace = window.widgetWorkspace;

    const instance = new widgetWorkspace.SparqlWorkspaceQueryWindow(
      new widgetWorkspace.SparqlEndpointResponseProvider({
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
