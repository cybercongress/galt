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

import FeeContractCard from "../FeeContractCard/FeeContractCard";
import ProposalCard from "../../../directives/ProposalCard/ProposalCard";
import EthData from "@galtproject/frontend-core/libs/EthData";
import PriceAndCurrencyInput from "../../../../../directives/PriceAndCurrencyInput/PriceAndCurrencyInput";
import PeriodInput from "../../../../../directives/PeriodInput/PeriodInput";
import GaltData from "../../../../../services/galtData";

const _ = require('lodash');

export default {
    name: 'create-tariff-page',
    template: require('./CreateTariffPage.html'),
    components: {FeeContractCard, ProposalCard, PriceAndCurrencyInput, PeriodInput},
    props: [],
    
    async mounted() {
        console.log('this.$route.query', this.$route.query);
        this.sra = await this.$fundsRegistryContract.getSRAByAddress(this.$route.params.sraAddress);
        await this.sra.fetchGeneralInfo();
        this.proposalManagerContract = await this.sra.storage.getModifyFeeProposalContract();
        
        this.getCurrentState();
    },
    
    watch: {
        user_wallet() {
            this.getCurrentState();
        },
        'feeContract.price'() {
            this.feeContract.rate = this.feeContract.price;
        },
        'feeContract.priceCurrency'() {
            this.feeContract.currency = this.feeContract.priceCurrency;
        }
    },
    
    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
        this.$locale.unbindOnLoad(this.onLoadId);
    },

    methods: {
        async getCurrentState() {
            if(!this.$route.query.feeContractAddress) {
                this.loading = false;
                return;
            }

            this.feeContract = await GaltData.getFundFeeContract(this.feeContractAddress);
            await this.feeContract.fetchInfo();
            this.isDetailsSet = await this.feeContract.getIsDetailsSet();
            
            this.loading = false;
            if (!this.isDetailsSet) {
                let tariffData;
                try {
                    tariffData = JSON.parse(localStorage.getItem('CreateTariffPage.feeContract'));
                } catch (e) {
                    // leave the this.tariffParams default value
                }
                if(tariffData) {
                    tariffData.price = tariffData.rate;
                    tariffData.priceCurrency = tariffData.currency;
                    _.extend(this.feeContract, tariffData)
                }
            }
        },
        
        async processCreation() {
            localStorage.setItem('CreateTariffPage.feeContract', JSON.stringify(_.pick(this.feeContract, ['title', 'description', 'docLink', 'proposalDescription', 'currency', 'category', 'rate', 'period'])));
            this.creating = true;
            this.$waitScreen.show();
            
            if(!this.feeContractAddress) {
                try {
                    const feeContractAddress = await this.$galtUser.createTariffContract(this.sra.storage, this.feeContract.category, this.feeContract);
                    this.$router.push({ 
                        // path: 'multisig-create-tariff-contract', 
                        query: _.extend({}, this.$route.query, { feeContractAddress })
                    });

                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.create_tariff.title"),
                        text: this.getLocale("success.create_tariff.description")
                    });
                } catch (e) {
                    console.error(e);
                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.create_tariff.title"),
                        text: this.getLocale("error.create_tariff.description", { error: e || e.message })
                    });
                    this.creating = false;
                    this.$waitScreen.hide();
                    return;
                }
            }

            try {
                const tariffContract = await GaltData.getFundFeeContract(this.feeContractAddress);
                
                await this.$galtUser.setTariffDetails(tariffContract, this.feeContract);
                this.isDetailsSet = true;
                this.$notify({
                    type: 'success',
                    title: this.getLocale("success.set_tariff_details.title"),
                    text: this.getLocale("success.set_tariff_details.description")
                });
            } catch (e) {
                console.error(e);
                this.$notify({
                    type: 'error',
                    title: this.getLocale("error.set_tariff_details.title"),
                    text: this.getLocale("error.set_tariff_details.description", { error: e || e.message })
                });
            }
            this.$waitScreen.hide();
            this.creating = false;
        },

        createProposal() {
            this.creating = true;
            this.$waitScreen.show();

            const methodFunc = this.sra.storage.contractInstance.methods.addFeeContract;
            const inputFields = EthData.getAbiMethodInputs(this.sra.storage.abi, 'addFeeContract');
            const data = EthData.applyMethodByInputsArr(methodFunc, inputFields, {
                'feeContract': this.feeContractAddress
            }).encodeABI();
            this.$galtUser.sraNewAbstractProposal(this.$route.params.sraAddress, this.proposalManagerContract.address, {
                'data': data,
                'description': this.feeContract.proposalDescription
            })
                .then((proposalId) => {
                    this.$router.push({
                        // path: 'multisig-create-tariff-contract',
                        query: _.extend({}, this.$route.query, { proposalId })
                    });
                    
                    this.$waitScreen.hide();
                    this.creating = false;
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.create_proposal.title"),
                        text: this.getLocale("success.create_proposal.description")
                    });
                })
                .catch((e) => {
                    this.$waitScreen.hide();
                    this.creating = false;
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.create_proposal.title"),
                        text: this.getLocale("error.create_proposal.description", { error: e || e.message })
                    });
                    this.sending = false;
                });
        },

        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        feeContractAddress() {
            return this.$route.query.feeContractAddress;
        },
        proposalId() {
            return this.$route.query.proposalId;
        },
        rateLabel() {
            this.$store.state.locale;
            return this.getLocale('form.rate');
        },
        
        runCreationDisabled() {
            return !this.user_wallet || !this.feeContract.title || !this.feeContract.description || !this.feeContract.docLink
                || !this.feeContract.proposalDescription || !this.feeContract.period || this.invalidRate
                || this.creating;
        },
        
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.create_tariff',
            intervals: [],
            loading: true,
            creating: false,
            proposalManagerContract: null,
            invalidRate: false,
            isDetailsSet: false,
            feeContract: {
                address: null,
                title: '',
                description: '',
                docLink: '',
                proposalDescription: '',
                currency: 'eth',
                category: 'regular',
                rate: '',
                period: 60 * 60 * 24 * 30
            }
        };
    }
}
