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
import {
    EventBus, EXPLORER_DRAW_AREAS_LIST,
    EXPLORER_DRAW_SPACE_TOKEN
} from '../../../services/events';

import GaltData from "../../../services/galtData";
import CheckCredentialsModal from "./modals/CheckCredentialsModal/CheckCredentialsModal";
import ValidationByRoleModal from "./modals/ValidationByRoleModal/ValidationByRoleModal";
import AttachDocumentsModal from "./modals/AttachDocumentsModal/AttachDocumentsModal";
import Explorer from "../../Explorer/Explorer";
import CreateClaimManagerProposalModal from "./modals/CreateClaimManagerProposalModal/CreateClaimManagerProposalModal";
import EthData from "@galtproject/frontend-core/libs/EthData";

export default {
    name: 'validate-applications-page',
    template: require('./ValidateApplicationsPage.html'),
    components: {Explorer},
    created() {

    },
    async mounted() {
        this.$store.watch((state) => state.pm_user_applications_ids,
            (pm_user_applications_ids) => pm_user_applications_ids.length && this.getApplications()
        );
        this.$store.watch((state) => state.user_wallet,
            (user_wallet) => user_wallet && this.getOracleApplications()
        );
        if (this.user_wallet) {
            this.getOracleApplications();
        }

        this.getApplicationStatuses();
        this.getApplicationContractsTypes();

        this.onLoadId = this.$locale.onLoad(() => {
            this.getApplicationStatuses();
            this.getOracleRoles();
            this.getApplicationContractsTypes();
        });
    },
    beforeDestroy() {
        this.$locale.unbindOnLoad(this.onLoadId);
    },
    methods: {
        async getApplications() {
            this.loading = true;
            
            this.applications = await this.$galtUser.getAllApplications(this.filterByContractType, {
                withFinance: true,
                validationForAddress: this.user_wallet
            });
            
            this.loading = false;
        },
        async getOracleApplications() {
            this.getOracleRoles();
            this.getApplications();
            this.oracleApplicationsIds = await this.$galtUser.getOracleApplicationsIds();
        },
        async getOracleRoles() {
            this.oracleRolesNames = await this.$galtUser.getOracleRoles(this.filterByContractType);
            // console.error(this.user_wallet, this.oracleRolesNames);

            const rolesNames = _.clone(this.oracleRolesNames);
            rolesNames.unshift('all');

            this.oracleRoles = await this.$locale.setTitlesByNamesInList(rolesNames.map((role) => {
                return {name: role}
            }), 'validation_roles.');

            if (!this.filterByRole) {
                this.filterByRole = rolesNames[0];
            }
        },
        async getApplicationContractsTypes() {
            this.applicationContratsTypes = await this.$locale.setTitlesByNamesInList(GaltData.applicationContractsTypes, 'application_contracts_types.');
        },
        async getApplicationStatuses() {
            this.applicationStatuses = await this.$locale.setTitlesByNamesInList(this.$plotManagerContract.applicationStatuses, 'application_statuses.');
        },
        async showApplication(application) {
            if(!application.spaceToken) {
                return;
            }
            if(application.contractType == 'plotClarification') {
                EventBus.$emit(EXPLORER_DRAW_AREAS_LIST, [_.extend({}, application.spaceToken, {reset: true}), {
                    highlightContour: application.newGeoData.contour,
                    highlightContourType: 'error'
                }]);
            } else {
                EventBus.$emit(EXPLORER_DRAW_SPACE_TOKEN, application.spaceToken);
            }
        },
        
        async setApplicationStatus(application: any, status: string) {
            let methodName;
            let notifyMessage;

            switch (status) {
                case 'approved':
                    notifyMessage = {
                        type: 'success',
                        title: this.getLocale('success.approved.title'),
                        text: this.getLocale('success.approved.description')
                    };
                    
                    if (application.contractType == 'plotValuation') {
                        methodName = "approveValuation";
                    } else if (application.contractType == 'plotEscrow') {
                        methodName = "cancellationAuditApprove";
                        await this.validateApplication(methodName, application, application.buyer.address);
                        this.$notify(notifyMessage);
                        return;
                    } else if(application.contractType === 'plotCustodian') {
                        methodName = 'approve';
                    } else {
                        methodName = "approveApplication";
                    }
                    break;
                    
                case 'rejected':
                    notifyMessage = {
                        type: 'success',
                        title: this.getLocale('success.rejected.title'),
                        text: this.getLocale('success.rejected.description')
                    };
                    
                    if (application.contractType == 'plotValuation') {
                        methodName = "rejectValuation";
                    } else if (application.contractType == 'plotEscrow') {
                        methodName = "cancellationAuditReject";
                        await this.validateApplication(methodName, application, application.buyer.address);
                        this.$notify(notifyMessage);
                        return;
                    } else if(application.contractType === 'plotCustodian') {
                        methodName = 'reject';
                    } else {
                        methodName = "rejectApplication";
                    }
                    break;

                case 'reverted':
                    methodName = "revertApplication";
                    
                    notifyMessage = {
                        type: 'success',
                        title: this.getLocale('success.reverted.title'),
                        text: this.getLocale('success.reverted.description')
                    };
                    break;

                case 'locked':
                    notifyMessage = {
                        type: 'success',
                        title: this.getLocale('success.locked.title'),
                        text: this.getLocale('success.locked.description')
                    };
                    
                    if (application.contractType == 'plotValuation') {
                        methodName = "lockApplication";
                    } else if(application.contractType == 'plotCustodian') {
                        if(application.userChoosenCustodian) {
                            methodName = "accept";
                            await this.validateApplication(methodName, application);
                            this.$notify(notifyMessage);
                            return;
                        } else if(application.userCurrentCustodian) {
                            methodName = "lock";
                            await this.validateApplication(methodName, application);
                            this.$notify(notifyMessage);
                            return;
                        } else {
                            methodName = "auditorLock";
                        }
                    } else if(application.contractType == 'claimManager') {
                        methodName = "lock";
                        await this.validateApplication(methodName, application);
                        this.$notify(notifyMessage);
                        return;
                    } else if(application.contractType == 'plotEscrow') {
                        methodName = "lockForAudit";
                        await this.validateApplication(methodName, application, application.buyer.address);
                        this.$notify(notifyMessage);
                        return;
                    } else {
                        // TODO: rework plotManager for use lockApplication method name
                        methodName = "lockApplicationForReview";
                    }
                    // console.log(methodName, notifyMessage);
                    break;
            }

            // console.log('check status', methodName, notifyMessage);
            if (status == "locked") {
                if(application.userValidationRole) {
                    this.$notify({
                        type: 'error',
                        title: this.getLocale('error.already_locked.title'),
                        text: this.getLocale('error.already_locked.description')
                    });
                    return;
                }
                this.validationByRoleModal(application, methodName, true).then(async (result) => {
                    if(application.contractType == 'plotCustodian' && (result.role === 'PC_CUSTODIAN_ORACLE_TYPE' || result.role === 'PC_AUDITOR_ORACLE_TYPE') && application.applicant == this.user_wallet) {
                        this.$notify({
                            type: 'error',
                            title: this.getLocale('error.cant_be_oracle_for_yourself.title'),
                            text: this.getLocale('error.cant_be_oracle_for_yourself.description')
                        });
                        return;
                    }
                    let additionalParam = EthData.stringToHex(result.role);
                    
                    if(application.contractType == 'plotCustodian') {
                        additionalParam = null;
                    }
                    
                    await this.validateApplication(methodName, application, additionalParam);
                    this.$notify(notifyMessage);
                }).catch(() => {});

            } else if (status == "rejected" || status == "reverted") {
                this.validationByRoleModal(application, methodName, false, true).then(async (result) => {
                    await this.validateApplication(methodName, application, result.message);
                    this.$notify(notifyMessage);
                }).catch(() => {});

            } else {
                await this.validateApplication(methodName, application);
                this.$notify(notifyMessage);
            }
        },
        async validationByRoleModal(application, methodName, editRole, editMessage?) {
            const localesByMethods = {
                "lockApplication": "lock_application",
                'auditorLock': "lock_application",
                "lockApplicationForReview": "lock_application",
                "rejectApplication": "reject_application",
                "rejectValuation": "reject_application",
                "revertApplication": "revert_application"
            };

            let rolesNames = await this.$galtUser.getOracleRoles(application.contractType);
            
            if(application.contractType == 'plotCustodian') {
                rolesNames = ['PC_AUDITOR_ORACLE_TYPE'];
            }

            if(methodName == 'lockApplication' || methodName == 'lockApplicationForReview') {
                rolesNames = rolesNames.filter((roleName) => {
                    return !application.validationObj[roleName].oracle;
                });
            }
            
            if(!rolesNames.length) {
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.full_locked.title'),
                    text: this.getLocale('error.full_locked.description')
                });
                return;
            }

            const validationRoles = await this.$locale.setTitlesByNamesInList(rolesNames.map((role) => {
                return {name: role}
            }), 'validation_roles.');

            return new Promise((resolve, reject) => {
                this.$root.$asyncModal.open({
                    id: 'validation-by-role-modal',
                    component: ValidationByRoleModal,
                    props: {
                        method: methodName,
                        localeKey: localesByMethods[methodName],
                        editRole: editRole,
                        editMessage: editMessage,
                        defaultRole: validationRoles[0].name,
                        rolesList: validationRoles,
                        applicationId: application.id
                    },
                    onClose: (result) => {
                        if (!result) {
                            return reject();
                        }
                        resolve(result);
                    }
                });
            })
        },
        validateApplication(methodName, application, additionalParam?) {
            const result = this.$galtUser.validateApplication(methodName, application, additionalParam).then(() => {
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
        async valuate(application, valuateType) {
            GaltData.specifyAmountModal({
                title: this.getLocale("valuate_plot_modal.title"),
                placeholder: this.getLocale("valuate_plot_modal.placeholder"),
                defaultValue: EthData.weiToEther(application.firstValuation)
            }).then(async (amount: any) => {
                if (!amount) {
                    return;
                }
                await this.validateApplication(valuateType == 'first' ? 'valuatePlot' : 'valuatePlot2', application, EthData.etherToWei(amount));
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.valuate.title'),
                    text: this.getLocale('success.valuate.description')
                })
            });
        },
        attachDocuments(application) {
            this.$root.$asyncModal.open({
                id: 'attach-documents-modal',
                component: AttachDocumentsModal,
                props: {
                    applicationId: application.id,
                    contractName: 'plotCustodian',
                    methodName: 'attachDocuments'
                },
                onClose: () => {
                    this.updateApplication(application);
                }
            });
        },
        async updateApplication(application, repeat = false) {
            GaltData.updateApplication(application, this.$galtUser.getApplication(application.contractType, application.id, {
                withFinance: true,
                validationForAddress: this.user_wallet
            })).then(() => {
                if(repeat) {
                    return;
                }
                // Update one more time for solve problems of old data received
                setTimeout(() => {
                    this.updateApplication(application, true);
                }, 10 * 1000);
            });
        },
        createClaimManagerProposal(application) {
            this.$root.$asyncModal.open({
                id: 'create-claim-manager-proposal-modal',
                component: CreateClaimManagerProposalModal,
                props: {
                    applicationId: application.id
                },
                onClose: () => {
                    this.updateApplication(application);
                }
            });
        },
        
        async checkAndApprove(application) {
            if(application.contractType == 'plotManager') {
                this.$root.$asyncModal.open({
                    id: 'check-credentials-modal',
                    component: CheckCredentialsModal,
                    props: {credentialsHash: application.credentialsHash},
                    onClose: (valid) => {
                        if (!valid) {
                            return;
                        }
                        this.setApplicationStatus(application, 'approved');
                    }
                });
            } else if(application.contractType == 'plotValuation') {
                GaltData.confirmModal({
                    title: this.getLocale('approve_valuation.title', {
                        application_id: EthData.tokenIdToHex(application.id)
                    }),
                    contract: 'PlotValuationContract',
                    method: 'approve',
                    subject: application.id
                }).then(() => {
                    this.setApplicationStatus(application, 'approved');
                });
            } else if(application.contractType == 'plotCustodian') {
                GaltData.confirmModal({
                    title: this.getLocale('approve_custodian.title', {
                        application_id: EthData.tokenIdToHex(application.id),
                        custodian: this.user_wallet,
                        action: application.actionName
                    }),
                    contract: 'PlotCustodianContract',
                    method: 'approve',
                    subject: application.id
                }).then(() => {
                    this.setApplicationStatus(application, 'approved');
                });
            }
        },
        async getReward(application) {
            if(application.contractType == 'plotCustodian') {
                if(['approved', 'completed', 'rejected'].indexOf(application.generalStatusName) === -1) {
                    this.$notify({
                        type: 'error',
                        title: this.getLocale('error.need_approved_by_all_oracles.title'),
                        text: this.getLocale('error.need_approved_by_all_oracles.description')
                    });
                    return;
                }
            } else if(['approved', 'rejected'].indexOf(application.generalStatusName) === -1) {
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.need_approved_by_all_oracles.title'),
                    text: this.getLocale('error.need_approved_by_all_oracles.description')
                });
                return;
            }
            
            this.$galtUser.claimOracleReward(application).then(() => {
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.reward.title'),
                    text: this.getLocale('success.reward.description', {
                        value: GaltData.weiToEtherRound(application.reward),
                        currency: application.feeCurrencyName.toUpperCase()
                    })
                });
                this.updateApplication(application);
            });
        },

        claimGasDeposit(application) {
            // TODO: use more correct $galtUser method instead
            const result = this.$galtUser.validateApplication('claimGasDepositByOracle', application).then(async () => {
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
        voteForPropose(application, proposal) {
            GaltData.confirmModal({
                title: this.getLocale('vote_for_proposal_confirm.title', {
                    application_id: application.id,
                    proposal_id: proposal.id
                }),
                contract: 'ClaimManagerContract',
                method: 'vote',
                subject: application.id
            }).then(() => {
                this.$galtUser.voteForClaimManagerProposal(application, proposal)
                    .then(() => {
                        this.updateApplication(application);
                        this.$notify({
                            type: 'success',
                            title: this.getLocale('success.vote_for_proposal.title'),
                            text: this.getLocale('success.vote_for_proposal.description')
                        })
                    })
                    .catch(() => {
                        this.$notify({
                            type: 'error',
                            title: this.getLocale('error.general.title'),
                            text: this.getLocale('error.general.description')
                        })
                    })
            });
            
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    watch: {
        filterByStatus() {
            this.getOracleApplications();
        },
        filterByContractType() {
            this.getOracleApplications();
        }
    },
    data() {
        return {
            localeKey: 'validate_applications',
            loading: true,
            onLoadId: null,
            applications: [],
            oracleApplicationsIds: [],
            oracleRolesNames: [],
            oracleRoles: [],
            applicationStatuses: [],
            applicationContratsTypes: [],
            filterByStatus: 'all',
            filterByRole: 'all',
            filterByContractType: 'all'
        };
    },
    computed: {
        plotManager() {
            return this.$plotManagerContract;
        },
        user_wallet() {
            return this.$store.state.user_wallet
        },
        pm_user_applications_ids() {
            return this.$store.state.pm_user_applications_ids
        },
        filtered_applications() {
            let resultApplications = this.applications;

            if (this.filterByStatus != 'all') {
                resultApplications = this.applications.filter((application) => {
                    let showApplication = application.statusName == this.filterByStatus;
                    if (showApplication && _.includes(['locked', 'approved', 'rejected'], this.filterByStatus)) {
                        showApplication = _.includes(application.validatorsList, this.user_wallet);
                    }
                    return showApplication;
                });
            }

            if (this.filterByRole != 'all') {
                resultApplications = this.applications.filter((application) => {
                    return _.includes(application.assignedOracleRoles, this.filterByRole);
                });
            }

            return resultApplications;
        }
    },
}
