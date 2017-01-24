# json-data-services

> Manages application state, especially tracks immutable json-editor-data and notifies about changes and errors.


## DataService

Data can only be changed via the data-service methods. Each state is tracked within the services, enabling und/redo functionality (currently replaces complete data, enforcing an update event on root).

```js
// get data at json-pointer
const dataService = new DataService(jsonData);
dataService.get("#/content/header/title");
```

### Data manipulation methods

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

### DataService events

```js
// called before any data changes of the action
dataService.on("beforeUpdate", callback)
// called after data changes, before observe events 
dataService.on("afterUpdate", callback) 
// Events bubble up to root pointer (#), # is last event
dataService.observe(pointer, callback) 
```


### Dataservice event object

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


## ValidationService

Sends error notifications on changed data.

```js
// create a new data validation service
const validationService = new ValidationService(jsonSchema)
```

```js
// called before a next validation
validationService.on("beforeValidation", callback)     
// Validation Events bubble up to root pointer (#)
validationService.observe(pointer, callback)   
// called after notifying observers 
validationService.on("afterValidation", callback)    
// validate data
validationService.validate(data).then((errors) => {})
```
