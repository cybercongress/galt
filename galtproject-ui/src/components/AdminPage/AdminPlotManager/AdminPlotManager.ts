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

import GaltData from "../../../services/galtData";
import EthData from "@galtproject/frontend-core/libs/EthData";

export default {
    name: 'admin-plot-manager',
    template: require('./AdminPlotManager.html'),
    props: [],
    mounted() {
        const interval = setInterval(() => {
            this.getPlotManagerData();
        }, 10000);

        this.intervals.push(interval);

        this.getPlotManagerData();
    },
    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },
    watch: {
        
    },
    methods: {
        async getPlotManagerData() {
            this.galtFeeRate = EthData.weiToGwei(await this.getPlotManagerProp('submissionFeeRateGalt'));
            this.ethFeeRate = EthData.weiToGwei(await this.getPlotManagerProp('submissionFeeRateEth'));
            this.ethShare = await this.getPlotManagerProp('galtSpaceEthShare');
            this.galtShare = await this.getPlotManagerProp('galtSpaceGaltShare');
            // this.gasPriceForDeposits = GaltData.weiToGwei(await this.getPlotManagerProp('gasPriceForDeposits'));
            //TODO: make multisig selector
            this.paymentMethod = await GaltData.getPaymentMethod('plotManager', GaltData.contractsConfig.arbitratorsMultiSigXAddress);

            this.galtBalance = await GaltData.galtBalance(this.$galtDexContract.address);
            this.ethBalance = await EthData.ethBalance(this.$galtDexContract.address);
        },
        async getPlotManagerProp(property) {
            const result = await this.$plotManagerContract.callMethod(property);
            console.log('getPlotManagerProp', property, result);
            return result;
        },
        editFeeRate(currency) {
            GaltData.specifyAmountModal({
                title: this.getLocale("edit_fee_rate.title",{currency: currency.toUpperCase()}),
                placeholder: this.getLocale("edit_fee_rate.placeholder"),
                defaultValue: currency == 'eth' ? this.ethFeeRate : this.galtFeeRate
            }).then(async (amount: any) => {
                this.handleTxPromise(this.$galtUser.setPlotManagerFee(currency, EthData.gweiToWei(amount)));
            }).catch(() => {});
        },
        editShare(currency) {
            GaltData.specifyAmountModal({
                title: this.getLocale("edit_fee_share.title",{currency: currency.toUpperCase()}),
                placeholder: this.getLocale("edit_fee_share.placeholder"),
                defaultValue: currency == 'eth' ? this.ethShare : this.galtShare
            }).then(async (amount: any) => {
                this.handleTxPromise(this.$galtUser.setPlotManagerShare(currency, amount));
            }).catch(() => {});
        },
        editPaymentMethod() {
            GaltData.specifySelectOptionModal({
                title: this.getLocale("edit_payment_method.title"),
                placeholder: this.getLocale("edit_payment_method.placeholder"),
                defaultValue: this.paymentMethod,
                titleValueList: GaltData.paymentMethods.map((method) => {return {name: method.name, title: this.$locale.get("payment_methods." + method.name)}})
            }).then(async (newPaymentMethod: any) => {
                this.handleTxPromise(this.$galtUser.setPlotManagerPaymentMethod(newPaymentMethod));
            }).catch(() => {});
        },
        editGasPriceForDeposits() {
            GaltData.specifyAmountModal({
                title: this.getLocale("edit_gas_price_for_deposits.title"),
                placeholder: this.getLocale("edit_gas_price_for_deposits.placeholder"),
                defaultValue: this.gasPriceForDeposits
            }).then(async (gasPriceForDeposits: any) => {
                this.handleTxPromise(this.$galtUser.setPlotManagerGasPriceForDeposits(gasPriceForDeposits));
            }).catch(() => {});
        },
        handleTxPromise(txPromise) {
            txPromise
                .then(() => {
                    this.getPlotManagerData();
                    this.$notify({
                        type: 'success',
                        title: this.$locale.get("admin.success.save.title")
                    });
                }).catch((e) => {
                    console.error(e);
                    this.$notify({
                        type: 'error',
                        title: this.$locale.get("admin.error.save.title")
                    });
                })
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    data() {
        return {
            localeKey: 'admin.plot_manager',
            intervals: [],
            galtFeeRate: null,
            ethFeeRate: null,
            ethShare: null,
            galtShare: null,
            paymentMethod: null,
            // gasPriceForDeposits: null
        }
    }
}
