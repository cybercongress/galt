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

import * as _ from 'lodash';
import EthData from "@galtproject/frontend-core/libs/EthData";
import MemberIdentificationInput from "./MemberIdentificationInput/MemberIdentificationInput";
import MultisigManagersInput from "./MultisigManagersInput/MultisigManagersInput";
import MsContractAddressInput from "./MsContractAddressInput/MsContractAddressInput";
import BooleanSelectInput from "./BooleanSelectInput/BooleanSelectInput";
import DecimalsInput from "./DecimalsInput/DecimalsInput";
const pIteration = require('p-iteration');

const inputConfig = require('./config');

export default {
    name: 'proposal-field-input',
    template: require('./ProposalFieldInput.html'),
    props: ['field', 'value', 'contractType', 'sraAddress', 'managerAddress'],
    components: {MemberIdentificationInput, MultisigManagersInput, MsContractAddressInput, BooleanSelectInput, DecimalsInput},
    mounted() {
        this.localOnLoadId = this.$locale.onLoad(() => {
            this.setPlaceholder();
        }).toString();

        this.setPlaceholder();
        this.setFieldType();

        if(this.fieldType === 'hidden') {
            this.localValue = _.get(inputConfig, this.fullFieldName + '.value');
        } else {
            this.localValue = this.value;
        }
    },
    beforeDestroy() {
        this.$locale.unbindOnLoad(this.localOnLoadId);
    },
    watch: {
        async field() {
            this.setPlaceholder();
            this.setFieldType();
        },
        localValue() {
            if(this.fieldType === 'autocomplete') {
                this.$emit('update:value', this.localValue ? this.localValue.value: null);
            } else if(this.fieldType === 'ether') {
                this.$emit('update:value', EthData.isNumber(this.localValue) ? EthData.etherToWei(this.localValue) : null);
            } else {
                this.$emit('update:value', this.localValue);
            }
        },
        contractType() {
            this.setFieldType();
        }
    },
    methods: {
        setPlaceholder() {
            if(this.$locale.has(this.fieldLocaleKey)) {
                this.placeholder = this.$locale.get(this.fieldLocaleKey);
            } else {
                this.placeholder = GaltData.humanizeKey(this.field.name);
            }
        },
        setFieldType() {
            if(_.includes(['bool'], this.field.type)) {
                this.fieldType = _.get(inputConfig, this.fullFieldName + '.type') || this.field.type || 'string';
            } else {
                this.fieldType = _.get(inputConfig, this.fullFieldName + '.type') || 'string';
            }
            this.getSelectorList();
        },
        async getSelectorList() {
            if (this.fieldType !== 'autocomplete' && this.fieldType !== 'select') {
                return;
            }
            const configList = _.get(inputConfig, this.fullFieldName + '.list');
            
            if(configList) {
                this.selectorList = configList;
            } else if(this.fullFieldName === 'modify_config.key') {
                if(!this.sraAddress) {
                    return console.error('[proposal-field-input] sraAddress are required');
                }
                
                this.loading = true;
                const sra = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);
                this.selectorList = (await sra.storage.getConfigKeys()).map((key) => {
                    return {
                        title: EthData.humanizeKey(EthData.hexToString(key)),
                        tip: EthData.hexToString(key),
                        value: key
                    }
                });
                this.loading = false;
            } else if(_.includes(this.fullFieldName, '.spaceTokenId')) {
                if(!this.sraAddress) {
                    return console.error('[proposal-field-input] sraAddress are required');
                }

                this.loading = true;
                const sra = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);
                this.selectorList = await pIteration.map((await sra.getSpaceTokensIds()), async (tokenId) => {
                    return {
                        title: tokenId,
                        tip: await GaltData.ownerOfTokenId(tokenId),
                        value: tokenId
                    }
                });
                this.loading = false;
            } else if(_.includes(this.fullFieldName, '.frpId')) {
                if(!this.sraAddress) {
                    return console.error('[proposal-field-input] sraAddress are required');
                }

                this.loading = true;
                const sra = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);
                await sra.fetchGeneralInfo();
                this.selectorList = await pIteration.map((await sra.storage.getActiveFundRules()), async (fundRule) => {
                    return {
                        title: fundRule.id,
                        tip: fundRule.description,
                        value: fundRule.id
                    }
                });
                this.loading = false;
            }

            this.selectorList.forEach(item => {
                item.toString = () => item.title;
                item.toLowerCase = () => item.title.toLowerCase;
            });
        }
    },
    computed: {
        fieldLocaleKey() {
            return 'reputation.sra_section.proposal_fields.' + this.fullFieldName;
        },
        fullFieldName() {
            return this.contractType + '.' + this.field.name;
        }
    },
    data() {
        return {
            placeholder: null,
            localValue: null,
            fieldType: 'string',
            loading: false,
            selectorList: [
                // { title, value, tip? }
            ]
        }
    }
}
