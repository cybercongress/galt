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

import GaltData from "../../../../services/galtData";

const pIteration = require('p-iteration');
import * as _ from 'lodash';
const galtUtils = require('@galtproject/utils');

export default {
    name: 'geo-toolbox-converting',
    template: require('./ConvertingToolbox.html'),
    created() {
        this.input = localStorage.getItem('GeoToolbox.Converting.input') || '';
        this.inputType = localStorage.getItem('GeoToolbox.Converting.inputType') || 'geohash';
        this.outputType = localStorage.getItem('GeoToolbox.Converting.outputType') || 'lat-lon';
        this.lastTxHash = localStorage.getItem('GeoToolbox.Converting.lastTxHash') || null;
    },
    mounted() {
        this.debounceGetCached = _.debounce(this.getCached, 100);
    },
    methods: {
        parseInput() {
            this.parsedInput = this.input.split('\n').map(inputStr => {
                if (this.inputType === 'geohash') {
                    return inputStr;
                } else if (this.inputType === 'lat-lon') {
                    return inputStr.split(/[,]/g).map(inputItem => _.trim(inputItem, ' ,'));
                }
                return null;
            });
        },
        async getCached() {
            this.invalidInput = false;
            this.inputForCache = [];
            this.needToBeCachedWarn = {};
            
            this.jsOutput = [];

            this.parsedInput.forEach((inputItem, index) => {
                let jsResultItem = '';
                
                if (this.inputType === 'geohash') {
                    const latLon = galtUtils.geohash.extra.decodeToLatLon(inputItem, true);
                    if (this.outputType === 'lat-lon') {
                        jsResultItem = latLon.map(coor => GaltData.roundToDecimal(coor, 10)).join(', ');
                    } else if (this.outputType === 'utm') {
                        jsResultItem = galtUtils.utm.toString(galtUtils.latLon.toUtm(latLon[0], latLon[1]));
                    }
                } else if (this.inputType === 'lat-lon') {
                    inputItem[0] = parseFloat(inputItem[0]);
                    inputItem[1] = parseFloat(inputItem[1]);
                    
                    if (this.outputType === 'geohash') {
                        jsResultItem = galtUtils.geohash.extra.encodeFromLatLng(inputItem[0], inputItem[1], 12);
                    } else if (this.outputType === 'utm') {
                        jsResultItem = galtUtils.utm.toString(galtUtils.latLon.toUtm(inputItem[0], inputItem[1]));
                    }
                }

                this.jsOutput.push(jsResultItem);
            });
            
            this.solOutput = [];
            await pIteration.forEachSeries(this.parsedInput, async (inputItem, index) => {
                let solResultItem = '';
                if (this.inputType === 'geohash') {
                    if (this.outputType === 'lat-lon') {
                        solResultItem = await this.$geodesicContract.getCachedLatLonByGeohash(inputItem).then((array) => {
                            if (!array[0]) {
                                this.inputForCache.push(inputItem);
                                this.needToBeCachedWarn[index] = true;
                            }
                            return array.join(', ')
                        });
                    } else if (this.outputType === 'utm') {
                        solResultItem = await this.$geodesicContract.getCachedUtmByGeohash(inputItem).then((array) => {
                            if (!array[0]) {
                                this.inputForCache.push(inputItem);
                                this.needToBeCachedWarn[index] = true;
                            }
                            return galtUtils.utm.toString(galtUtils.utm.uncompress(array));
                        });
                    }
                } else if (this.inputType === 'lat-lon') {
                    if (this.outputType === 'geohash') {
                        solResultItem = await this.$geodesicContract.getCachedGeohashByLatLon(inputItem[0], inputItem[1]);
                        if(!solResultItem) {
                            this.inputForCache.push(inputItem);
                            this.needToBeCachedWarn[index] = true;
                        }
                    } else if (this.outputType === 'utm') {
                        solResultItem = await this.$geodesicContract.getCachedUtmByLatLon(inputItem[0], inputItem[1]).then((array) => {
                            if (!array[0]) {
                                this.inputForCache.push(inputItem);
                                this.needToBeCachedWarn[index] = true;
                            }
                            return galtUtils.utm.toString(galtUtils.utm.uncompress(array));
                        });
                    }
                }
                this.solOutput.push(solResultItem);
            }).catch(() => {
                this.invalidInput = true;
                this.loading = false;
            });
            this.loading = false;
        },
        async convert() {
            this.loading = true;
            try {
                let response;
                if (this.inputType === 'geohash') {
                    if (this.outputType === 'lat-lon') {
                        response = await this.$galtUser.cacheGeohashListToLatLon(this.inputForCache);
                    } else if (this.outputType === 'utm') {
                        response = await this.$galtUser.cacheGeohashListToLatLonAndUtm(this.inputForCache);
                    }
                } else if (this.inputType === 'lat-lon') {
                    if (this.outputType === 'geohash') {
                        response = await this.$galtUser.cacheLatLonListToGeohash(this.inputForCache);
                    } else if (this.outputType === 'utm') {
                        response = await this.$galtUser.cacheLatLonListToUtm(this.inputForCache);
                    }
                }
                this.lastTxHash = response.hash;
            } catch (e) {
                console.error(e);
                this.loading = false;
                return;
            }
            await this.getCached();
            this.loading = false;
        }
    },
    watch: {
        input() {
            this.parseInput();
            this.loading = true;
            this.debounceGetCached();
            localStorage.setItem('GeoToolbox.Converting.input', this.input);
        },
        inputType() {
            if (!_.includes(this.outputsListByInputType[this.inputType], this.outputType)) {
                this.outputType = this.outputsListByInputType[this.inputType][0];
            }
            this.parseInput();
            this.loading = true;
            this.debounceGetCached();
            localStorage.setItem('GeoToolbox.Converting.inputType', this.inputType);
        },
        outputType() {
            this.parseInput();
            this.loading = true;
            this.debounceGetCached();
            localStorage.setItem('GeoToolbox.Converting.outputType', this.outputType);
        },
        lastTxHash() {
            localStorage.setItem('GeoToolbox.Converting.lastTxHash', this.lastTxHash);
        }
    },
    data() {
        return {
            localeKey: 'extensions.geo_toolbox.converting',
            loading: false,
            invalidInput: false,
            input: null,
            parsedInput: [],
            inputForCache: [],
            needToBeCachedWarn: {
                // input index => bool
            },
            inputType: 'geohash',
            inputsList: ['lat-lon', 'geohash'],
            outputType: 'lat-lon',
            outputsListByInputType: {
                'lat-lon': ['geohash', 'utm'],
                'geohash': ['lat-lon', 'utm']
            },
            solOutput: [],
            jsOutput: [],
            lastTxHash: null
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
}
