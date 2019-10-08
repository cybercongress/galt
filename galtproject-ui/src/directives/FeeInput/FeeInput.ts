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
import GaltData from "../../services/galtData";

export default {
    name: 'fee-input',
    template: require('./FeeInput.html'),
    props: ['value', 'disabled', 'applicationType', 'invalidFee', 'forValidation'],//, 'ethPledge'
    async created() {
        await this.getMinFee();

        this.paymentMethod = await GaltData.getPaymentMethod(this.applicationType, this.value.multiSig);

        // if (this.ethPledge) {
        //     this.$set(this.value, 'ethPledge', this.ethPledge);
        // }

        let setCurrency;
        if(this.applicationType === 'plotManagerResubmit') {
            setCurrency = this.value.currency;
        }
        
        if(!setCurrency) {
            setCurrency = this.paymentMethod.indexOf('eth') !== -1 ? 'eth' : 'galt';
        }
        
        if (setCurrency === 'eth') {
            this.$set(this.value, 'feeCurrency', 'eth');
            this.$set(this.value, 'fee', this.minEthFee);
        } else {
            this.$set(this.value, 'feeCurrency', 'galt');
            this.$set(this.value, 'fee', this.minGaltFee);
        }

        this.changeFee();
    },
    methods: {
        async getMinFee() {
            const application = _.clone(this.value);
            if (!application.contractType) {
                if(this.applicationType === 'plotManagerResubmit') {
                    application.contractType = 'plotManager';
                } else {
                    application.contractType = this.applicationType;
                }
            }
            this.minEthFee = await GaltData.getApplicationFeeInEth(application);
            this.minGaltFee = await GaltData.getApplicationFeeInGalt(application);
        },
        changeFee() {
            this.$emit('input', this.value);
            this.$emit('change', this.value);

            const invalidFee = this['min' + GaltData.upperFirst(this.value.feeCurrency) + 'Fee'] > this.value.fee;
            this.$emit('update:invalidFee', invalidFee);
        }
    },
    watch: {
        'value.feeCurrency': async function () {
            await this.getMinFee();
            this.value.fee = this['min' + GaltData.upperFirst(this.value.feeCurrency) + 'Fee'];
            this.changeFee();
        },
        'value.customArea': async function () {
            await this.getMinFee();
            this.value.fee = this['min' + GaltData.upperFirst(this.value.feeCurrency) + 'Fee'];
            this.changeFee();
        },
        // 'ethPledge': async function () {
        //     this.$set(this.value, 'ethPledge', this.ethPledge);
        //     this.changeFee();
        // }
    },
    computed: {
        localeKey() {
            if(this.forValidation) {
                return 'fee_for_validation_input';
            } else if(this.amountDisabled) {
                return 'fee_input';
            } else {
                return 'fee_with_amount_input';
            }
        },
        help() {
            this.$store.state.locale;
            return this.$locale.get(this.localeKey + '.help');
        },
        currencyDisabled() {
            return this.applicationType === 'plotManagerResubmit';
        },
        amountDisabled() {
            return this.applicationType === 'spaceLockerFactory' || this.applicationType === 'fundFactory';
        }
    },
    data() {
        return {
            minEthFee: null,
            minGaltFee: null,
            paymentMethod: null
        }
    }
}
