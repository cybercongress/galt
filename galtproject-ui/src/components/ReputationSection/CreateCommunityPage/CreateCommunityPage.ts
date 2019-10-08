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

import PeriodInput from "../../../directives/PeriodInput/PeriodInput";
import FeeInput from "../../../directives/FeeInput/FeeInput";
import SraCard from "../directives/SraCard/SraCard";

export default {
    name: 'create-community-page',
    template: require('./CreateCommunityPage.html'),
    components: {SraCard, PeriodInput, FeeInput},
    props: [],
    
    async mounted() {
        this.feeAmount = await this.$fundFactoryContract.getGaltFee();
        
        this.getCurrentOperation();
        
        this.onLoadId = this.$locale.onLoad(() => {
            this.setTabsTitle();
        });
        this.setTabsTitle();
        
        this.fundParams.multiSigInitialOwners = [this.user_wallet];
        this.fundParams.operator = this.user_wallet;
    },
    
    watch: {
        user_wallet() {
            this.getCurrentOperation();
            this.fundParams.multiSigInitialOwners = [this.user_wallet];
        }
    },
    
    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
        this.$locale.unbindOnLoad(this.onLoadId);
    },

    methods: {
        async getCurrentOperation() {
            this.fundCreation = await this.$fundFactoryContract.getLastCreatedContracts(this.$route.params.fundId);
            
            if(this.fundCreation.fundRa) {
                this.fundRaAddress = this.fundCreation.fundRa;
            }
            
            console.log('this.fundCreation', this.fundCreation);
            this.loading = false;
            if (this.fundCreation.currentStep > 0) {
                try {
                    this.fundParams = JSON.parse(localStorage.getItem('CreateCommunityPage.fundParams'));
                } catch (e) {
                    // leave the this.fundParams default value
                }
            }
            if(!this.fundParams.thresholds.length) {
                this.fundParams.thresholds = this.$fundFactoryContract.defaultThresholds;
            }
        },
        
        approveGalt() {
            this.approving = true;

            this.$galtUser.approveGalt(this.$root.$fundFactoryContract.address, this.fundParams.fee)
                .then(() => {
                    this.approved = true;
                    this.approving = false;
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.approve.title"),
                        text: this.getLocale("success.approve.description")
                    });
                })
                .catch((e) => {
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.approve.title"),
                        text: this.getLocale("error.approve.description")
                    });
                    this.approving = false;
                })
        },

        async processCreation() {
            localStorage.setItem('CreateCommunityPage.fundParams', JSON.stringify(this.fundParams));
            this.inProcess = true;
            this.$waitScreen.show();
            
            const stepsToFinish = this.$fundFactoryContract.totalSteps - this.fundCreation.currentStep;
            
            // const mode = await this.$galtUser.askForUseInternalWallet(
            //     'FundFactory',
            //     this.$fundFactoryContract.address,
            //     (await GaltData.gasPrice(6700000)) * stepsToFinish,
            //     stepsToFinish
            // );
            //
            // if (!mode) {
            //     this.$waitScreen.hide();
            //     return;
            // }
            
            this.$waitScreen.show();

            this.$galtUser.processFundCreation(this.fundParams, async (fundCreation) => {
                this.fundCreation = fundCreation;
                this.$router.replace({ name: "reputation-create-community", params: {fundId: fundCreation.fundId} });
                this.$waitScreen.changeCenterSubText(`${fundCreation.currentStep + 1}/${this.$fundFactoryContract.totalSteps}`);
            }).then(async (fundRaAddress) => {
                this.fundRaAddress = fundRaAddress;
                this.$waitScreen.hide();
                this.inProcess = false;
                this.ended = true;
                localStorage.removeItem('CreateCommunityPage.fundParams');
            }).catch(() => {
                this.inProcess = false;
            })
        },

        setTabsTitle() {
            ['general', 'thresholds', 'initial_owners', 'initial_space_tokens'].forEach((name) => {
                this.tabsLocales[name] = this.getLocale('form.' + name + '_tab');
            });
        },

        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    data() {
        return {
            localeKey: 'reputation.create_community',
            intervals: [],
            feeAmount: null,
            approving: false,
            approved: false,
            loading: true,
            ended: false,
            inProcess: false,
            fundCreation: null,
            fundParams: {
                operator: null,
                name: "",
                description: "",
                isPrivate: false,
                feePeriod: 60 * 60 * 24 * 30,
                thresholds: [],
                multiSigInitialOwners: [''],
                multiSigRequired: 1,
                initialSpaceTokensToApprove: [''],
                fee: null,
                feeCurrency: null
            },
            tabsLocales: {
                
            },
            fundRaAddress: null
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        },
        runCreationDisabled() {
            return !this.user_wallet || !this.fundParams.name || !this.fundParams.description 
                || this.fundParams.thresholds.filter(t => t).length !== this.$fundFactoryContract.defaultThresholds.length 
                || !this.fundParams.multiSigInitialOwners.length || !this.fundParams.multiSigRequired
                || this.fundParams.multiSigRequired > this.fundParams.multiSigInitialOwners.filter(owner => owner).length
                || (this.fundParams.isPrivate && !this.fundParams.initialSpaceTokensToApprove.length)
                || this.inProcess || this.approving;
        }
    }
}
