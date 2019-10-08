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
import MemberIdentificationOutput from "./MemberIdentificationOutput/MemberIdentificationOutput";
import BooleanSelectOutput from "./BooleanSelectOutput/BooleanSelectOutput";
import MsContractAddressOutput from "./MsContractAddressOutput/MsContractAddressOutput";
import TokenContract from "@galtproject/frontend-core/components/GaltMultisig/contracts/TokenContract";
const outputConfig = require('./config');

export default {
    name: 'proposal-field-output',
    template: require('./ProposalFieldOutput.html'),
    props: ['field', 'value', 'contractType', 'sraAddress', 'managerAddress', 'proposal'],
    components: {MemberIdentificationOutput, BooleanSelectOutput, MsContractAddressOutput},
    mounted() {
        this.localOnLoadId = this.$locale.onLoad(() => {
            this.setPlaceholder();
        }).toString();

        this.setPlaceholder();
        this.setFieldType();
        this.setFormattedValue();
    },
    beforeDestroy() {
        this.$locale.unbindOnLoad(this.localOnLoadId);
    },
    watch: {
        async field() {
            this.setPlaceholder();
            this.setFieldType();
            this.setFormattedValue();
        },
        value() {
            this.setFormattedValue();
        },
        proposal() {
            this.setFormattedValue();
        }
    },
    methods: {
        setPlaceholder() {
            if(this.$locale.has(this.fieldLocaleKey)) {
                this.title = this.$locale.get(this.fieldLocaleKey);
            } else {
                this.title = GaltData.humanizeKey(this.field.name);
            }
        },
        setFieldType() {
            this.url = null;

            if(_.includes(['bool'], this.field.type)) {
                this.fieldType =  _.get(outputConfig, this.fullFieldName + '.type') || this.field.type;
                return;
            }
        
            const fieldConfig =  _.get(outputConfig, this.fullFieldName);
            this.fieldType = _.get(outputConfig, this.fullFieldName + '.type') || 'string';
            
            if(this.fieldType === 'link') {
                this.url = _.template(fieldConfig.urlTemplate)({
                    value: this.value,
                    sraAddress: this.sraAddress
                });
            } else if(this.fieldType === 'string' && _.includes(this.field.name, 'ipfs')) {
                this.fieldType = 'ipfsHash';
            } else if(this.fieldType === 'string' && _.isArray(this.value) && EthData.isAddressValid(this.value[0])) {
                this.fieldType = 'address-list';
            }
        },
        async setFormattedValue() {
            const config = _.get(outputConfig, this.fullFieldName);
            let value = this.value;
            if(value && value.add) {
                value = value.toString(10);
            }
            if(this.fieldType === 'ether') {
                value = EthData.weiToEther(value);
            }
            if(this.fieldType === 'decimals') {
                const tokenAddress = this.proposal[config.tokenAddressField];

                const tokenContract = await EthData.initContract(TokenContract, tokenAddress, GaltData.erc20Abi);
                const decimals = await tokenContract.getDecimals();
                value = EthData.weiToDecimals(value, EthData.isNumber(decimals) ? decimals : 18);
            }
            this.formattedValue = EthData.formatFieldValue(this.field, value, true, config);
        },
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
            title: null,
            fieldType: null,
            url: null,
            formattedValue: ''
        }
    }
}
