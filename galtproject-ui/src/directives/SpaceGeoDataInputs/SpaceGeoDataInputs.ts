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

import ContourInput from "../ContourInput/ContourInput";

const _ = require('lodash');
const galtUtils = require('@galtproject/utils');
import {
    EventBus, EXPLORER_DRAW_AREA,
    EXPLORER_HIGHLIGHT_GEOHASHES,
    EXPLORER_MOUSE_CLICK,
    GetEventName
} from "../../services/events";
import GaltData from "../../services/galtData";
import FeeInput from "../FeeInput/FeeInput";

export default {
    name: 'space-geo-data-inputs',
    template: require('./SpaceGeoDataInputs.html'),
    props: ['value', 'explorerName', 'hideFee', 'showCredentials', 'applicationType'],
    components: {ContourInput, FeeInput},
    created(){
        this.getLocales();

        this.onLoadId = this.$locale.onLoad(() => {
            this.getLocales();
        });
        
        this.$emit('update:invalidInputs', true);
        
        if(this.value.contour.length) {
            this.onContourChange();
        }
        
        if(this.predefinedType) {
            this.$set(this.value, 'customArea', this.value.area);
        }
        
        if(this.value.credentialsHash) {
            this.value.oldCredentialsHash = this.value.credentialsHash;
            this.$set(this.value, 'editCredentials', false);
        }
        if(!this.value.additionalDescription) {
            this.value.additionalDescription = {};
        }
    },
    beforeDestroy() {
        this.$locale.unbindOnLoad(this.onLoadId);
    },
    methods: {
        async getLocales() {
            this.tokenTypes = await this.$locale.setTitlesByNamesInList(GaltData.spaceTokensTypes.slice(1), 'territory_types.', {level: '...'});
            this.additionalDescriptionLocalesByType = this.$locale.get(this.localeKey + '.additional_description');
            this.allAdditionalDescriptionLocalesDict = {};
            _.forEach(this.additionalDescriptionLocalesByType, (localesArr, typeName) => {
                localesArr.forEach(locale => {
                    this.allAdditionalDescriptionLocalesDict[typeName + '.' + locale.name] = locale.value;
                });
            });
            this.value.descriptionNames = this.additionalDescriptionLocalesByType[this.value.type].map(locale => locale.name);
        },
        
        async cacheGeohashes() {
            this.loading = true;
            const maxGeohashes = 15;
            let geohashesForCache = this.notCachedGeohashes;
            if(geohashesForCache.length > maxGeohashes) {
                geohashesForCache = geohashesForCache.slice(0, maxGeohashes - 1);
            }
            this.$galtUser.cacheGeohashListToLatLonAndUtm(geohashesForCache).then(async () => {
                this.loading = false;
                
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.cache_geohashes.title'),
                    text: this.getLocale('success.cache_geohashes.description')
                });
                await this.updateNotCachedGeohashes();
                this.updateInvalidInputs();
            }).catch((e) => {
                this.loading = false;
                if(e) {
                    console.error(e);
                }
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.something_wrong.title'),
                    text: this.getLocale('error.something_wrong.description')
                });
            })
        },
        
        onInputChange() {
            this.$emit('input', this.value);
            this.$emit('change', this.value);

            if(this.value.editCredentials) {
                this.value.credentialsHash = this.$plotManagerContract.generateCredentialsHash(this.value.fullName, this.value.documentId);
            } else {
                this.value.credentialsHash = this.value.oldCredentialsHash;
            }
            if(this.additionalDescriptionLocalesByType[this.value.type]) {
                this.value.descriptionNames = this.additionalDescriptionLocalesByType[this.value.type].map(locale => locale.name);
            }

            this.updateInvalidInputs();
        },
        
        async onContourChange() {
            this.$emit('input', this.value);
            this.$emit('change', this.value);

            this.emitExplorerEvent(EXPLORER_DRAW_AREA, {
                geohashes: [],
                contour: this.value.contour
            });
            this.$emit('change-contour');
            
            this.highlightGeohashesArrayOnMap(this.value.contour);
            
            await this.updateNotCachedGeohashes();
            this.updateInvalidInputs();
        },
        async updateNotCachedGeohashes() {
            this.geohashesCached = false;
            this.loading = true;
            this.notCachedGeohashes = await this.$geodesicContract.getNotCachedGeohashes(this.value.contour);
            console.log('SpaceGeoDataInputs.value.contour', this.value.contour);
            console.log('SpaceGeoDataInputs.notCachedGeohashes', this.notCachedGeohashes);
            this.loading = false;
            this.geohashesCached = this.notCachedGeohashes.length === 0;
        },
        updateInvalidInputs() {
            // console.log('this.user_wallet', this.user_wallet);
            const invalid = !this.user_wallet || !this.value.ledgerIdentifier || this.value.contour.length < 3
                || (!this.predefinedType && !this.geohashesCached)
                || (this.predefinedType && !this.value.customArea);
            // console.log('this.invalid', invalid);
            this.$emit('update:invalidInputs', invalid);
        },
        highlightGeohashesArrayOnMap(geohashes) {
            this.emitExplorerEvent(EXPLORER_HIGHLIGHT_GEOHASHES, geohashes);
        },
        emitExplorerEvent(eventName, data) {
            EventBus.$emit(GetEventName(eventName, this.explorerName), data);
        },

        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    watch: {
        invalidFee() {
            this.$emit('update:invalidFee', this.invalidFee);
        },
        user_wallet() {
            this.updateInvalidInputs();
        },
        'value.editCredentials'() {
            this.onInputChange();
        },
        'value.type'() {
            this.onInputChange();
        }
    },

    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        },
        cacheGeohashesDisabled() {
            return !this.user_wallet || !this.value || !this.value.ledgerIdentifier || this.value.contour.length < 3
                || this.loading || this.geohashesCached;
        },
        predefinedType() {
            return _.includes(this.value.type, 'predefined');
        }
    },
    
    data() {
        return {
            localeKey: 'space_geo_data_inputs',
            loading: false,
            geohashesCached: false,
            invalidFee: false,
            tokenTypes: [],
            additionalDescriptionLocalesByType: {},
            allAdditionalDescriptionLocalesDict: {},
            notCachedGeohashes: []
        }
    }
}
