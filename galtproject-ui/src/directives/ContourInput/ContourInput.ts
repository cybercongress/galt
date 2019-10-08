/*
 * Copyright ©️ 2018 Galt•Space Society Construction and Terraforming Company 
 * (Founded by [Nikolai Popeka](https://github.com/npopeka),
 * [Dima Starodubcev](https://github.com/xhipster), 
 * [Valery Litvin](https://github.com/litvintech) by 
 * [Basic Agreement](http://cyb.ai/QmSAWEG5u5aSsUyMNYuX2A2Eaz4kEuoYWUkVBRdmu9qmct:ipfs)).
 * ​
 * Copyright ©️ 2018 Galt•Core Blockchain Company 
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) and 
 * Galt•Space Society Construction and Terraforming Company by 
 * [Basic Agreement](http://cyb.ai/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS:ipfs)).
 */

import * as _ from 'lodash';
import * as ngeohash from 'ngeohash';
const galtUtils = require('@galtproject/utils');
import {
    EventBus, 
    EXPLORER_HIGHLIGHT_GEOHASHES,
    EXPLORER_TEMP_GEOHASHES,
    EXPLORER_MOUSE_CLICK, 
    GetEventName
} from "../../services/events";

export default {
    name: 'contour-input',
    template: require('./ContourInput.html'),
    props: ['value', 'heights', 'disabled', 'explorerName', 'geoType'],
    created(){
        this.subscribeToExplorerEvent(EXPLORER_MOUSE_CLICK, (event) => {
            this.highlightGeohashOnMap(event.geohash);

            if(this.chooseContourIndexOnMap === null) {
                return;
            }
            this.inputContour[this.chooseContourIndexOnMap] = event.geohash;
            if(!this.inputHeights[this.chooseContourIndexOnMap]) {
                this.inputHeights[this.chooseContourIndexOnMap] = this.defaultHeight;
            }
            this.inputContour = _.clone(this.inputContour);
            this.chooseContourIndexOnMap = null;
            
            this.onChangeInputGeohash();
            this.onChangeInputHeight();
        });
        
        if(this.value && this.value.length) {
            this.inputContour = _.clone(this.value);
            this.onChangeInputGeohash();
            if(!this.heights || !this.heights.length) {
                this.heights = this.inputContour.map(() => this.defaultHeight);
            }
        }

        if(this.heights && this.heights.length) {
            this.inputHeights = _.clone(this.heights);
            this.onChangeInputHeight();
        }
    },
    beforeDestroy() {
        this.onDestroyComponentCallbacks.forEach((callback) => {
            callback();
        })
    },
    methods: {
        clickOnMap(contourIndex, geohash) {
            this.chooseContourIndexOnMap = contourIndex;
            this.$notify({
                type: 'warn',
                title: this.$locale.get('pack_contour.geohash.please_select_on_map')
            });

            if(geohash) {
                this.highlightGeohashOnMap(geohash);
            }
        },
        addContourGeohash() {
            this.inputContour.push('');
            this.inputHeights.push(this.defaultHeight);
            this.onChangeInputGeohash();
            this.onChangeInputHeight();
            // setTimeout for prevent clearing chooseContourIndexOnMap by onChangeContourGeohash method on input init
            setTimeout(() => {
                this.chooseContourIndexOnMap = this.inputContour.length - 1;
            }, 200);
        },
        removeContourGeohash(contourIndex) {
            this.inputContour.splice(contourIndex, 1);
            this.inputHeights.splice(contourIndex, 1);
            this.onChangeInputGeohash();
            this.onChangeInputHeight();
        },
        clearContour() {
            this.inputContour = [];
            this.inputHeights = [];
            this.onChangeInputGeohash();
            this.onChangeInputHeight();
            this.$emit('clear-contour');
        },
        
        onChangeInputGeohash() {
            this.resultContour = this.inputContour.map((inputValue) => {
                if (inputValue && inputValue.search(/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/) === 0) {
                    const latlng = inputValue.split(/[ ,]+/);
                    return ngeohash.encode(latlng[0], latlng[1], 12);
                } else {
                    return inputValue;
                }
            });
            
            let someInvalid = false;
            for(let i = 0; i < this.resultContour.length; i++) {
                const geohash = this.resultContour[i];
                const invalid = !geohash || geohash.length < 9;
                this.$set(this.invalidGeohashes, geohash, invalid);

                someInvalid = someInvalid || invalid;
            }

            if(someInvalid) {
                return;
            }
            
            const geohashToHeight = {};
            this.resultContour.forEach((geohash, index) => {
                geohashToHeight[geohash] = this.inputHeights[index];
            });
            
            // this.resultContour = galtUtils.geohash.contour.sortClockwise(this.resultContour);

            this.resultContour.forEach((geohash, index) => {
                this.inputHeights[index] = geohashToHeight[geohash];
            });

            this.$emit('input', this.resultContour);
            this.$emit('change', this.resultContour);
        },
        onChangeInputHeight() {
            const heights = this.inputHeights.map((inputValue) => {
                const resultValue = parseFloat(inputValue);
                if(_.isNaN(resultValue)) {
                    return null;
                } else {
                    return resultValue;
                }
            });
            
            let someInvalid = false;
            for(let i = 0; i < heights.length; i++) {
                const invalid = _.isNull(heights[i]);
                this.$set(this.invalidGeohashes, this.resultContour[i], invalid);
                someInvalid = someInvalid || invalid;
            }

            if(someInvalid) {
                return;
            }
            
            this.$emit('update:heights', heights);
            this.$emit('change', this.resultContour);
        },
        subscribeToExplorerEvent(eventName, callback) {
            EventBus.$on(GetEventName(eventName, this.explorerName), callback);
            
            this.onDestroyComponentCallbacks.push(() => {
                EventBus.$off(GetEventName(eventName, this.name), callback);
            });
        },
        emitExplorerEvent(eventName, data) {
            EventBus.$emit(GetEventName(eventName, this.explorerName), data);
        },
        highlightInputContourGeohashOnMap(contourIndex) {
            this.highlightGeohashOnMap(this.resultContour[contourIndex]);
        },
        highlightGeohashOnMap(geohash) {
            if (!geohash) {
                return;
            }
            this.emitExplorerEvent(EXPLORER_HIGHLIGHT_GEOHASHES, [geohash]);
        },
        highlightGeohashesArrayOnMap(geohashes) {
            this.emitExplorerEvent(EXPLORER_HIGHLIGHT_GEOHASHES, geohashes);
        }
    },
    watch: {
        value(){
            if(!this.value || !this.value.length && this.inputContour.length) {
                this.inputContour = [];
                this.onChangeInputGeohash();
            }
        },
        heights(){
            if(!this.heights || !this.heights.length && this.inputHeights.length) {
                this.inputHeights = [];
                this.onChangeInputHeight();
            }
        },
        defaultHeight() {
            if(_.includes(this.geoType, 'predefined')) {
                this.inputHeights = this.inputContour.map(() => this.defaultHeight);
                this.onChangeInputHeight();
            }
        }
    },
    computed: {
        defaultHeight() {
            return _.includes(this.geoType, 'predefined') ? 0 : 42;
        },
        heightsDisabled() {
            return _.includes(this.geoType, 'predefined');
        }
    },
    data() {
        return {
            inputContour: [],
            inputHeights: [],
            resultContour: [],
            invalidGeohashes: {},
            chooseContourIndexOnMap: null,
            onDestroyComponentCallbacks: []
        }
    }
}
