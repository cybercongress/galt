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
import GaltData from "../../../services/galtData";

export default {
    name: 'admin-space-dex',
    template: require('./AdminSpaceDex.html'),
    props: [],
    async mounted() {
        const interval = setInterval(() => {
            this.getSpaceDexData();
        }, 10000);

        this.intervals.push(interval);

        await this.getSpaceDexData();

        this.showOperationByNumber(this.operationsCount);
    },
    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },
    watch: {
        
    },
    methods: {
        async getSpaceDexData() {
            this.spaceToGaltSum = GaltData.weiToEtherRound(await this.getSpaceDexProp('spaceToGaltSum'));
            this.galtToSpaceSum = GaltData.weiToEtherRound(await this.getSpaceDexProp('galtToSpaceSum'));
            this.spacePriceOnSaleSum = GaltData.weiToEtherRound(await this.getSpaceDexProp('spacePriceOnSaleSum'));
            
            this.operationsCount = parseInt(await this.getSpaceDexProp('getOperationsCount'));
            
            this.sellFee = GaltData.weiToSzaboRound(await this.getSpaceDexProp('sellFee'));
            this.buyFee = GaltData.weiToSzaboRound(await this.getSpaceDexProp('buyFee'));
            this.feePayout = GaltData.weiToEtherRound(await this.getSpaceDexProp('feePayout'));
            this.feeTotalPayout = GaltData.weiToEtherRound(await this.getSpaceDexProp('feeTotalPayout'));

            this.galtBalance = await GaltData.galtBalance(this.$spaceDexContract.address);
            this.spaceBalance = await GaltData.spaceTokensCount(this.$spaceDexContract.address);
        },
        async getSpaceDexProp(property) {
            const result = await this.$spaceDexContract.massCallMethod(property);
            console.log('getSpaceDexProp', property, result);
            return result;
        },
        async withdrawFee() {
            await this.$galtUser.withdrawSpaceDexFee();

            this.$notify({
                type: 'success',
                title: this.getLocale("success.fee_payout.title"),
                text: this.getLocale("success.fee_payout.description", {value: this.feePayout})
            });
        },
        async editFee(direction) {
            GaltData.specifyAmountModal({
                title: this.getLocale("edit_" + direction + "_fee.title"),
                placeholder: this.getLocale("edit_" + direction + "_fee.placeholder"),
                defaultValue: direction == 'sell' ? this.sellFee : this.buyFee
            }).then(async (amount: any) => {
                this.$galtUser.setSpaceDexFee(amount, direction);
            });
        },
        async showOperationByNumber(showOperationNumber) {
            if(showOperationNumber < 1 || _.isNaN(parseInt(showOperationNumber))) {
                return;
            }
            this.showOperationNumber = showOperationNumber;
            const operationId = await this.$spaceDexContract.callMethod('operationsArray', showOperationNumber - 1);
            // console.log('allOperations', await this.$spaceDexContract.callMethod('getAllOperations'));
            // console.log('getOperationById', operationId);
            this.showOperation = await this.$spaceDexContract.callMethod('getOperationById', operationId);
            this.showOperation.id = operationId;
        },
        prevOperation(){
            this.showOperationByNumber(--this.showOperationNumber);
        },
        nextOperation(){
            this.showOperationByNumber(++this.showOperationNumber);
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    data() {
        return {
            localeKey: 'admin.spacedex',
            intervals: [],
            galtBalance: null,
            spacePriceOnSaleSum: null,
            operationsCount: null,
            spaceBalance: null,
            spaceToGaltSum: null,
            galtToSpaceSum: null,
            sellFee: null,
            buyFee: null,
            feePayout: null,
            feeTotalPayout: null,
            showOperationNumber: null,
            showOperation: null
        }
    }
}
