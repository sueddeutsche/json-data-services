# json-data-services

> Manages application state, especially tracks immutable json-editor-data and notifies about changes and errors.


## DataService

Data can only be changed via the data-service methods. Each state is tracked within the services, enabling und/redo functionality (currently replaces complete data, enforcing an update event on root).

### Data manipulation methods

```js
DataService.change(pointer, data);
DataService.delete(pointer, data);
```

### DataService events

```js
DataService.on("update", callback)
// ? subscribe, on, addObserver
DataService.observe(pointer, callback) // Events bubble up to root pointer (#)
```


## ValidationService

Sends error notifications on changed data.

```js
ValidationService.on("clear", callback) // called before a next validation - used to remove errors
ValidationService.on("validated", callback) // called after validation - used to remove errors
// ? subscribe, on, addObserver
ValidationService.observe(pointer, callback) // Validation Events bubble up to root pointer (#)
```

