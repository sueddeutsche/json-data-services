# JSON Data Services

Combines multiple services to help working with json-data manipulation, synchronisation and validation.

- The `DataService` manages application state and retrieval. Additional supports undo.
- The `ValidationService` validates any data by a given JSON-schema.
- The `SchemaService` returns the JSON-schema at the given JSON-pointer location
- The `JsonService` wraps all services, starting data validation after data changes

All services offer an interface based on [JSON-pointer](https://tools.ietf.org/html/rfc6901).
 

## Services

### JsonService

```js
const service = new JsonService(jsonSchema, jsonData);
// returns data at json-pointer
service.getData(jsonPointer);
// returns json schema of stored data at json-pointer
service.getSchema(jsonPointer);
// updates data by given value at json-pointer
service.setData(anyValue, jsonPointer);
// remove data at json-pointer
service.deleteData(jsonPointer)
// undo last setData or deleteData action
service.undo();
// restore last undo
service.redo();
// sets json schema to use
service.setSchema(jsonSchema)
```

Registering to events, is currently not wrapped by JsonService:

```js
// get each service to set events directly
const dataService = service.data();
dataService.observe("#/article/title", callback);
dataService.on("beforeUpdate", callback);

const validationService = service.data();
validationService.observe("#/article/title", callback);
validationService.on("beforeValidation", callback);
```

For further details checkout the individual services:


### DataService

Data can only be changed via the data-service methods. Each state is tracked within the services, enabling und/redo functionality (currently replaces complete data, enforcing an update event on root).

```js
// get data at json-pointer
const dataService = new DataService(jsonData);
dataService.get("#/content/header/title");
```

#### Data manipulation methods

```js
// Set data at given path
dataService.set(pointer, data);
// Set data at given path
dataService.delete(pointer, data);
// Set last set/delete action
dataService.undo();
// redo last undo action
dataService.redo();
```

#### DataService events

```js
// called before any data changes of the action
dataService.on("beforeUpdate", callback)
// called after data changes, before observe events 
dataService.on("afterUpdate", callback) 
// Events bubble up to root pointer (#), # is last event
dataService.observe(pointer, callback, true) 
```


#### Dataservice event object

```js
// callbacks
function callback(event) {}
```

```js
// event object
{
    action: "SET_DATA", // @see store/actions.ActionTypes
    pointer: "#/pointer/location",
    parentPointer: "#/pointer",
}
```


### ValidationService

Sends error notifications on changed data.

```js
// create a new data validation service
const validationService = new ValidationService(jsonSchema)
```

```js
// called before a next validation
validationService.on("beforeValidation", callback)     
// Validation Events bubble up to root pointer (#)
validationService.observe(pointer, callback, true)   
// called after notifying observers 
validationService.on("afterValidation", callback)    
// validate data
validationService.validate(data).then((errors) => {})
```
