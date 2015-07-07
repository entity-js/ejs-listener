# EntityJS - Components

## listener

Provides the global event listener.

### Usage

```javascript
var listener = require('ejs-listener');

listener.on([
  'entities[user].load',
  'entities[user].load[admin]',
  'entities.load'
], function (entity) {
  // Do something.
});
```
