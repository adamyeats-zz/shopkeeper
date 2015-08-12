var EventEmitter2 = require('eventemitter2').EventEmitter2;
var inherits = require('inherits');

// So why didn't I use ES6 classes here? Well, Babel's transform from classes
// to prototypes breaks in anything below IE10 :O and the client required
// IE8+ support. I'm using a few ES2015 features, but only ones that can
// fallback to ES5 (and can be polyfilled)
function Shopkeeper (options = { name: 'cart' }) {
  EventEmitter2.call(this);

  this.options = options;
  this.total = 0;
  this.items = [];

  try {
    // will be null if nothing exists in storage
    var storedItems = localStorage.getItem(this.options.name);
    this.hasStorage = true;
  }
  catch (e) {
    this.hasStorage = false;
  }

  // initialise with contents of localStorage
  if (storedItems) {
    const parsed = JSON.parse(storedItems);

    this.total = parsed.total;
    this.items = parsed.items;
  }
  else {
    // fire the clear event if we start with an empty cart
    this.emit('clear');
  }
}

inherits(Shopkeeper, EventEmitter2);

Shopkeeper.prototype.update = function (item) {
  // match up items by thier code
  var modified = this.items.map((val, i) => {
    if (val.code === item.code) {
      // if quantity is zero, remove that item from the items collection
      if (item.quantity === 0) {
        this.items.splice(i, 1);
      }
      // straight up replace it otherwise
      else {
        this.items[i] = item;
      }

      return item;
    }
  });

  // if it doesn't exist, then let's just push it on to the array
  if (!modified || modified.length === 0) {
    this.items.push(item);
  }

  // calculate new total
  this.total = this.items
    .map(val => val.quantity)
    .reduce((prev, current) => prev + current, 0);

  if (this.hasStorage) {
    // update localStorage
    localStorage.setItem(this.options.name, this.serialize());
  }
  else {
    // @TODO: what happens when we don't have localStorage?
    throw new Error('locaStorage not supported in this browser')
  }

  // we also want to fire the clear event if we have zero items
  // in our cart
  if (this.total === 0) {
    this.emit('clear');
  }

  // if we see that the items array has changed, then we want to show
  // what has changed in the event handler
  if (modified) {
    this.emit('update', modified, this.get());
  }
  else {
    this.emit('add', item, this.get());
  }

  return this.get();
}

Shopkeeper.prototype.clear = function () {
  // reset everything. the thermonuclear option.
  this.total = 0;
  this.items = [];

  if (this.hasStorage) {
    localStorage.removeItem(this.options.name);
  }

  this.emit('clear');

  return this.get();
}

Shopkeeper.prototype.get = function () {
  return { total: this.total, items: this.items };
};

Shopkeeper.prototype.serialize = function () {
  // serialise cart contents to JSON string
  return JSON.stringify(this.get());
}

window.Shopkeeper = Shopkeeper;
