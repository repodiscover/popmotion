'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var Action = require('./Action.es6'),
    calc = require('../inc/calc'),
    utils = require('../inc/utils'),
    simulations = require('./simulate/simulations');

var DEFAULT_PROP = 'velocity';

var Simulate = (function (_Action) {
    _inherits(Simulate, _Action);

    function Simulate() {
        _classCallCheck(this, Simulate);

        _get(Object.getPrototypeOf(Simulate.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Simulate, [{
        key: 'getName',
        value: function getName() {
            return 'simulate';
        }
    }, {
        key: 'getDefaultProps',
        value: function getDefaultProps() {
            return {
                inactiveFrames: 0,
                maxInactiveFrames: 3
            };
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return {
                // [string]: Simulation to .run
                simulate: DEFAULT_PROP,

                // [number]: Deceleration to apply to value, in units per second
                deceleration: 0,

                // [number]: Acceleration to apply to value, in units per second
                acceleration: 0,

                // [number]: Factor to multiply velocity by on bounce
                bounce: 0,

                // [number]: Spring strength during 'string'
                spring: 80,

                // [number]: Timeconstant of glide
                timeConstant: 395,

                // [number]: Stop simulation under this speed
                stopSpeed: 5,

                // [boolean]: Capture with spring physics on limit breach
                capture: false,

                // [number]: Friction to apply per frame
                friction: 0,

                to: 0,
                round: false
            };
        }
    }, {
        key: 'getDefaultValueProp',
        value: function getDefaultValueProp() {
            return DEFAULT_PROP;
        }

        /*
            Simulate the Value's per-frame movement
            
            @param [Value]: Current value
            @param [string]: Key of current value
            @param [number]: Duration of frame in ms
            @return [number]: Calculated value
        */
    }, {
        key: 'process',
        value: function process(value, key, timeSinceLastFrame) {
            var simulate = value.simulate,
                simulation = utils.isString(simulate) ? simulations[simulate] : simulate,
                newVelocity = simulation(value, timeSinceLastFrame, this.started);

            value.velocity = Math.abs(newVelocity) >= value.stopSpeed ? newVelocity : 0;
            return value.current + calc.speedPerFrame(value.velocity, timeSinceLastFrame);
        }

        /*
            Has this action ended?
            
            Use a framecounter to see if Action has changed in the last x frames
            and declare ended if not
            
            @param [boolean]: Has Action changed?
            @return [boolean]: Has Action ended?
        */
    }, {
        key: 'hasEnded',
        value: function hasEnded(hasChanged) {
            this.inactiveFrames = hasChanged ? 0 : this.inactiveFrames + 1;
            return this.inactiveFrames > this.maxInactiveFrames;
        }

        /*
            Limit output to value range, if any
            
            If velocity is at or more than range, and value has a bounce property,
            run the bounce simulation
            
            @param [number]: Calculated output
            @param [Value]: Current Value
            @return [number]: Limit-adjusted output
        */
    }, {
        key: 'limit',
        value: function limit(output, value) {
            var isOutsideMax = output >= value.max,
                isOutsideMin = output <= value.min,
                isOutsideRange = isOutsideMax || isOutsideMin;

            if (isOutsideRange) {
                output = calc.restricted(output, value.min, value.max);

                if (value.bounce) {
                    value.velocity = simulations.bounce(value);
                } else if (value.capture) {
                    simulations.capture(value, isOutsideMax ? value.max : value.min);
                }
            }

            return output;
        }
    }]);

    return Simulate;
})(Action);

module.exports = Simulate;