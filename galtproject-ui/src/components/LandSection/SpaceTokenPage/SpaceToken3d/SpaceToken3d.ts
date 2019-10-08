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
import GaltData from "../../../../services/galtData";
import * as _ from 'lodash';
const galtUtils = require('@galtproject/utils');
const spaceRenderer = require('@galtproject/space-renderer');

export default {
    name: 'space-token-3d',
    template: require('./SpaceToken3d.html'),
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
            const colorByLevel = ['#66BB6A', '#FFECB3', '#FFE57F', '#FFE082', '#FFD740', '#FFD54F', '#FFCA28', '#FFC107', '#FFB300', '#FFA000', '#FF8F00'];

            this.spaceListForRender = _.cloneDeep(this.allSpaceTokens);

            this.spaceListForRender.forEach((spaceTokenItem, index) => {
                spaceTokenItem.contour = spaceTokenItem.contour.map((contourGeohash) => {
                    return galtUtils.geohash.extra.decodeToLatLon(contourGeohash, true);
                });
                spaceTokenItem.utmContour = spaceTokenItem.contour.map((latLon) => {
                    return _.reverse(galtUtils.latLon.toUtm(latLon[0], latLon[1]));
                });

                if(spaceTokenItem.current) {
                    spaceTokenItem.color = '#00B8D4';
                } else {
                    spaceTokenItem.color = colorByLevel[spaceTokenItem.colorLevel];
                }

                const nextSpaceTokenItem = this.spaceListForRender[index + 1];
                const prevSpaceTokenItem = index > 0 ? this.spaceListForRender[index - 1] : null;

                if(nextSpaceTokenItem) {
                    spaceTokenItem.absoluteExtrude = nextSpaceTokenItem.heights[0];

                    spaceTokenItem.relativeExtrude = spaceTokenItem.absoluteExtrude;
                    if(spaceTokenItem.level > 0) {
                        spaceTokenItem.relativeExtrude -= spaceTokenItem.heights[0];
                    }
                } else if(prevSpaceTokenItem) {
                    spaceTokenItem.relativeExtrude = prevSpaceTokenItem.relativeExtrude;
                    spaceTokenItem.absoluteExtrude = spaceTokenItem.heights[0] + prevSpaceTokenItem.relativeExtrude;
                } else {
                    spaceTokenItem.absoluteExtrude = spaceTokenItem.heights[0];
                }
            });

            const renderer = new spaceRenderer(this.spaceListForRender, {
                width: this.$refs.rendererContainer.offsetWidth,
                height: this.$refs.rendererContainer.offsetHeight,
                container: this.containerId
            });

            console.log('spaceListForRender', this.spaceListForRender);
            console.log('spaceListForRender JSON', JSON.stringify(this.spaceListForRender));
        }
    },
    data() {
        return {
            containerId: '3d-container'
        };
    },
    watch: {
        'allSpaceTokens'() {
            this.render();
        }
    },
}
