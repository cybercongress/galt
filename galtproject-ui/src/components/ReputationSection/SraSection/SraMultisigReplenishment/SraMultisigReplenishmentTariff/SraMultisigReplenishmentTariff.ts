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

import SraMembersFees from "../SraMembersFees/SraMembersFees";
import EthData from "@galtproject/frontend-core/libs/EthData";
import FeeContractCard from "../FeeContractCard/FeeContractCard";
import GaltData from "../../../../../services/galtData";
import TariffPayingControl from "../TariffPayingControl/TariffPayingControl";

const _ = require('lodash');

export default {
    name: 'sra-multisig-replenishment',
    template: require('./SraMultisigReplenishmentTariff.html'),
    components: {SraMembersFees, FeeContractCard, TariffPayingControl},
    async created() {
        this.debounceGetMyFee = _.debounce(this.getMyFee.bind(this), 200);
    },
    async mounted() {
        this.debounceGetMyFee();
    },
    methods: {
        async getMyFee() {
            if (!this.user_wallet) {
                return;
            }
            this.loading = true;
            this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.$route.params.sraAddress);
            const feeContract = await GaltData.getFundFeeContract(this.$route.params.feeContractAddress);

            this.cutAddress = EthData.cutHex(feeContract.address);
            this.rate = feeContract.rate;
            this.currency = await feeContract.currencyStr;

            this.payData = await feeContract.getPayData(this.sraContract, this.user_wallet);
            this.tokensCount = this.payData.tokensIds.length;

            this.loading = false;
        },
        
        async disableTariff() {
            this.loading = true;
            const proposalManagerContract = await this.sraContract.storage.getModifyFeeProposalContract();
            
            GaltData.specifyDescriptionModal({localeKey: this.localeKey + '.disable_tariff_description_modal'}).then((description) => {
                this.$waitScreen.show();
                
                const methodFunc = this.sraContract.storage.contractInstance.methods.removeFeeContract;
                const inputFields = EthData.getAbiMethodInputs(this.sraContract.storage.abi, 'removeFeeContract');
                const data = EthData.applyMethodByInputsArr(methodFunc, inputFields, {
                    'feeContract': this.$route.params.feeContractAddress
                }).encodeABI();
                this.$galtUser.sraNewAbstractProposal(this.$route.params.sraAddress, proposalManagerContract.address, {
                    'data': data,
                    'description': description
                })
                    .then(() => {
                        this.loading = false;
                        this.$waitScreen.hide();
                        this.$notify({
                            type: 'success',
                            title: this.getLocale("success.propose_remove.title"),
                            text: this.getLocale("success.propose_remove.description")
                        });
                    })
                    .catch((e) => {
                        console.error(e);

                        this.$notify({
                            type: 'error',
                            title: this.getLocale("error.propose_remove.title"),
                            text: this.getLocale("error.propose_remove.description", {error: e.message || e})
                        });
                        this.loading = false;
                        this.$waitScreen.hide();
                    })
            }).catch((e) => {
                this.loading = false;
            })
        },

        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    watch: {
        user_wallet() {
            this.debounceGetMyFee();
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.multisig_replenishment.tariff_page',
            loading: true,
            tokensCount: null,
            payData: null,
            paidUntil: null,
            rate: null,
            currency: null,
            cutAddress: '...'
        }
    }
}
