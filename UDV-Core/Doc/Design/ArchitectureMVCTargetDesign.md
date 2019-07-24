# Architecture

## Description

UDV-Core is split in several components, independent to each other, in order to create an application as modular as possible.
These components are :

* **Temporal**
* **Geocoding**
* **Authentication**
* **Documents** and its extensions
  * **Contribute**
  * **Guided tour**
  * **Validation**
  * **Comments**
* **Links**

*A [class diagram of udv-core](https://github.com/MEPP-team/RICT/tree/master/Doc/Devel/Architecture/Diagrams/UDVcoreClassDiagram.jpg) can be found in the link below:*

Multiple architectures are possible for the modules :

- [MVC](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) (Model-View-Controller):
  * the **view** is in charge of displaying models and getting user's action;
  * the **controller** is in charge of handling events from the view, communicate with the server to get information and data and create the correct models;
  * the **model** represents a back-end object.
- [MVVM](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel) (Model-View-ViewModel):
  * This pattern is similar to MVC, excepts that instead of a controller, the view communicates with a view model. 
- View / Service:
  * This simple pattern divides the code into two parts : the view and the service.
  * The service serves as a simple model. This pattern is useful for small modules where an MVC or MVVM architecture would be too complex.

## Conventions

We decide to adopt a few conventions so that our files and classes have uniformized names.

### File structure

Depending on the architecture of the module, the files can be grouped in different categories: view, controller, model, view model, service. The modules should have a folder structure that shows this separation, for example : 

```
MyModule
├─ View
│  └─ MyModuleView.js
├─ Model
│  └─ MyModuleService.js
└─ ViewModel
   └─ MyModuleProvider.js
```

In this example, we have an MVVM pattern. The service fetches the data, then the provider converts them for the view, and finally the view displays them. The files are separated 

## Documents module

[[Detailed documentation](../../src/Modules/Documents/README.md)]

The documents module follows an MVVM architecture :

![](./Pictures/DocumentsArchitecture.png)

The model holds the documents and make requests to the server, the view model filter those documents and the view displays the filtered documents.

The entry point of the documents module is the `DocumentModule` object that allows other modules to interact with it. It exposes the `DocumentProvider` and the `DocumentView` so that they are accessible from outside. That means that external modules can add filters to the provider or visual elements to the view, for example.

## Authentication module

### Goal

The goal of the **Authentication module** is to allow basic authentication capabilities such as :

* Creating a user
* Log in as a user
* Make authorized requests with this user

In order to do that, it uses the OAuth2 protocol. When a user enters its username and password into the login module, it sends the credentials to the server which, if the credentials are correct, responds with an token. The token is stored in the client session so it can be used as a way to access protected resources. The format used by the token is JWT (for JSON Web Token).

### Architecture

The code is separated in two main parts : the view and the service. It ressembles to a classic MVC pattern but the view and the controller are coupled, and the model is represented as the service. The model must contain the application logic, so it makes the requests to the server. The workflow is as it follows :

* The user makes an action on the view (login, register)
* The view calls the correct method in the service
* The service makes the appropriate request to the server, and processes the received data
* It then notifies the listeners. The service follows a simple implementation of the [Observer pattern](https://en.wikipedia.org/wiki/Observer_pattern) where observers are just callbacks without arguments (called listeners). The view has subscribed to the service when it was created, so it received the notification of the service and can update itself.

![](Pictures/ViewServiceArchitecture.png)

### Services

The service can be used by other modules to retrieve information about the logged in user. It is for example useful to make requests (with the authorization token) or display data (like the name). For instance, the [Request Service](https://github.com/MEPP-team/UDV/wiki/Request-Service) can use the Authorization Service to inject the JWT in HTTP requests.
