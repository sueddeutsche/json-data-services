# json-data-services

> Manages application state, especially tracks immutable json-editor-data and notifies about changes and errors.


## DataService

Data can only be changed via the data-service methods. Each state is tracked within the services, enabling und/redo functionality (currently replaces complete data, enforcing an update event on root).

### Data manipulation methods

```js
DataService.get(pointer);
DataService.set(pointer, data);
DataService.delete(pointer, data);
DataService.undo();
DataService.redo();
```

### DataService events

```js
DataService.on("beforeUpdate", callback)
DataService.on("afterUpdate", callback)
DataService.observe(pointer, callback) // Events bubble up to root pointer (#)
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

