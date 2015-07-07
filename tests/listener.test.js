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

var test = require('unit.js'),
    ejsStatic = require('ejs-static');

var listener;

describe('ejs/listener', function () {

  'use strict';

  beforeEach(function () {

    listener = require('../lib');

  });

  afterEach(function () {

    ejsStatic('ejs-listener').set({
      _on: {}
    });

    delete require.cache[require.resolve('../lib')];

  });

  describe('Listener.on()', function () {

    it('shouldAddNewEvent', function () {

      test.object(
        global._ejsStatic['ejs-listener']._on
      ).is({});

      listener.on('test');

      test.object(
        global._ejsStatic['ejs-listener']._on
      ).is({
        'test': [{
          callback: undefined,
          scope: null,
          weight: 0
        }]
      });

    });

    it('shouldAddMultipleNewEventHooks', function () {

      test.object(
        global._ejsStatic['ejs-listener']._on
      ).is({});

      listener.on('test');
      listener.on('test');

      test.object(
        global._ejsStatic['ejs-listener']._on
      ).is({
        'test': [{
          callback: undefined,
          scope: null,
          weight: 0
        }, {
          callback: undefined,
          scope: null,
          weight: 0
        }]
      });

    });

    it('shouldAddMultipleEvents', function () {

      listener.on(['test', 'test2']);

      test.object(
        global._ejsStatic['ejs-listener']._on
      ).is({
        'test': [{
          callback: undefined,
          scope: null,
          weight: 0
        }],
        'test2': [{
          callback: undefined,
          scope: null,
          weight: 0
        }]
      });

    });

    it('callbacksShouldSortedByWeight', function () {

      var fnc1 = function () {},
          fnc2 = function () {},
          fnc3 = function () {};

      listener.on('test', fnc1, null, 5);
      listener.on(['test', 'test2'], fnc2);
      listener.on('test', fnc3, null, -5);

      test.object(
        global._ejsStatic['ejs-listener']._on
      ).is({
        'test': [{
          callback: fnc3,
          scope: null,
          weight: -5
        }, {
          callback: fnc2,
          scope: null,
          weight: 0
        }, {
          callback: fnc1,
          scope: null,
          weight: 5
        }],
        'test2': [{
          callback: fnc2,
          scope: null,
          weight: 0
        }]
      });

    });

  });

  describe('Listener.un()', function () {

    it('shouldRemoveExistingEventHook', function () {

      var fnc1 = function () {},
          fnc2 = function () {},
          fnc3 = function () {};

      listener.on('test', fnc1);
      listener.on(['test', 'test2'], fnc2);
      listener.on('test', fnc3);

      listener.un('test', fnc2);

      test.object(
        global._ejsStatic['ejs-listener']._on
      ).is({
        'test': [{
          callback: fnc1,
          scope: null,
          weight: 0
        }, {
          callback: fnc3,
          scope: null,
          weight: 0
        }],
        'test2': [{
          callback: fnc2,
          scope: null,
          weight: 0
        }]
      });

    });

    it('shouldRemoveAllEventHooks', function () {

      var fnc1 = function () {},
          fnc2 = function () {},
          fnc3 = function () {};

      listener.on('test', fnc1);
      listener.on(['test', 'test2'], fnc2);
      listener.on('test', fnc3);

      listener.un('test');

      test.object(
        global._ejsStatic['ejs-listener']._on
      ).is({
        'test2': [{
          callback: fnc2,
          scope: null,
          weight: 0
        }]
      });

    });

  });

  describe('Listener.invoke()', function () {

    it('shouldntInvokeIfTheresNoCallbacks', function (done) {

      listener.invoke(function (err) {

        test.value(err).isNull();

        done();

      }, 'test');

    });

    it('shouldInvokeEventCallback', function (done) {

      var invoked = {fnc1: 0, fnc2: 0, fnc3: 0},
          fnc1 = function (next) {
            invoked.fnc1++;

            next();
          },
          fnc2 = function (next) {
            invoked.fnc2++;

            next();
          },
          fnc3 = function (next) {
            invoked.fnc3++;

            next();
          };

      listener.on('test', fnc1);
      listener.on(['test', 'test2'], fnc2);
      listener.on('test', fnc3);

      listener.invoke(function (err) {

        test.value(err).isNull();
        test.object(invoked).is({
          fnc1: 1,
          fnc2: 1,
          fnc3: 1
        });

        done();

      }, 'test');

    });

    it('shouldInvokeMultipleEventsCallbacks', function (done) {

      var invoked = {fnc1: 0, fnc2: 0, fnc3: 0},
          fnc1 = function (next) {
            invoked.fnc1++;

            next();
          },
          fnc2 = function (next) {
            invoked.fnc2++;

            next();
          },
          fnc3 = function (next) {
            invoked.fnc3++;

            next();
          };

      listener.on('test', fnc1);
      listener.on(['test', 'test2'], fnc2);
      listener.on('test', fnc3);

      listener.invoke(function (err) {

        test.value(err).isNull();
        test.object(invoked).is({
          fnc1: 1,
          fnc2: 2,
          fnc3: 1
        });

        done();

      }, ['test', 'test2']);

    });

    it('callbacksGetInvokedInWeightedOrder', function (done) {

      var invoked = '',
          fnc1 = function (next) {
            invoked += 'fnc1';

            next();
          },
          fnc2 = function (next) {
            invoked += 'fnc2';

            next();
          },
          fnc3 = function (next) {
            invoked += 'fnc3';

            next();
          };

      listener.on('test', fnc1, null, 5);
      listener.on(['test', 'test2'], fnc2, null, 10);
      listener.on('test', fnc3, null, -5);

      listener.invoke(function (err) {

        test.value(err).isNull();
        test.value(invoked).is('fnc3fnc1fnc2');

        done();

      }, 'test');

    });

    it('passingArguments', function (done) {

      var invoked = {fnc1: false, fnc2: false, fnc3: false},
          fnc1 = function (next, arg) {
            invoked.fnc1 = arg;

            next();
          },
          fnc2 = function (next, arg) {
            invoked.fnc2 = arg;

            next();
          },
          fnc3 = function (next, arg) {
            invoked.fnc3 = arg;

            next();
          };

      listener.on('test', fnc1);
      listener.on('test', fnc2);
      listener.on('test', fnc3);

      listener.invoke(function (err) {

        test.value(err).isNull();
        test.object(invoked).is({
          fnc1: 'arg',
          fnc2: 'arg',
          fnc3: 'arg'
        });

        done();

      }, 'test', 'arg');

    });

    it('passingArgumentsAndNotAmendingFlatVariables', function (done) {

      var invoked = {fnc1: false, fnc2: false, fnc3: false},
          fnc1 = function (next, arg) {
            invoked.fnc1 = arg;
            arg = 'arg2';

            next();
          },
          fnc2 = function (next, arg) {
            invoked.fnc2 = arg;
            arg = 'arg3';

            next();
          },
          fnc3 = function (next, arg) {
            invoked.fnc3 = arg;

            next();
          };

      listener.on('test', fnc1);
      listener.on('test', fnc2);
      listener.on('test', fnc3);

      listener.invoke(function (err) {

        test.value(err).isNull();
        test.object(invoked).is({
          fnc1: 'arg1',
          fnc2: 'arg1',
          fnc3: 'arg1'
        });

        done();

      }, 'test', 'arg1');

    });

    it('passingArgumentsAndChangingThem', function (done) {

      var invoked = {fnc1: false, fnc2: false, fnc3: false},
          fnc1 = function (next, arg) {
            invoked.fnc1 = arg.val;
            arg.val = 'arg2';

            next();
          },
          fnc2 = function (next, arg) {
            invoked.fnc2 = arg.val;
            arg.val = 'arg3';

            next();
          },
          fnc3 = function (next, arg) {
            invoked.fnc3 = arg.val;

            next();
          };

      listener.on('test', fnc1);
      listener.on('test', fnc2);
      listener.on('test', fnc3);

      listener.invoke(function (err) {

        test.value(err).isNull();
        test.object(invoked).is({
          fnc1: 'arg1',
          fnc2: 'arg2',
          fnc3: 'arg3'
        });

        done();

      }, 'test', {val: 'arg1'});

    });

    it('catchingErrors', function (done) {

      var invoked = {fnc1: false, fnc2: false, fnc3: false},
          fnc1 = function (next, arg) {
            invoked.fnc1 = arg;

            next();
          },
          fnc2 = function (next, arg) {
            invoked.fnc2 = arg;

            next(new Error('error'));
          },
          fnc3 = function (next, arg) {
            invoked.fnc3 = arg;

            next();
          };

      listener.on('test', fnc1);
      listener.on('test', fnc2);
      listener.on('test', fnc3);

      listener.invoke(function (err) {

        test.value(err).isInstanceOf(Error);
        test.object(invoked).is({
          fnc1: 'arg',
          fnc2: 'arg',
          fnc3: false
        });

        done();

      }, 'test', 'arg');

    });

    it('catchingUncaughtErrors', function (done) {

      var invoked = {fnc1: false, fnc2: false, fnc3: false},
          fnc1 = function (next, arg) {
            invoked.fnc1 = arg;

            next();
          },
          fnc2 = function (next, arg) {
            invoked.fnc2 = arg;

            throw new Error('error');
          },
          fnc3 = function (next, arg) {
            invoked.fnc3 = arg;

            next();
          };

      listener.on('test', fnc1);
      listener.on('test', fnc2);
      listener.on('test', fnc3);

      listener.invoke(function (err) {

        test.value(err).isInstanceOf(Error);
        test.object(invoked).is({
          fnc1: 'arg',
          fnc2: 'arg',
          fnc3: false
        });

        done();

      }, 'test', 'arg');

    });

  });

  describe('Listener.emit()', function () {

    it('shouldEmitEventCallback', function (done) {

      var invoked = {fnc1: 0, fnc2: 0, fnc3: 0},
          fnc1 = function (next) {
            invoked.fnc1++;

            next();
          },
          fnc2 = function (next) {
            invoked.fnc2++;

            next();
          },
          fnc3 = function (next) {
            invoked.fnc3++;

            next();
          };

      listener.on('test', fnc1);
      listener.on(['test', 'test2'], fnc2);
      listener.on('test', fnc3);

      listener.emit('test');

      while (invoked.fnc3 === 0) {
        // Do nothing.
      }

      test.object(invoked).is({
        fnc1: 1,
        fnc2: 1,
        fnc3: 1
      });

      done();

    });

  });

  describe('Listener.events()', function () {

    it('shouldReturnAnEmptyObjct', function () {

      test.object(
        listener.events()
      ).is({});

    });

    it('shouldReturnAllDefinedEventsAndCallbacks', function () {

      listener.on(['test', 'test2']);

      test.object(
        listener.events()
      ).is({
        'test': [{
          callback: undefined,
          scope: null,
          weight: 0
        }],
        'test2': [{
          callback: undefined,
          scope: null,
          weight: 0
        }]
      });

    });

    it('shouldReturnDefinedEventAndCallbacks', function () {

      listener.on(['test', 'test2']);

      test.array(
        listener.events('test')
      ).is([{
        callback: undefined,
        scope: null,
        weight: 0
      }]);

    });

  });

});
