# CDS-PLUGIN-HANDLERS
CAP CDS Plugin that enables classes for entities.

## Installation

```sh
npm install cds-plugin-handlers
```

## Usage

Create a folder "handlers" in the "src" folder. Inside the "handlers" folder you have to create a folder for each service, e.g.: "CatalogService" for the service CatalogService. In here, you have to create a handler class for each entity, e.g.: "BooksHandler" for the entity Books.

This plugin also allows you to implement separation by concerns when it comes to external services. All requests to external services or even to different databases can be stored in a folder "services". In here, you have to create a service class for each external service to implement all the needed requests.

The folder structure in the "srv" folder should look like this.
```sh
srv
├── src
│   └── handlers
|   |        ├── CatalogService
|   |        |        ├── BooksHandler.ts
│   |        |        └── AnyOtherHandlerY.ts
│   |        └── AnyOtherService
│   |                 └── AnyOtherHandlerX.ts
|   └── services
│           ├── BookService.ts
│           └── AnyOtherServiceX.ts
└── cat-service.cds
```
### Documentation

We have documented this approach already before the plugin but the documentation still applies, only the setup changed. Everthing is explained in the following blog posts:
- reCAP 2023 - CAP Advanced Programming model #1 [https://community.sap.com/t5/technology-blogs-by-members/recap-2023-cap-advanced-programming-model-1/ba-p/13574856](https://community.sap.com/t5/technology-blogs-by-members/recap-2023-cap-advanced-programming-model-1/ba-p/13574856)
- reCAP 2023 – CAP Advanced Programming model #2 [https://community.sap.com/t5/technology-blogs-by-members/recap-2023-cap-advanced-programming-model-2/ba-p/13576365](https://community.sap.com/t5/technology-blogs-by-members/recap-2023-cap-advanced-programming-model-2/ba-p/13576365)
- reCAP 2023 – CAP Advanced Programming model #3 [https://community.sap.com/t5/technology-blogs-by-members/lt-recap-2023-cap-advanced-programming-model-3-gt/ba-p/13572407](https://community.sap.com/t5/technology-blogs-by-members/lt-recap-2023-cap-advanced-programming-model-3-gt/ba-p/13572407)

### Demo app

Demo app available on GitHub [https://github.com/lemaiwo/cds-plugin-handlers/tree/main/sample](https://github.com/lemaiwo/cds-plugin-handlers/tree/main/sample)

Demo project using services: [https://github.com/lemaiwo/ReCAPBTPServiceOverview](https://github.com/lemaiwo/ReCAPBTPServiceOverview)