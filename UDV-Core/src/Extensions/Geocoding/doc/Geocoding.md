# Geocoding module

The purpose of the geocoding module is to navigate through the city by entering addresses or place names.

## Module description

The module view adds a search bar to the main content div, centered at the top. The user can type a query (example: "Basilique Fourvière"), then the module will geocode this query and display the results in the view by adding pins and moving the camera.

## Installation and configuration

### Installation

To install the module in your demo, you must first create the service and then the view.

The service takes 3 parameters : a `RequestService` used to perform the REST call, the view extent and the global configuration (both provided by the `BaseDemo`).

The view takes the service as a first parameter, but also takes two arguments from `BaseDemo` : the camera controls and the view.

The view can then be added in the `BaseDemo`.

```js
const geocodingService = new udvcore.GeocodingService(requestService, baseDemo.extent, baseDemo.config);
const geocodingView = new udvcore.GeocodingView(geocodingService, baseDemo.controls, baseDemo.view);

// You can specify a more explicit name than 'geocoding' for the menu button
baseDemo.addModuleView('geocoding', geocodingView, {name: 'Address search'});
```

### Configuration

The geocoding module will use REST calls to a web service to compute coordinates from query strings. The module was tested with two different services ([Google](https://developers.google.com/maps/documentation/geocoding/start) and [OpenCage](https://opencagedata.com/api)), and is theoritically compatible with most service providers. In order to configure the module, you should specify informations about the web service you want to call. This information includes :

- URL of the geocoding service endpoint
- URL parameters to add to the request

For example, the Google geocoding service uses the base URL https://maps.googleapis.com/maps/api/geocode/json, and takes two mandatory parameters : `address`, which contains the query string and `key`, which contains the API key for authentication.

A request to their service takes the form : https://maps.googleapis.com/maps/api/geocode/json?address=QUERY_STRING&key=API_KEY. However, other service providers may name their parameters differently. So, in order to make well-formed requests, the global configuration must contains information about the web service.

The configuration file must have at least the following structure :

```json
{
  "type": "class",
  "geocoding":{
    "url":"",
    "parameters":{
      "param_name_1":{
        "fill": "value",
        "optional": "",
        "value": ""
      },
      "param_name_2":{
        "fill": "",
        "optional": "",
      },
      "param_name_n":{
        "fill": "",
        "optional": "",
      },
    }
  }
}
```

The `url` field represents the base URL of geocoding requests. For example, to use the Google API services, https://maps.googleapis.com/maps/api/geocode/json is the base URL.

The `parameters` dictionary represents query parameters that will be added to the URL to perform the appropriate geocoding request. Each parameter is described as a `"name": descriptor` pair, where `name` will be the name of the parameter in the request and `descriptor` describes how the value will be filled. To do that, the descriptor must contain a field named `fill` which can take 3 different values :

|Fill value|Description|
|----------|------|
|`"value"`|Fills the parameter with a given value. The value is specified in the `value` field of the descriptor.|
|`"query"`|Fills the parameter with the query string, formatted as a URI component.|
|`"extent"`|Fills the parameter with the extent bounds, with EPSG:4326 coordinates. The string format is `"west,south\|east,north"`.|

An example configuration for the Google service is provided in the `generalDemoConfig.json` file (under `examples/data/config`). You can find a extract below :

```json
"geocoding":{
  "url":"https://maps.googleapis.com/maps/api/geocode/json",
  "parameters":{
    "address":{
      "fill": "query",
      "optional": "false"
    },
    "key":{
      "fill": "value",
      "optional": "false",
      "value": "YOUR-API-KEY"
    },
    "bounds":{
      "fill": "extent",
      "optional": "true"
    },
    "region":{
      "fill": "value",
      "optional": "true",
      "value": "fr"
    }
  }
}
```

With this configuration, the request takes two mandatory parameters : `address` which contains the query string (because of the `"fill": "query"`) and `key` which represents the API key (which is directly defined in the config file, under the `value` field).

The request also takes two optional arguments : `bounds` is the viewport extent and `region` is country code, directly passed as value in the config file.
