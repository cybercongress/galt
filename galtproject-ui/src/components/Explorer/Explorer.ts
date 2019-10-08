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

import * as pIteration from "p-iteration";

import {
    EventBus,
    GetEventName,
    EXPLORER_DRAW_AREA,
    EXPLORER_DRAW_AREAS_LIST,
    EXPLORER_DRAW_SPACE_TOKEN,
    EXPLORER_DRAW_SPACE_TOKENS_LIST,
    EXPLORER_MOUSE_CLICK,
    EXPLORER_TEMP_GEOHASHES,
    EXPLORER_HIGHLIGHT_GEOHASHES, 
    EXPLORER_HIGHLIGHT_CONTOUR
} from '../../services/events';
import GaltData from "../../services/galtData";
import ExplorerMap from "./ExplorerMap";

const galtUtils = require('@galtproject/utils');
import * as _ from 'lodash';

export default {
    name: 'explorer',
    template: require('./Explorer.html'),
    props: ['name', 'hideSurroundings'],
    components: {},
    created() {
        this.onDestroyComponentCallbacks = [];
        this.contourIndexByGeohash = {};
    },
    mounted() {
        try {
            this.explorerMap = new ExplorerMap(this.$refs.map.id);
        } catch (e) {
            console.warn(e);
            return;
        }
        _.extend((global as any).dev, {
            highlightGeohashes: this.explorerMap.highlightGeohashes.bind(this.explorerMap),
            highlightContour: this.explorerMap.highlightContour.bind(this.explorerMap),
            clearHighlight: this.explorerMap.clearHighlight.bind(this.explorerMap),
            clearElements: this.explorerMap.clearElements.bind(this.explorerMap),
            centerContour: (contour) => {
                this.setMapView(this.getCenterGeohash(contour));
            },
            centerGeohash: this.setMapView.bind(this)
        });
        
        this.setMapView(this.getLastCenterGeohash() || this.baseGeohash, this.getLastZoom());

        this.explorerMap.onMouseMove((event) => {
            this.cursor.geohash = event.geohash;
            this.cursor.lat = event.lat;
            this.cursor.lng = event.lng;
        });

        this.explorerMap.onMouseClick((event) => {
            GaltData.copyToClipboard(event.geohash);

            this.$notify({
                type: 'success',
                title: this.$locale.get('explorer.geohash_copied_to_clipboard')
            });

            this.emitEvent(EXPLORER_MOUSE_CLICK, event);
        });

        this.lastBboxesString = '';
        
        const getSurrondingsDebounce = _.debounce(this.getSurrondings.bind(this), 1000);
        this.explorerMap.onViewMove((bounds) => {
            this.setLastCenterGeohash(bounds.center.geohash);
            getSurrondingsDebounce(bounds);
        });

        this.explorerMap.onZoomChange((zoom) => {
            this.setLastZoom(zoom);
        });

        this.getSurrondings(this.explorerMap.getMapBounds());

        this.subscribeToEvent(EXPLORER_DRAW_AREA, (area) => {
            this.drawArea('subscribed_area', area);
            this.drawLastSurrondings();
        });
        this.subscribeToEvent(EXPLORER_DRAW_AREAS_LIST, (areas) => {
            this.drawAreas('subscribed_area', areas, areas[0].reset);
            this.drawLastSurrondings();
        });

        this.subscribeToEvent(EXPLORER_DRAW_SPACE_TOKEN, async (spaceToken) => {
            this.drawArea('subscribed_space_token', await this.convertSpaceTokenToArea(spaceToken));
            this.drawLastSurrondings();
        });

        this.subscribeToEvent(EXPLORER_DRAW_SPACE_TOKENS_LIST, async (spaceTokens) => {
            let areas = await pIteration.map(spaceTokens, async (spaceToken) => {
                return await this.convertSpaceTokenToArea(spaceToken);
            });

            areas = _.orderBy(areas, ['level']);

            this.drawAreas('subscribed_space_token', areas, true);
            this.drawLastSurrondings();
        });

        this.subscribeToEvent(EXPLORER_HIGHLIGHT_GEOHASHES, async (geohashes) => {
            this.explorerMap.highlightGeohashes('subscribed_highlight_geohashes', geohashes);
        });

        this.subscribeToEvent(EXPLORER_TEMP_GEOHASHES, async (geohashes) => {
            this.explorerMap.highlightGeohashes('subscribed_temp_geohashes', geohashes);
        });

        this.subscribeToEvent(EXPLORER_HIGHLIGHT_CONTOUR, async (data) => {
            this.explorerMap.highlightContour('subscribed_highlight_contour', data.contour, data.highlightType || 'warn');
        });
       
        this.explorerMap.onContourElementClick(async (contourEl) => {

            const spaceToken = await GaltData.getSpaceTokenObjectById(contourEl.spaceTokenId);
            
            const area = GaltData.beautyNumber(spaceToken.area);
            const heightsList = spaceToken.heights.join(', ');
            const geohashList = spaceToken.contour.join(', ');
            const latLonList = spaceToken.contour.map(geohash => {
                return galtUtils.geohash.extra.decodeToLatLon(geohash, true).map(number => GaltData.roundToDecimal(number, 10)).join(', ');
            }).join('<br/>');
            const utmList = spaceToken.contour.map(geohash => {
                const latLon = galtUtils.geohash.extra.decodeToLatLon(geohash, true);
                const utm = galtUtils.latLon.toUtm(latLon[0], latLon[1]);
                return galtUtils.utm.toString(utm);
            }).join('<br/>');
            
            if(contourEl.spaceTokensIdsByContourKey && contourEl.spaceTokensIdsByContourKey.length > 1) {
                
                const tokensIdsList = contourEl.spaceTokensIdsByContourKey.map((tokenId) => {
                    return `<a href="/#/land/space-token/${tokenId}" target="_self">${tokenId}</a>`
                }).join(', ');
                
                const allOwnerTokensIds = await GaltData.getUserSpaceTokensIds(this.user_wallet);
                
                const ownedTokensIdsList = _.intersectionBy(allOwnerTokensIds, contourEl.spaceTokensIdsByContourKey, (tokenId) => tokenId.toString())
                    .map((tokenId) => {
                        return `<a href="/#/land/space-token/${tokenId}" target="_self">${tokenId}</a>`
                    }).join(', ');
                
                this.explorerMap.drawPopup(contourEl.center, this.$locale.get('explorer.multiple_space_tokens_info', {
                    tokensIdsList,
                    ownedTokensIdsList
                }) + this.$locale.get('explorer.coordinates_info', {
                    area,
                    heightsList,
                    geohashList,
                    latLonList,
                    utmList,
                    type: spaceToken.type
                }));
                
            } else {
                
                this.explorerMap.drawPopup(contourEl.center, this.$locale.get('explorer.space_token_info', {
                    tokenId: spaceToken.tokenId,
                    level: spaceToken.level,
                    typeStr: this.$locale.get('territory_types.' + spaceToken.type, {level: spaceToken.level}),
                    owner: spaceToken.owner
                }) + this.$locale.get('explorer.coordinates_info', {
                    area,
                    heightsList,
                    geohashList,
                    latLonList,
                    utmList,
                    type: spaceToken.type
                }));
                
            }
            // console.log('onContourElementClick', contourEl.center);
        });
        
        this.explorerMap.onGeohashClick((geohash, polygon) => {
            const latLon = galtUtils.geohash.extra.decodeToLatLon(geohash, true);
            const utm = galtUtils.latLon.toUtm(latLon[0], latLon[1]);
            latLon[0] = GaltData.roundToDecimal(latLon[0], 10);
            latLon[1] = GaltData.roundToDecimal(latLon[1], 10);
            const index = this.contourIndexByGeohash[geohash];
            let numberStr = '';
            if(!_.isUndefined(index)) {
                numberStr = `Point number: ${index}<br/>`;
            }
            this.explorerMap.drawPopup(polygon.getCenter(), `${numberStr}Geohash: ${geohash}<br/>LatLon: ${latLon[0]}, ${latLon[1]}<br/>UTM: ${galtUtils.utm.toString(utm)}`);
        })
    },
    beforeDestroy() {
        if (this.explorerMap) {
            this.explorerMap.destroy();
        }
        this.onDestroyComponentCallbacks.forEach((callback) => {
            callback();
        })
    },
    methods: {
        setLastCenterGeohash(geohash) {
            localStorage.setItem('Explorer.lastCenterGeohash', geohash);
        },
        getLastCenterGeohash() {
            const result = localStorage.getItem('Explorer.lastCenterGeohash');
            return result ? result : '';
        },
        setLastZoom(zoom) {
            localStorage.setItem('Explorer.lastZoom', zoom.toString());
        },
        getLastZoom() {
            const result = localStorage.getItem('Explorer.lastZoom');
            return result ? parseFloat(result) : null;
        },
        async getSurrondings(bounds) {
            if(this.hideSurroundings) {
                return;
            }
            const bbox = galtUtils.geohash.extra.autoBboxes(bounds.ne.geohash, bounds.sw.geohash);

            // prevent double-calls
            const bboxesString = bbox.join(',');
            if(bboxesString === this.lastBboxesString) {
                return;
            }
            this.lastBboxesString = bboxesString;

            const lastSurroundingsContours = await this.$geoExplorer.getContoursByParents(bbox).catch((err) => {
                this.$sentry.breadcrumb('auto-bbox', 'input', [bounds.ne.geohash, bounds.sw.geohash]);
                this.$sentry.breadcrumb('auto-bbox', 'output', bbox);
                this.$sentry.exception(err);
                return [];
            });
            
            //TODO: remove on fix explorer geohashes order
            this.lastSurroundingsContours = await pIteration.map(lastSurroundingsContours, async (spaceToken: any) => {
                return {
                    spaceTokenId: spaceToken.spaceTokenId,
                    contour: await GaltData.getPackageContour(spaceToken.spaceTokenId)
                }
            });

            this.drawLastSurrondings();
        },
        setMapView(geohash, zoom?) {
            this.explorerMap.setView(geohash, zoom);
        },
        drawArea(name, area) {
            let largerGeohash;

            this.explorerMap.clearElementsByName(name);
            
            if (area.reset) {
                largerGeohash = this.getCenterGeohash(area.contour);
            }

            // this.explorerMap.drawGeohashes(area.geohashes);
            if (area.contour && area.contour.length) {
                this.explorerMap.drawContour(name, area.contour, area.spaceTokenId, area.level || 0);

                if (area.reset && !largerGeohash) {
                    largerGeohash = this.getCenterGeohash(area.contour);
                }
            }

            if (area.highlightGeohashes && area.highlightGeohashes.length) {
                this.explorerMap.highlightGeohashes(name, area.highlightGeohashes, area.highlightGeohashesType || 'warn');
                area.highlightGeohashes.forEach((geohash, index) => {
                    this.contourIndexByGeohash[geohash] = index;
                });
            } else {
                this.explorerMap.highlightGeohashes(name, area.contour, 'warn');
                area.contour.forEach((geohash, index) => {
                    this.contourIndexByGeohash[geohash] = index;
                });
            }

            if (area.highlightContour && area.highlightContour.length) {
                this.explorerMap.highlightContour(name, area.highlightContour, area.highlightContourType || 'warn');
            }

            if (area.reset && !largerGeohash) {
                largerGeohash = this.baseGeohash;
            }

            this.setMapView(largerGeohash);
        },
        drawAreas(name, areasList, reset = false) {
            this.explorerMap.clearElementsByName(name);

            // if (!areasList.length) {
            //     this.setMapView(this.baseGeohash);
            //     return;
            // }

            let firstGeohash;
            let largerArea;

            let geohashesForHighlight = [];
            areasList.forEach((area) => {
                let areaOfArea = 0;
                try {
                    areaOfArea = galtUtils.geohash.contour.area(area.contour);
                } catch (e) {
                    // incorrect contour
                }

                if ((!firstGeohash || areaOfArea > largerArea) && reset) {
                    firstGeohash = this.getCenterGeohash(area.contour);
                    largerArea = areaOfArea;
                }
                // this.explorerMap.drawGeohashes(area.geohashes);
                if (area.contour && area.contour.length) {
                    if(name === 'surroundings') {
                        this.explorerMap.drawContour(name, area.contour, area.spaceTokenId, area.level || 0, {
                            fillColor: 'grey',
                            color: 'grey'
                        });
                    } else {
                        this.explorerMap.drawContour(name, area.contour, area.spaceTokenId, area.level || 0);
                    }
                }

                if (area.highlightGeohashes && area.highlightGeohashes.length) {
                    this.explorerMap.highlightGeohashes(name, area.highlightGeohashes, area.highlightGeohashesType || 'warn');
                    area.highlightGeohashes.forEach((geohash, index) => {
                        this.contourIndexByGeohash[geohash] = index;
                    });
                } else if(area.contour) {
                    geohashesForHighlight = geohashesForHighlight.concat(area.contour);
                    area.contour.forEach((geohash, index) => {
                        this.contourIndexByGeohash[geohash] = index;
                    });
                }

                if (area.highlightContour && area.highlightContour.length) {
                    this.explorerMap.highlightContour(name, area.highlightContour, area.highlightContourType || 'warn');
                }
            });

            this.explorerMap.highlightGeohashes(name, geohashesForHighlight, 'warn');
            
            // if(reset) {
            //     firstGeohash = galtUtils.geohash.getParent(firstGeohash);
            // }
            this.setMapView(firstGeohash);
        },
        subscribeToEvent(eventName, callback) {
            EventBus.$on(GetEventName(eventName, this.name), callback);

            this.onDestroyComponentCallbacks.push(() => {
                EventBus.$off(GetEventName(eventName, this.name), callback);
            });
        },
        emitEvent(eventName, data) {
            EventBus.$emit(GetEventName(eventName, this.name), data);
        },
        async convertSpaceTokenToArea(spaceToken) {
            return {
                // space token could dont have area if its plotManager application entity not yet minted
                spaceTokenId: spaceToken.tokenId,
                contour: spaceToken.tokenId ? await GaltData.getPackageContour(spaceToken.tokenId) : spaceToken.contour,
                highlightContour: spaceToken.highlightContour,
                highlightContourType: spaceToken.highlightContourType,
                reset: true,
                level: spaceToken.colorLevel
            };
        },
        getCenterGeohash(contour) {
            let centerGeohash;
            [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].some((precision) => {
                const geohashesInContour = galtUtils.geohash.contour.bboxes(contour, precision);

                centerGeohash = geohashesInContour[Math.ceil(geohashesInContour.length / 2)];

                return geohashesInContour.length > 2;
            });

            if (!centerGeohash && contour.length) {
                centerGeohash = galtUtils.geohash.getParent(galtUtils.geohash.getParent(contour[0]));
            }
            if (!centerGeohash) {
                return "";
            }
            return centerGeohash;
        },
        drawLastSurrondings() {
            let existsContoursKeys = this.explorerMap.getElementsByDrawName('subscribed_area').map((polygon) => polygon.contourKey);
            existsContoursKeys = existsContoursKeys.concat(this.explorerMap.getElementsByDrawName('subscribed_space_token').map((polygon) => polygon.contourKey));
            existsContoursKeys = _.uniq(existsContoursKeys);

            let contoursObjects = this.lastSurroundingsContours.filter(obj => {
                return !_.includes(existsContoursKeys, obj.contour.join(','));
            });
            
            this.drawAreas('surroundings', contoursObjects);
        }
    },
    data() {
        return {
            galtRate: null,
            mintAddress: null,
            mintCount: null,
            cursor: {
                geohash: null,
                lat: null,
                lng: null
            },
            baseGeohash: 'w24qg',
            lastSurroundingsContours: []
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
}
