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
import EthData from "@galtproject/frontend-core/libs/EthData";

const pIteration = require('p-iteration');
const _ = require('lodash');

export default {
    name: 'sra-properties',
    template: require('./SraProperties.html'),
    props: ['sraAddress'],
    async mounted() {
        this.getSraPropertiesList();
    },
    watch: {
        sraAddress() {
            this.getSraPropertiesList();
        }
    },
    methods: {
        setActiveTab(tabName) {
            this.activeTab = tabName;
        },
        async getSraPropertiesList() {
            this.loading = true;

            this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);
            
            if(!this.sraContract.storage) {
                return;
            }

            const propertiesKeys = await this.sraContract.storage.getConfigKeys();

            this.propertiesList = await pIteration.map(propertiesKeys, async (configKey) => {
                const property = {
                    key: configKey,
                    name: EthData.hexToString(configKey),
                    nameStr: null,
                    value: await this.sraContract.storage.getConfigValue(configKey),
                    valueStr: null
                };
                
                if(this.$locale.has(this.localeKey + '.titles.' + property.name)) {
                    property.nameStr = this.$locale.get(this.localeKey + '.titles.' + property.name);
                } else {
                    property.nameStr = EthData.humanizeKey(property.name);
                }

                property.valueStr = EthData.formatFieldValue({ type: 'uint256', name: property.name }, property.value, true);
                
                if(this.$locale.has(this.localeKey + '.values.' + property.name + '.' + property.valueStr)) {
                    property.valueStr = this.$locale.get(this.localeKey + '.values.' + property.name + '.' + property.valueStr);
                }
                
                return property;
            });
            
            this.loading = false;
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_properties',
            propertiesList: [],
            loading: true,
            activeTab: 'thresholds'
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        },
        tabPropertiesList() {
            if(this.activeTab === 'thresholds') {
                return _.filter(this.propertiesList, (property) => {
                    return _.includes(property.name, 'threshold');
                })
            } else {
                return _.filter(this.propertiesList, (property) => {
                    return !_.includes(property.name, 'threshold');
                })
            }
        }
    }
}
