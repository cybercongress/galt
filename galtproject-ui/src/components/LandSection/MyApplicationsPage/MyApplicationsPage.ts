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

import SpecifyPrecisionModal from '../../../modals/SpecifyPrecisionModal/SpecifyPrecisionModal';

import {
    EventBus,
    EXPLORER_DRAW_SPACE_TOKEN
} from '../../../services/events';

import GaltData from "../../../services/galtData";
import AttachSpaceTokenModal from "./modals/AttachSpaceTokenModal/AttachSpaceTokenModal";
import SubmitApplicationModal from "./modals/SubmitApplicationModal/SubmitApplicationModal";
import ResubmitApplicationModal from "./modals/ResubmitApplicationModal/ResubmitApplicationModal";
import Explorer from "../../Explorer/Explorer";
import CreateClaimManagerApplicationModal
    from "./modals/CreateClaimManagerApplicationModal/CreateClaimManagerApplicationModal";

export default {
    name: 'my-applications-page',
    template: require('./MyApplicationsPage.html'),
    components: {Explorer},
    created() {
        this.getApplicationStatuses();
        this.getApplicationContractsTypes();

        this.onLoadId = this.$locale.onLoad(() => {
            this.getApplicationStatuses();
            this.getApplicationContractsTypes();
        });
    },
    
    mounted() {
        this.getApplications();
    },
    
    beforeDestroy() {
        this.workerEvents.forEach(event => this.$geohashWorker.clearEvent(event.name, event.id));
        this.$locale.unbindOnLoad(this.onLoadId);
    },
    
    methods: {
        async getApplications() {
            this.loading = true;
            this.applications = await this.$galtUser.getUserApplications(this.filterByContractType, {
                withFinance: true,
                validationForAddress: GaltData.nullAddress
            });
            this.loading = false;
        },
        async getApplicationStatuses() {
            this.applicationStatuses = await this.$locale.setTitlesByNamesInList(this.$plotManagerContract.applicationStatuses, 'application_statuses.');
        },
        async getApplicationContractsTypes() {
            this.applicationContratsTypes = await this.$locale.setTitlesByNamesInList(GaltData.applicationContractsTypes, 'application_contracts_types.');
        },
        showApplication(application) {
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKEN, application.spaceToken);
        },

        createClaimManagerApplication() {
            this.$root.$asyncModal.open({
                id: 'create-claim-manager-application-modal',
                component: CreateClaimManagerApplicationModal,
                onClose: () => {
                    this.getApplications();
                }
            });
        },

        submitApplication(application) {
            this.$root.$asyncModal.open({
                id: 'submit-application-modal',
                component: SubmitApplicationModal,
                props: {
                    applicationId: application.id,
                    contractType: application.contractType
                },
                onClose: () => {
                    this.updateApplication(application);
                }
            });
        },

        resubmitApplication(application) {
            this.$root.$asyncModal.open({
                id: 'resubmit-application-modal',
                component: ResubmitApplicationModal,
                props: {
                    applicationId: application.id,
                    contractType: application.contractType
                },
                onClose: () => {
                    this.updateApplication(application);
                }
            });
        },
        
        async updateApplication(application, repeat = false) {
            GaltData.updateApplication(application, this.$galtUser.getApplication(application.contractType, application.id, {
                withFinance: true
            })).then(() => {
                if(repeat) {
                    return;
                }
                // Update one more time for solve problems of old data received
                setTimeout(() => {
                   this.updateApplication(application, true);
                }, 10 * 1000);
            })
        },

        async askForPecisionToCheckGeohashes(application) {
            this.$root.$asyncModal.open({
                id: 'specify-precision-modal',
                component: SpecifyPrecisionModal,
                props: {
                    precision: application.precision,
                },
                onClose: async (precision) => {
                    if(!precision) {
                        return;
                    }

                    this.checkGeohashes(application, precision);
                }
            });
        },

        async attachToken(application) {
            this.$root.$asyncModal.open({
                id: 'attach-space-token-modal',
                component: AttachSpaceTokenModal,
                props: {
                    applicationId: application.id,
                    tokenId: application.spaceTokenId,
                    contractName: 'plotCustodian',
                    methodName: 'attachToken',
                    withoutApprove: application.throughEscrow
                },
                onClose: () => {
                    this.updateApplication(application);
                }
            });
        },

        claimSpaceToken(application) {
            // TODO: use better method instead of validateApplication
            const result = this.$galtUser.validateApplication('claimSpaceToken', application).then(async () => {
                this.updateApplication(application);
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.claim_token.title'),
                    text: this.getLocale('success.claim_token.description')
                })
            });

            result.catch((e) => {
                console.error(e);
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.general.title'),
                    text: this.getLocale('error.general.description')
                })
            });

            return result;
        },

        approveApplication(application) {
            let methodName = 'approveApplication';
            if(application.contractType === 'plotCustodian') {
                methodName = 'approve';
            }
            const result = this.$galtUser.validateApplication(methodName, application).then(async () => {
                this.updateApplication(application);
            });

            result.catch((e) => {
                console.error(e);
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.general.title'),
                    text: this.getLocale('error.general.description')
                })
            });

            return result;
        },
        withdrawToken(application) {
            const methodName = application.contractType == 'plotClarification' ? 'withdrawPackageToken' : 'withdrawToken';
            // TODO: use more correct $galtUser method instead
            const result = this.$galtUser.validateApplication(methodName, application).then(async () => {
                this.updateApplication(application);
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.withdraw.title'),
                    text: this.getLocale('success.withdraw.description')
                })
            });

            result.catch((e) => {
                console.error(e);
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.general.title'),
                    text: this.getLocale('error.general.description')
                })
            });

            return result;
        },
        closeApplication(application) {
            // TODO: use more correct $galtUser method instead
            const result = this.$galtUser.validateApplication('closeApplication', application).then(async () => {
                this.updateApplication(application);
            });

            result.catch((e) => {
                console.error(e);
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.general.title'),
                    text: this.getLocale('error.general.description')
                })
            });

            return result;
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    watch: {
        filterByContractType() {
            this.getApplications();
        }
    },
    data() {
        return {
            localeKey: 'my_applications',
            loading: true,
            onLoadId: null,
            workerEvents: [],
            applications: [],
            filteredApplicationsCount: null,
            applicationStatuses: [],
            applicationContratsTypes: [],
            filterByStatus: 'all',
            filterByContractType: 'all'
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        },
        pm_user_applications_ids() {
            return this.$store.state.pm_user_applications_ids
        },
        filtered_applications() {
            let result;
            
            if(this.filterByStatus == 'all') {
                result = this.applications;
            } else {
                result = this.applications.filter((application) => {
                    return application.statusName == this.filterByStatus;
                });
            }
            
            this.filteredApplicationsCount = result.length;
            
            return result;
        }
    },
}
