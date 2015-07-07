/**
 *  ______   __   __   ______  __   ______  __  __
 * /\  ___\ /\ "-.\ \ /\__  _\/\ \ /\__  _\/\ \_\ \
 * \ \  __\ \ \ \-.  \\/_/\ \/\ \ \\/_/\ \/\ \____ \
 *  \ \_____\\ \_\\"\_\  \ \_\ \ \_\  \ \_\ \/\_____\
 *   \/_____/ \/_/ \/_/   \/_/  \/_/   \/_/  \/_____/
 *                                         __   ______
 *                                        /\ \ /\  ___\
 *                                       _\_\ \\ \___  \
 *                                      /\_____\\/\_____\
 *                                      \/_____/ \/_____/
 */

/**
 * The listener component.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Listener
 */

var async = require('async'),
    sortBy = require('ejs-sortby'),
    ejsStatic = require('ejs-static');

var _listener,
    _static = ejsStatic('ejs-listener', {
      _on: {}
    }).get();

_listener = module.exports = {
  /**
   * Registers a callback to an event or events.
   *
   * @method on
   * @param {Array|String} events The name of the event(s) to apply the callback
   *   to.
   * @param {Function} callback The callback which gets called when the hook is
   *   invoked.
   * @param {Mixed} [scope=null] The scope to call the callback with, if not
   *   provided then the scope will be EntityCMS.
   * @param {Integer} [weight=0] The weight to apply to the callback.
   * @return {Object} Returns self.
   * @chainable
   */
  on: function (events, callback, scope, weight) {
    'use strict';

    if (typeof events === 'string') {
      events = [events];
    }

    for (var i = 0, len = events.length; i < len; i++) {
      var event = events[i];
      if (_static._on[event] === undefined) {
        _static._on[event] = [];
      }

      _static._on[event].push({
        callback: callback,
        scope: scope || null,
        weight: weight || 0
      });

      sortBy(_static._on[event], 'weight');
    }

    return _listener;
  },

  /**
   * Unregisters a callback from an event or events, or clears all callbacks
   * from the specified event or events.
   *
   * @method un
   * @param {Array|String} events The name of the event(s).
   * @param {Function} [callback] The callback which is to be removed.
   * @return {Object} Returns self.
   * @chainable
   */
  un: function (events, callback) {
    'use strict';

    if (typeof events === 'string') {
      events = [events];
    }

    for (var i = 0, len = events.length; i < len; i++) {
      if (!callback) {
        delete _static._on[events[i]];
      }

      if (_static._on[events[i]] === undefined) {
        continue;
      }

      var tmp = [];
      for (var j = 0, jen = _static._on[events[i]].length; j < jen; j++) {
        if (_static._on[events[i]][j].callback === callback) {
          continue;
        }

        tmp.push(_static._on[events[i]][j]);
      }

      _static._on[events[i]] = tmp;
    }

    return _listener;
  },

  /**
   * Invokes a specified event or events with given arguments.
   *
   * @method invoke
   * @param {Function} done The done callback.
   *   @param {Error} done.err Any errors raised.
   *   @param {Mixed} [...done.args] Any arguments passed to the invoker.
   * @param {Array|String} events The event or events to invoke.
   * @param {Mixed} [...] Any arguments to pass to the events.
   * @async
   */
  invoke: function (done, events) {
    'use strict';

    var me = this,
        args = arguments.length > 2 ?
          [].splice.call(arguments, 2, arguments.length - 2) :
          [],
        queue = [];

    if (typeof events === 'string') {
      events = [events];
    }

    function queueCallback(item) {
      return function (next) {
        var myArgs = args.slice(0);
        myArgs.unshift(next);

        try {
          item.callback.apply(
            item.scope || me,
            myArgs
          );
        } catch (err) {
          next(err);
        }
      };
    }

    for (var i = 0, len = events.length; i < len; i++) {
      var event = events[i];

      if (_static._on[event] === undefined) {
        continue;
      }

      for (var j = 0, jen = _static._on[event].length; j < jen; j++) {
        queue.push(queueCallback(_static._on[event][j]));
      }
    }

    async.series(queue, function (err) {
      var myArgs = args.slice(0);
      myArgs.unshift(err ? err : null);
      done.apply(null, myArgs);
    });
  },

  /**
   * Emit an event or events, this is the same as invoke except without a done.
   *
   * @method emit
   * @param {Array|String} events The event or events to invoke.
   * @param {Mixed} [...] Any arguments to pass to the events.
   * @return {Object} Returns self.
   * @chainable
   */
  emit: function (events) {
    'use strict';

    var me = this,
        args = arguments.length > 2 ?
          [].splice.call(arguments, 2, arguments.length - 2) :
          [],
        fnc = function () {};

    if (typeof events === 'string') {
      events = [events];
    }

    for (var i = 0, len = events.length; i < len; i++) {
      var event = events[i];

      if (_static._on[event] === undefined) {
        continue;
      }

      for (var j = 0, jen = _static._on[event].length; j < jen; j++) {
        var myArgs = args.slice(0);
        myArgs.unshift(fnc);

        _static._on[event][j].callback.apply(
          _static._on[event][j].scope || me,
          myArgs
        );
      }
    }

    return _listener;
  },

  /**
   * Returns all the defined events or callbacks for a given event.
   *
   * @method events
   * @param {String} [event] The event name to return, if not provided all is
   *   assumed.
   * @return {Object|Array} Either the global events object, or an array of an
   *   events callbacks.
   */
  events: function (event) {
    'use strict';

    return event ?
      (_static._on[event] !== undefined ? _static._on[event] : null) :
      _static._on;
  }
};
