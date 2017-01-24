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
DataService.set(pointer, data);
// Set data at given path
DataService.delete(pointer, data);
// Set last set/delete action
DataService.undo();
// redo last undo action
DataService.redo();
```

### DataService events

```js
// called before any data changes of the action
DataService.on("beforeUpdate", callback)
// called after data changes, before observe events 
DataService.on("afterUpdate", callback) 
// Events bubble up to root pointer (#), # is last event
DataService.observe(pointer, callback) 
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
ValidationService.on("beforeValidate", callback)    // called before a next validation - used to remove errors
ValidationService.on("afterValidate", callback)     // called after validation - used to remove errors
ValidationService.observe(pointer, callback) // Validation Events bubble up to root pointer (#)
```

