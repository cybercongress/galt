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

import Explorer from "../../../Explorer/Explorer";
import * as _ from 'lodash';
import GaltData from "../../../../services/galtData";
const galtUtils = require('@galtproject/utils');
const spaceRenderer = require('@galtproject/space-renderer');
const pIteration = require('p-iteration');

export default {
    name: 'space-token-cloudpoints',
    template: require('./SpaceTokenCloudpoints.html'),
    components: {Explorer},
    props: ['curSpaceToken', 'allSpaceTokens'],
    created() {
        
    },
    mounted() {
        this.render();
    },
    methods: {
        render() {
            this.$refs.rendererContainer.innerHTML = '';
            
            // TODO: move to something more appropriate

            this.spaceListForRender = _.cloneDeep(this.allSpaceTokens);

            this.spaceListForRender.forEach(this.transformSpaceTokenForCloudpoint.bind(this));

            document.addEventListener('SpaceViewer:tokenListRequest', async (e: any) => {
                console.log('event SpaceViewer:tokenListRequest', e.detail.data);
                const bounds = e.detail.data;
                let neGeohash, swGeohash;
                if(bounds.min[1] > bounds.max[1]) {
                    neGeohash = galtUtils.geohash.extra.encodeFromLatLng(bounds.max[1], bounds.max[0], 12);
                    swGeohash = galtUtils.geohash.extra.encodeFromLatLng(bounds.min[1], bounds.min[0], 12);
                } else {
                    neGeohash = galtUtils.geohash.extra.encodeFromLatLng(bounds.min[1], bounds.min[0], 12);
                    swGeohash = galtUtils.geohash.extra.encodeFromLatLng(bounds.max[1], bounds.max[0], 12);
                }

                const bbox = galtUtils.geohash.extra.autoBboxes(neGeohash, swGeohash);
                let surroundingsTokens = await this.$geoExplorer.getContoursByParents(bbox).catch((err) => {
                    console.error(err);
                    return [];
                });

                surroundingsTokens = await pIteration.map(surroundingsTokens, (spaceToken) => {
                    return GaltData.getSpaceTokenObjectById(spaceToken.spaceTokenId);
                });

                surroundingsTokens.forEach(this.transformSpaceTokenForCloudpoint.bind(this));

                console.log('emit SpaceViewer:createTokenList JSON', JSON.stringify(surroundingsTokens));
                document.dispatchEvent(new CustomEvent("SpaceViewer:createTokenList", {
                    detail: { data: { tokens: surroundingsTokens } }
                }));
            }, false);

            document.dispatchEvent(new CustomEvent(
                "SpaceViewer:init", {
                    detail: {
                        data: {
                            container: this.containerId,
                            width: this.$refs.rendererContainer.offsetWidth,
                            height: this.$refs.rendererContainer.offsetHeight,
                            tokens: this.spaceListForRender
                        }
                    }
                }
            ));

            console.log('spaceListForRender', this.spaceListForRender);
            console.log('spaceListForRender JSON', JSON.stringify(this.spaceListForRender));
        },
        transformSpaceTokenForCloudpoint(spaceToken, index) {
            const colorByLevel = ['#66BB6A', '#FFECB3', '#FFE57F', '#FFE082', '#FFD740', '#FFD54F', '#FFCA28', '#FFC107', '#FFB300', '#FFA000', '#FF8F00'];

            spaceToken.contour = spaceToken.contour.map((contourGeohash) => {
                return _.reverse(galtUtils.geohash.extra.decodeToLatLon(contourGeohash, true));
            });
            spaceToken.utmContour = spaceToken.contour.map((latLon) => {
                return _.reverse(galtUtils.latLon.toUtm(latLon[1], latLon[0]));
            });

            if(spaceToken.current) {
                spaceToken.color = '#00B8D4';
            } else {
                spaceToken.color = colorByLevel[spaceToken.colorLevel];
            }

            const nextspaceToken = this.spaceListForRender[index + 1];
            const prevspaceToken = index > 0 ? this.spaceListForRender[index - 1] : null;

            if(nextspaceToken) {
                spaceToken.absoluteExtrude = nextspaceToken.heights[0];

                spaceToken.relativeExtrude = spaceToken.absoluteExtrude;
                if(spaceToken.level > 0) {
                    spaceToken.relativeExtrude -= spaceToken.heights[0];
                }
            } else if(prevspaceToken) {
                spaceToken.relativeExtrude = prevspaceToken.relativeExtrude;
                spaceToken.absoluteExtrude = spaceToken.heights[0] + prevspaceToken.relativeExtrude;
            } else {
                spaceToken.absoluteExtrude = spaceToken.heights[0];
            }
        }
    },
    data() {
        return {
            containerId: 'cloudpoints-container'
        };
    },
    watch: {
        'allSpaceTokens'() {
            this.render();
        }
    },
}
