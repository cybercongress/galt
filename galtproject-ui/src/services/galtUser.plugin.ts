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

import GaltData from "./galtData";

import * as _ from 'lodash';
import EthData from "@galtproject/frontend-core/libs/EthData";
const galtUtils = require('@galtproject/utils');

export default {
    install (Vue, options: any = {}) {
        let walletAddress;

        let internalWalletAddress;
        let internalWalletPrivateKey;

        let internalWalletActive = false;

        function sendOptions(fromInternalWallet?) {
            if(fromInternalWallet && internalWalletActive) {
                return {from: internalWalletAddress, privateKey: internalWalletPrivateKey};
            } else {
                return {from: walletAddress};
            }
        }

        function getContract(contractName) {
            const contract = $contracts['$' + contractName];
            if(!contract) {
                throw "Contract " + contractName + " not found";
            }
            return contract;
        }

        let walletReadyCallback;
        let walletReadyPromise = new Promise((resolve, reject) => {
            walletReadyCallback = resolve;
        });
        
        function onWalletReady(){
            return new Promise((resolve, reject) => {
                if(walletAddress)
                    resolve();
                else
                    walletReadyPromise.then(() => {
                        resolve();
                    })
            });
        }
        
        const onInternalWalletSet = [];
        const onInternalWalletActivatedCallbacks = [];

        let $internalWallet;
        let $contracts;
        let $store;
        
        Vue.prototype.$galtUser = {
            init(internalWalletPlugin, contracts, store) {
                $internalWallet = internalWalletPlugin;
                $contracts = contracts;
                $store = store;

                $internalWallet.setActive(false);
                this.setInternalWallet($internalWallet.getAddress(), $internalWallet.getPrivate());
            },
            getAddress() {
                return walletAddress;
            },
            setAddress(_walletAddress) {
                let firstInit = false;
                if(!walletAddress) {
                    firstInit = true;
                }
                walletAddress = _walletAddress;
                if(firstInit) {
                    walletReadyCallback();
                }
            },

            getInternalWallet() {
                return internalWalletAddress;
            },
            setInternalWallet(_internalWalletAddress, _internalWalletPrivateKey) {
                internalWalletAddress = _internalWalletAddress;
                internalWalletPrivateKey = _internalWalletPrivateKey;

                onInternalWalletSet.forEach(callback => {
                    callback(_internalWalletAddress);
                });
            },
            getInternalWalletActive() {
                return internalWalletActive;
            },
            setInternalWalletActive(_active) {
                internalWalletActive = _active;

                onInternalWalletActivatedCallbacks.forEach(callback => {
                    callback(_active);
                });
            },

            onInternalWalletSet(callback) {
                onInternalWalletSet.push(callback);
            },

            onInternalWalletActivated(callback) {
                onInternalWalletActivatedCallbacks.push(callback);
            },
            
            getSendOptions: sendOptions,
            onWalletReady: onWalletReady,

            // Web3 Data
            async balance(currency) {
                await onWalletReady();
                if(currency.toLowerCase() == 'eth') {
                    return await this.ethBalance();
                } else if(currency.toLowerCase() == 'galt') {
                    return await this.galtBalance();
                } else {
                    return await this.erc20Balance(currency);
                }
            },
            async ethBalance() {
                await onWalletReady();
                return EthData.ethBalance(walletAddress);
            },
            async sendEthFromUserWaller(recipient, ethAmount) {
                return EthData.sendEthTo(sendOptions(), recipient, ethAmount);
            },
            async sendEthFromInternalWaller(recipient, ethAmount) {
                return EthData.sendEthTo(sendOptions(true), recipient, ethAmount);
            },

            // Erc20 Contract
            async erc20Balance(erc20Address) {
                await onWalletReady();
                return await GaltData.erc20Balance(erc20Address, walletAddress);
            },
            async approveErc20(erc20Address, address, galtAmount) {
                return await GaltData.approveErc20(sendOptions(), erc20Address, address, galtAmount);
            },
            async getErc20Allowance(erc20Address, address) {
                await onWalletReady();
                return await GaltData.getErc20Allowance(erc20Address, walletAddress, address);
            },

            // Galt Contract
            async galtBalance() {
                await onWalletReady();
                return await GaltData.galtBalance(walletAddress);
            },
            async transferGalt(recipient, galtAmount) {
                return await GaltData.transferGalt(sendOptions(), recipient, galtAmount);
            },
            async approveGalt(address, galtAmount) {
                return await GaltData.approveGalt(sendOptions(), address, galtAmount);
            },
            async getGaltAllowance(address) {
                await onWalletReady();
                return await GaltData.getGaltAllowance(walletAddress, address);
            },
            async waitForApproveGalt(addressForAprove, needGaltAmount){
                return new Promise((resolve, reject) => {
                    const interval = setInterval(async () => {
                        const galtAllowance = await this.getGaltAllowance(addressForAprove);

                        if (galtAllowance >= needGaltAmount) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 10000);
                });
            },

            // Space Contract
            async transferSpaceToken(recipient, transferSpaceToken) {
                return await GaltData.transferSpaceToken(sendOptions(), recipient, transferSpaceToken);
            },
            async spaceTokensCount() {
                await onWalletReady();
                return await GaltData.spaceTokensCount(walletAddress);
            },
            async getSpaceTokensIds() {
                await onWalletReady();
                return await GaltData.getUserSpaceTokensIds(walletAddress);
            },
            async getSpaceTokens() {
                await onWalletReady();
                return await GaltData.getUserSpaceTokens(walletAddress);
            },
            async getGeohashes() {
                await onWalletReady();
                return await GaltData.getUserGeohashes(walletAddress);
            },
            async approveSpace(address, spaceTokenId) {
                return await $contracts.$spaceToken.approveSpace(sendOptions(), address, spaceTokenId);
            },
            async approveAllSpace(address, bool) {
                if(address == internalWalletAddress) {
                    localStorage.setItem('ApprovedSpaceToInternal', JSON.stringify({
                        internalWallet: address,
                        method: 'setApprovalForAll'
                    }));
                }
                return await GaltData.approveAllSpace(sendOptions(), address, bool);
            },
            async checkAndReleaseApprovedSpaceFromInternal(){
                try {
                    const ApprovedSpaceToInternal = JSON.parse(localStorage.getItem('ApprovedSpaceToInternal'));
                    const isApproved = await this.isApprovedForAllSpace(ApprovedSpaceToInternal.internalWallet);
                    console.log('internalWalletAddress', internalWalletAddress);
                    if(isApproved) {
                        GaltData.approveAllSpace(sendOptions(), ApprovedSpaceToInternal.internalWallet, false);
                    } else {
                        localStorage.removeItem('ApprovedSpaceToInternal');
                    }
                    return isApproved;
                } catch(e) {
                    // no approved space
                    return false;
                }
            },
            async waitForReleaseApprovedSpaceFromInternal(){
                return new Promise((resolve, reject) => {
                    let ApprovedSpaceToInternal;
                    try {
                        ApprovedSpaceToInternal = JSON.parse(localStorage.getItem('ApprovedSpaceToInternal'));
                    } catch(e) {
                        resolve();
                    }
                    const interval = setInterval(async () => {
                        const isApproved = await this.isApprovedForAllSpace(ApprovedSpaceToInternal.internalWallet);

                        if (!isApproved) {
                            localStorage.removeItem('ApprovedSpaceToInternal');
                            clearInterval(interval);
                            resolve();
                        }
                    }, 10000);
                });
            },
            async isApprovedSpace(address, spaceTokenId) {
                await onWalletReady();
                return await GaltData.isApprovedSpace(walletAddress, address, spaceTokenId);
            },
            async isApprovedForAllSpace(address) {
                await onWalletReady();
                return await GaltData.isApprovedForAllSpace(walletAddress, address);
            },

            // SplitMerge Contract
            async setPackageContour(spaceTokenId, geohashesContour) {
                return await $contracts.$splitMerge.setPackageContour(sendOptions(true), spaceTokenId, geohashesContour)
                    // .catch(() => {
                    //     return GaltData.setPackageContour(sendOptions(), spaceTokenId, geohashesContour);
                    // });
            },
            async filterGeohashesByNotPermittedForAddToPackage(geohashes) {
                return await $contracts.$splitMerge.filterGeohashesByNotPermittedForAddToPackage(geohashes, walletAddress);
            },
            async splitGeohash(geohashTokenId) {
                return await $contracts.$splitMerge.splitGeohash(sendOptions(true), geohashTokenId)
                    // .catch(() => {
                    //     return GaltData.splitGeohash(sendOptions(), geohashTokenId);
                    // });
            },
            async mergeGeohash(geohashTokenId) {
                return await $contracts.$splitMerge.mergeGeohash(sendOptions(true), geohashTokenId)
                    // .catch(() => {
                    //     return GaltData.mergeGeohash(sendOptions(), geohashTokenId);
                    // });
            },
            async sortGeohashesAndSendToSpaceTokenForRemove(packageId, geohashes, getOperationId?) {
                return await $contracts.$splitMerge.sortGeohashesAndSendToSpaceTokenForRemove(sendOptions(true), packageId, geohashes, getOperationId);
            },
            async sortGeohashesAndSendToSpaceTokenForAdd(packageId, existsGeohashes, geohashesToAdd, getOperationId?) {
                return await $contracts.$splitMerge.sortGeohashesAndSendToSpaceTokenForAdd(sendOptions(true), packageId, existsGeohashes, geohashesToAdd, getOperationId);
            },
            async initPackage(firstGeohash) {
                return await $contracts.$splitMerge.initPackage(sendOptions(true), firstGeohash)
                    // .catch(() => {
                    //     return GaltData.initPackage(sendOptions(), firstGeohash);
                    // });
            },
            waitForAddPackage(spaceTokensIds) {
                const watchForAddress = sendOptions().from;

                return new Promise((resolve, reject) => {
                    const interval = setInterval(async () => {
                        const newSpaceTokensIds = await GaltData.getUserSpaceTokensIds(watchForAddress);
                        const diff = _.difference(newSpaceTokensIds, spaceTokensIds);

                        if(diff.length) {
                            diff.some((tokenId) => {
                                // if (!galtUtils.isPack(tokenId)) {
                                //     console.log('new actualLastSpaceTokenId but not pack:', tokenId);
                                //     return false;
                                // }

                                clearInterval(interval);

                                resolve(tokenId);
                                return true;
                            })
                        }
                    }, 10000);
                });
            },
            // waitForAddGeohashesToPack(tokenId, shouldGeohashesCount, onUpdateCallback?) {
            //     return new Promise((resolve, reject) => {
            //         const interval = setInterval(async () => {
            //             const packageGeohashesCount = await GaltData.getPackageGeohashesCount(tokenId);
            //
            //             if(onUpdateCallback) {
            //                 onUpdateCallback(packageGeohashesCount, shouldGeohashesCount);
            //             }
            //
            //             if(packageGeohashesCount >= shouldGeohashesCount) {
            //                 resolve();
            //                 clearInterval(interval);
            //             }
            //         }, 10000);
            //     });
            // },
            // waitForRemoveGeohashesFromPack(tokenId, shouldGeohashesCount, onUpdateCallback?) {
            //     return new Promise((resolve, reject) => {
            //         const interval = setInterval(async () => {
            //             const packageGeohashesCount = await GaltData.getPackageGeohashesCount(tokenId);
            //
            //             if(onUpdateCallback) {
            //                 onUpdateCallback(packageGeohashesCount, shouldGeohashesCount);
            //             }
            //
            //             if(packageGeohashesCount <= shouldGeohashesCount) {
            //                 resolve();
            //                 clearInterval(interval);
            //             }
            //         }, 10000);
            //     });
            // },
            waitForApproveToSpaceToken(address, spaceTokenId) {
                const watchForAddress = sendOptions().from;

                return new Promise((resolve, reject) => {
                    const interval = setInterval(async () => {
                        const isApproved = await GaltData.isApprovedSpace(watchForAddress, address, spaceTokenId);

                        if (isApproved) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 10000);
                });
            },
            async startSplitOperation(subjectSpaceTokenId, clippingContour) {
                return await $contracts.$splitMerge.startSplitOperation(sendOptions(), subjectSpaceTokenId, clippingContour);
            },
            async startSplitOperationSandbox(subjectSpaceTokenId, clippingContour) {
                return await $contracts.$splitMergeSandbox.startSplitOperation(sendOptions(), subjectSpaceTokenId, clippingContour);
            },
            async processSplitOperation(spaceSplitOperation, operationId) {
                const doneStage = await spaceSplitOperation.getDoneStage();
                
                let methodName;
                
                if(doneStage === 'contract_init') {
                    methodName = 'prepareAllPolygons';
                } else if(doneStage === 'polygons_prepare') {
                    methodName = 'initAllContours';
                } else if(doneStage === 'polygons_init') {
                    methodName = 'addAllPolygonsSegments';
                } else if(doneStage === 'segments_add') {
                    methodName = 'processMartinezRueda';
                } else if(doneStage === 'martinez_rueda_process') {
                    methodName = 'addIntersectedPoints';
                } else if(doneStage === 'intersects_points_add') {
                    const isBuildResultFinished = await spaceSplitOperation.isBuildResultFinished();
                    if(!isBuildResultFinished) {
                        methodName = 'buildResultPolygon';
                    } else {
                        methodName = 'buildSubjectPolygonOutput';
                    }
                } else if(doneStage === 'weiler_atherton_build') {
                    methodName = 'finishAllPolygons';
                }

                await spaceSplitOperation.sendMethodForOperation(sendOptions(true), operationId, methodName);
                
                if(methodName != 'finishAllPolygons') {
                    return await this.processSplitOperation(spaceSplitOperation, operationId);
                }
            },
            async finishSplitOperation(subjectSpaceTokenId) {
                return await $contracts.$splitMerge.finishSplitOperation(sendOptions(), subjectSpaceTokenId);
            },
            async finishSplitOperationSandbox(subjectSpaceTokenId) {
                return await $contracts.$splitMergeSandbox.finishSplitOperation(sendOptions(), subjectSpaceTokenId);
            },
            async cancelSplitOperation(subjectSpaceTokenId) {
                return await $contracts.$splitMerge.cancelSplitOperation(sendOptions(), subjectSpaceTokenId);
            },
            async cancelSplitOperationSandbox(subjectSpaceTokenId) {
                return await $contracts.$splitMergeSandbox.cancelSplitOperation(sendOptions(), subjectSpaceTokenId);
            },
            async mergePackage(expandableTokenId, mergeTokenId) {
                const expandableContour = await GaltData.getPackageContour(expandableTokenId);
                const mergeContour = await GaltData.getPackageContour(mergeTokenId);
                const mergeResult = galtUtils.geohash.contour.mergeContours(expandableContour, mergeContour);
                return await $contracts.$splitMerge.mergePackage(sendOptions(), mergeTokenId, expandableTokenId, mergeResult);
            },
            async mergePackageSandbox(expandableTokenId, mergeTokenId) {
                const expandableContour = await GaltData.getPackageContour(expandableTokenId);
                const mergeContour = await GaltData.getPackageContour(mergeTokenId);
                const mergeResult = galtUtils.geohash.contour.mergeContours(expandableContour, mergeContour);
                return await $contracts.$splitMergeSandbox.mergePackage(sendOptions(), mergeTokenId, expandableTokenId, mergeResult);
            },

            // PlotManagerContract Contract: for applicant
            async userApplicationsIds(contractName) {
                await onWalletReady();
                return await getContract(contractName).userApplicationsIds(walletAddress);
            },
            async getUserApplications(contractName, params?){
                await onWalletReady();
                let applications = [];
                
                if(contractName == 'plotManager' || contractName == 'all') {
                    applications = applications.concat(await $contracts.$plotManager.getApplicationsByIds(await this.userApplicationsIds('plotManager'), params))
                }

                if(contractName == 'plotClarification' || contractName == 'all') {
                    applications = applications.concat(await $contracts.$plotClarification.getApplicationsByIds(await this.userApplicationsIds('plotClarification'), params))
                }
                
                if(contractName == 'plotCustodian' || contractName == 'all') {
                    applications = applications.concat(await $contracts.$plotCustodian.getApplicationsByIds(await this.userApplicationsIds('plotCustodian'), params))
                }

                //TODO: enable market
                // if(contractName == 'plotValuation' || contractName == 'all') {
                //     applications = applications.concat(await $contracts.$plotValuation.getApplicationsByIds(await this.userApplicationsIds('plotValuation'), params))
                // }
                //
                // if(contractName == 'plotEscrow' || contractName == 'all') {
                //     applications = applications.concat(await $contracts.$plotEscrow.getApplicationsByIds(await this.userApplicationsIds('plotEscrow'), params))
                // }

                if(contractName == 'claimManager' || contractName == 'all') {
                    applications = applications.concat(await $contracts.$claimManager.getApplicationsByIds(await this.userApplicationsIds('claimManager'), params))
                }
                
                return applications;
            },
            async getApplication(contractName, applicationId, params?) {
                return await getContract(contractName).getApplicationById(applicationId, params);
            },
            async getAllApplications(contractName, options: any = {}) {
                let applications = [];

                if(contractName == 'plotManager' || contractName == 'all') {
                    applications = applications.concat(await $contracts.$plotManager.getAllApplications(options))
                }

                if(contractName == 'plotClarification' || contractName == 'all') {
                    applications = applications.concat(await $contracts.$plotClarification.getAllApplications(options))
                }

                //TODO: enable market
                // if(contractName == 'plotValuation' || contractName == 'all') {
                //     applications = applications.concat(await $contracts.$plotValuation.getAllApplications(options))
                // }
                //
                // if(contractName == 'plotEscrow' || contractName == 'all') {
                //     applications = applications.concat(await $contracts.$plotEscrow.getAllApplications(options));
                //     applications = applications.concat(await $contracts.$plotEscrow.getOracleApplications(sendOptions().from));
                // }

                if(contractName == 'plotCustodian' || contractName == 'all') {
                    applications = applications.concat(await $contracts.$plotCustodian.getAllApplications(options))
                }

                if(contractName == 'claimManager' || contractName == 'all') {
                    applications = applications.concat(await $contracts.$claimManager.getAllApplications(options))
                }
                
                return applications;
            },
            async filterGeohashesByNotPermittedForAddToApplication(geohashes) {
                await onWalletReady();
                return await $contracts.$plotManager.filterGeohashesByNotPermittedForAddToApplication(geohashes, walletAddress);
            },
            async applyForPlotOwnership(options) {
                // options.packageContour = galtUtils.geohash.contour.sortClockwise(options.packageContour);
                return await $contracts.$plotManager.applyForPlotOwnership(sendOptions(), options);
            },
            async applyForPlotClarification(options) {
                // options.packageContour = galtUtils.geohash.contour.sortClockwise(options.packageContour);
                return await $contracts.$plotClarification.submitApplication(sendOptions(), options);
            },
            async addZeroGeohashes(application) {
                return await $contracts.$plotManager.addZeroGeohashes(sendOptions(), application);
            },
            async submitPlotManagerApplication(application) {
                return await $contracts.$plotManager.submitApplication(sendOptions(), application);
            },
            async changeApplicationDetails(application) {
                return await $contracts.$plotManager.changeApplicationDetails(sendOptions(), application);
            },
            async resubmitPlotManagetApplication(application) {
                return await $contracts.$plotManager.resubmitApplication(sendOptions(), application);
            },
            async sortGeohashesAndSendToPlotManagerForAdd(applicationId, existsGeohashes, geohashesToAdd, getOperationId?) {
                return await $contracts.$plotManager.sortGeohashesAndSendForAdd(sendOptions(true), applicationId, existsGeohashes, geohashesToAdd, getOperationId);
            },
            async sortGeohashesAndSendToPlotManagerForRemove(applicationId, geohashesToRemove, getOperationId?) {
                return await $contracts.$plotManager.sortGeohashesAndSendForRemove(sendOptions(true), applicationId, geohashesToRemove, getOperationId);
            },
            async approveApplicationForOperator(address, applicationId) {
                if(address == internalWalletAddress) {
                    localStorage.setItem('ApprovedApplicationToInternal', JSON.stringify({
                        internalWallet: address,
                        method: 'setApprovalForAll',
                        subjectId: applicationId
                    }));
                }
                return await $contracts.$plotManager.approveApplicationForOperator(sendOptions(), address, applicationId);
            },
            async checkAndReleaseApprovedApplicationFromInternal(){
                try {
                    const ApprovedApplicationToInternal = JSON.parse(localStorage.getItem('ApprovedApplicationToInternal'));
                    const subjectId = ApprovedApplicationToInternal.subjectId;
                    const isApproved = await this.isApprovedApplicationForOperator(ApprovedApplicationToInternal.internalWallet, subjectId);
                    if(isApproved) {
                        $contracts.$plotManager.approveApplicationForOperator(sendOptions(), GaltData.nullAddress, subjectId);
                    } else {
                        localStorage.removeItem('ApprovedApplicationToInternal');
                    }
                    return isApproved;
                } catch(e) {
                    // no approved applications
                    return false;
                }
            },
            clearApprovedApplicationFromInternal(){
                localStorage.removeItem('ApprovedApplicationToInternal');
            },
            async waitForReleaseApprovedApplicationFromInternal(){
                return new Promise((resolve, reject) => {
                    let ApprovedApplicationToInternal;
                    try {
                        ApprovedApplicationToInternal = JSON.parse(localStorage.getItem('ApprovedApplicationToInternal'));
                    } catch(e) {
                        resolve();
                    }
                    const interval = setInterval(async () => {
                        const isApproved = await $contracts.$plotManager.isApprovedApplicationForOperator(ApprovedApplicationToInternal.internalWallet, ApprovedApplicationToInternal.subjectId);

                        if (!isApproved) {
                            localStorage.removeItem('ApprovedApplicationToInternal');
                            clearInterval(interval);
                            resolve();
                        }
                    }, 10000);
                });
            },
            waitForApproveToApplication(address, applicationId) {
                return new Promise((resolve, reject) => {
                    const interval = setInterval(async () => {
                        const isApproved = await $contracts.$plotManager.isApprovedApplicationForOperator(address, applicationId);

                        if (isApproved) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 10000);
                });
            },
            async isApprovedApplicationForOperator(address, applicationId) {
                return await $contracts.$plotManager.isApprovedApplicationForOperator(address, applicationId);
            },
            async waitForAddApplication(contractName) {
                const contract = getContract(contractName);
                
                const watchForAddress = sendOptions().from;

                const applicationsCount = (await contract.userApplicationsIds(watchForAddress)).length;

                return new Promise((resolve, reject) => {
                    const interval = setInterval(() => {
                        contract.userApplicationsIds(watchForAddress).then((applicationsIds) => {
                            if(applicationsIds.length > applicationsCount) {
                                clearInterval(interval);
                                resolve(_.last(applicationsIds));
                            }
                        });
                    }, 10000);
                });
            },
            waitForAddGeohashesToApplication(application, needGeohashesCount, onUpdateCallback?) {
                return new Promise((resolve, reject) => {
                    const interval = setInterval(async () => {
                        const actualGeohashesCount = await $contracts.$plotManager.getApplicationGeohashesCount(application);

                        if(onUpdateCallback) {
                            onUpdateCallback(actualGeohashesCount, needGeohashesCount);
                        }

                        if (actualGeohashesCount >= needGeohashesCount) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 10000);
                });
            },
            waitForRemoveGeohashesFromApplication(application, needGeohashesCount, onUpdateCallback?) {
                return new Promise((resolve, reject) => {
                    const interval = setInterval(async () => {
                        const actualGeohashesCount = await $contracts.$plotManager.getApplicationGeohashesCount(application);

                        if(onUpdateCallback) {
                            onUpdateCallback(actualGeohashesCount, needGeohashesCount);
                        }

                        if (actualGeohashesCount <= needGeohashesCount) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 10000);
                });
            },

            // PlotManagerContract Contract: for oracle
            async getOracleApplicationsIds() {
                await onWalletReady();
                let resultApplications = [];

                resultApplications = resultApplications.concat(await $contracts.$plotManager.getOracleApplicationsIds(walletAddress));
                resultApplications = resultApplications.concat(await $contracts.$plotManager.getOracleApplicationsIds(walletAddress));

                return resultApplications;
            },
            async validateApplication(methodName, application, additionalParam?) {
                if(methodName == 'approveApplication' && application.contractType == 'plotManager') {
                    additionalParam = application.credentialsHash;
                }
                if(application.contractType == 'plotCustodian' && (methodName == 'lockApplication' || methodName == 'acceptApplication' || methodName == 'approveApplication')) {
                    additionalParam = null;
                }
                return await getContract(application.contractType).validateApplication(sendOptions(), methodName, application, additionalParam);
            },
            async claimOracleReward(application) {
                return await getContract(application.contractType).claimOracleReward(sendOptions(), application.id);
            },
            async isOracle() {
                await onWalletReady();
                return await GaltData.isOracle(walletAddress);
            },
            async hasPlotManagerRole(role) {
                await onWalletReady();
                return await $contracts.$plotManager.hasRole(walletAddress, role);
            },
            async hasGaltDexRole(role) {
                await onWalletReady();
                return await $contracts.$galtDex.hasRole(walletAddress, role);
            },
            async hasOraclesRole(role) {
                await onWalletReady();
                return await GaltData.hasOraclesRole(walletAddress, role);
            },
            async setPlotManagerFee(currency, amount) {
                return await $contracts.$plotManager.setApplicationFee(sendOptions(), currency, amount);
            },
            async setPlotManagerShare(currency, amount) {
                return await $contracts.$plotManager.setGaltSpaceShare(sendOptions(), currency, amount);
            },
            async setPlotManagerPaymentMethod(paymentMethod) {
                return await $contracts.$plotManager.setPaymentMethod(sendOptions(), paymentMethod);
            },
            async setPlotManagerGasPriceForDeposits(gasPriceInGwei) {
                return await $contracts.$plotManager.setGasPriceForDeposits(sendOptions(), gasPriceInGwei);
            },

            // ClaimManager Contract
            async createClaimManagerApplication(options) {
                return await $contracts.$claimManager.submitApplication(sendOptions(), options);
            },
            async createClaimManagerProposal(options) {
                return await $contracts.$claimManager.createProposal(sendOptions(), options);
            },
            async voteForClaimManagerProposal(application, proposal) {
                return await $contracts.$claimManager.vote(sendOptions(), application, proposal);
            },
            async sendClaimManagerMessage(applicationId, text) {
                return await $contracts.$claimManager.sendMessage(sendOptions(), applicationId, text);
            },
            
            // PlotValuation Contract
            async applyForPlotValuation(options) {
                return await $contracts.$plotValuation.submitApplication(sendOptions(), options);
            },

            // PlotCustodian Contract
            async applyForPlotCustodian(options) {
                return await $contracts.$plotCustodian.submitApplication(sendOptions(), options);
            },
            async getCustodians(){
                let custodiansAddresses = await $contracts.$oracles.callMethod('getOraclesByOracleType', EthData.stringToHex("PC_CUSTODIAN_ORACLE_TYPE"));

                custodiansAddresses = _.uniq(custodiansAddresses);
                
                return custodiansAddresses.map((address) => {
                    const custodianObj: any = {
                        address,
                        name: "",
                        position: "",
                        roles: [],
                        descriptionHashes: []
                    };

                    GaltData.getOracle(address).then((oracleInfo) => {
                        _.extend(custodianObj, oracleInfo);
                    });

                    custodianObj.toString = custodianObj.toLowerCase = function () {
                        return this.name ? (this.name + " - " + this.position + " (" + this.address + ")") : this.address;
                    };
                    
                    return custodianObj;
                });
            },
            async attachDocuments(application) {
                return await getContract(application.contractType).attachDocuments(sendOptions(), application.id, application.documents);
            },
            async attachSpaceToken(contractName, params) {
                return await getContract(contractName).attachToken(sendOptions(), params.applicationId);
            },
            
            // Oracles Contract
            async getApplicationRoles(contractType = 'all') {
                let resultRoles = [];

                if(contractType == 'plotManager' || contractType == 'all') {
                    resultRoles = resultRoles.concat(await GaltData.getApplicationRoles('plotManager'))
                }

                if(contractType == 'plotClarification' || contractType == 'all') {
                    resultRoles = resultRoles.concat(await GaltData.getApplicationRoles('plotClarification'))
                }

                if(contractType == 'plotValuation' || contractType == 'all') {
                    resultRoles = resultRoles.concat(await GaltData.getApplicationRoles('plotValuation'))
                }

                if(contractType == 'plotEscrow' || contractType == 'all') {
                    resultRoles = resultRoles.concat(await GaltData.getApplicationRoles('plotEscrow'))
                }

                if(contractType == 'plotCustodian' || contractType == 'all') {
                    resultRoles = resultRoles.concat(await GaltData.getApplicationRoles('plotCustodian'))
                }
                
                return resultRoles;
            },
            async setApplicationRoles(roles, type = 'plotManager') {
                return await GaltData.setApplicationRoles(sendOptions(), roles, type);
            },
            async deleteApplicationRoles(type = 'plotManager') {
                return await GaltData.deleteApplicationRoles(sendOptions(), type);
            },
            async getOracleRoles(contractType = 'all') {
                await onWalletReady();
                const rolesNames = await GaltData.getOracleRoles(walletAddress);
                if(contractType == 'all') {
                    return rolesNames;
                }
                const contractRolesNames = await GaltData.getApplicationRoles(contractType);
                return _.intersection(rolesNames, contractRolesNames);
            },
            async editOracle(oracleData) {
                return await GaltData.editOracle(sendOptions(), oracleData);
            },
            async deactivateOracle(oracleAddress) {
                return await GaltData.deactivateOracle(sendOptions(), oracleAddress);
            },
            async getApplicationRolesData(type = 'plotManager') {
                return await GaltData.getApplicationRolesData(type);
            },
            async addOracleStake(multisigAddress, role, stake) {
                await onWalletReady();
                const oracleStakesContract = await GaltData.getOSAofMultisig(multisigAddress);
                return await oracleStakesContract.addStake(sendOptions(), walletAddress, role, stake);
            },

            // GaltDex Contract: for fee_manager
            async withdrawGaltDexEthFee() {
                return await $contracts.$galtDex.withdrawEthFee(sendOptions());
            },
            async withdrawGaltDexGaltFee() {
                return await $contracts.$galtDex.withdrawGaltFee(sendOptions());
            },
            async setGaltDexFee(currency, amount) {
                return await $contracts.$galtDex.setFee(sendOptions(), currency, amount);
            },

            // GaltDex Contract: for user
            async exchangeEthToGalt(ethAmount) {
                return await $contracts.$galtDex.exchangeEthToGalt(sendOptions(), ethAmount);
            },
            async exchangeGaltToEth(galtAmount) {
                return await $contracts.$galtDex.exchangeGaltToEth(sendOptions(), galtAmount);
            },

            // SpaceDex Contract: for fee_manager
            async withdrawSpaceDexFee() {
                return await $contracts.$spaceDex.withdrawFee(sendOptions());
            },
            async setSpaceDexFee(amount, direction) {
                return await $contracts.$spaceDex.setFee(sendOptions(), amount, direction);
            },
            
            async generateNewInternalWallet(){
                const isActive = this.getInternalWalletActive();
                if(!isActive){
                    this.setInternalWalletActive(true);
                }
                
                $internalWallet.generateNew();
                const newInternalAddress = $internalWallet.getAddress();
                
                const promise = this.sendAllInternalWalletEthTo(newInternalAddress);
                
                this.setInternalWallet(newInternalAddress, $internalWallet.getPrivate());
                
                if(!isActive){
                    this.setInternalWalletActive(false);
                }
                return await promise;
            },

            async sendAllInternalWalletEthTo(recipient){
                return EthData.sendAllEthTo(sendOptions(true), recipient);
            },
            
            async needEthForGeohashesTransactions(txCount){
                const internalWalletEthBalance = await EthData.ethBalance(internalWalletAddress);
                const transactionsPrice = await GaltData.calculateEthForGeohashesTransactions(txCount);
                return transactionsPrice - internalWalletEthBalance;
            },

            async checkGeohashesCountAndAskUserForInternalWallet(contractName, subjectId, geohashesCount, ethPerTx?){
                const txCount = Math.ceil(geohashesCount / GaltData.geohashesPerTransactionAdd);
                if(txCount <= 5) {
                    return 'metamask';
                }

                const sendEthPromise = this.generateNewInternalWallet();

                // Deprecated code for autosending transaction via internal wallet
                // if(internalWalletActive) {
                //     const needEthForTransactions = await this.needEthForGeohashesTransactions(txCount);
                //
                //     if(needEthForTransactions <= 0) {
                //         if(contractName == 'SplitMerge') {
                //             const isApproved = await this.isApprovedSpace(internalWalletAddress, subjectId);
                //             if(isApproved) {
                //                 return false;
                //             }
                //         } else if(contractName == 'PlotManagerContract') {
                //             const isApproved = await this.isApprovedApplicationForOperator(internalWalletAddress, subjectId);
                //             if(isApproved) {
                //                 return false;
                //             }
                //         }
                //     }
                // }

                return GaltData.useInternalWalletModal(contractName, subjectId, txCount, ethPerTx, sendEthPromise).catch(() => {
                    return false;
                })
            },
            
            async askForUseInternalWallet(contractName, contractAddress, txPrice, txCount) {
                const sendEthPromise = this.generateNewInternalWallet();
                return await GaltData.useInternalWalletModal(contractName, contractAddress, txCount, txPrice, sendEthPromise);
            },

            async releaseInternalWallet(contractName, subjectId) {
                if(!internalWalletActive) {
                    return;
                }

                await onWalletReady();
                
                this.sendAllInternalWalletEthTo(walletAddress);
                
                $internalWallet.setActive(false);
                this.setInternalWalletActive(false);

                if(contractName == 'SplitMerge') {
                    const isApproved = await this.isApprovedSpace(internalWalletAddress, subjectId);
                    if(isApproved) {
                        await GaltData.approveAllSpace(sendOptions(), internalWalletAddress, false);
                    }
                } else if(contractName == 'PlotManagerContract') {
                    const application = await $contracts.$plotManager.getApplicationById(subjectId);
                    if(application.applicant != walletAddress) {
                        this.clearApprovedApplicationFromInternal();
                        return;
                    }
                    const isApproved = await this.isApprovedApplicationForOperator(internalWalletAddress, subjectId);
                    if(isApproved) {
                        await $contracts.$plotManager.approveApplicationForOperator(sendOptions(), GaltData.nullAddress, subjectId);
                    }
                }
            },
            
            // SpaceDex Contract: for user
            async getSpaceTokensForSale() {
                const userSpaceTokens = await this.getSpaceTokens();
                return await $contracts.$spaceDex.filterSpaceTokensByAvailableForSellOnSpaceDex(userSpaceTokens);
            },
            async exchangeSpaceToGalt(spaceTokenId) {
                return await $contracts.$spaceDex.exchangeSpaceToGalt(sendOptions(), spaceTokenId);
            },
            async exchangeGaltToSpace(spaceTokenId) {
                return await $contracts.$spaceDex.exchangeGaltToSpace(sendOptions(), spaceTokenId);
            },

            // PlotEscrow Contract: for user
            async getOrder(contractName, orderId, params?) {
                return await getContract(contractName).getOrderById(orderId, params);
            },
            async placePlotEscrowOrder(order) {
                return await $contracts.$plotEscrow.placeOrder(sendOptions(), order);
            },
            async placePlotEscrowBid(order, bid) {
                return await $contracts.$plotEscrow.placeBid(sendOptions(), order, bid);
            },
            async changePlotEscrowBid(order, bid) {
                return await $contracts.$plotEscrow.changeBid(sendOptions(), order, bid);
            },
            async changePlotEscrowAsk(order, offer, ask) {
                return await $contracts.$plotEscrow.changeAsk(sendOptions(), order, offer, ask);
            },
            async selectPlotEscrowOffer(order, bid) {
                return await $contracts.$plotEscrow.selectOffer(sendOptions(), order, bid);
            },
            async attachSpaceTokenToPlotEscrow(orderId, buyer) {
                return await $contracts.$plotEscrow.attachSpaceToken(sendOptions(), orderId, buyer);
            },
            async attachPaymentToPlotEscrow(order) {
                return await $contracts.$plotEscrow.attachPayment(sendOptions(), order, walletAddress);
            },
            async cancelPlotEscrowOffer(order, offer) {
                return await $contracts.$plotEscrow.cancelSaleOffer(sendOptions(), order, offer);
            },
            async cancelRequestPlotEscrowOffer(order, offer) {
                return await $contracts.$plotEscrow.requestCancellationAudit(sendOptions(), order, offer);
            },
            async emptyPlotEscrowOffer(order, offer) {
                return await $contracts.$plotEscrow.emptySaleOffer(sendOptions(), order, offer);
            },
            async reopenPlotEscrowOrder(order, offer) {
                return await $contracts.$plotEscrow.reopenSaleOrder(sendOptions(), order, offer);
            },
            async withdrawPlotEscrowSpaceToken(order, offer) {
                return await $contracts.$plotEscrow.withdrawSpaceToken(sendOptions(), order, offer);
            },
            async withdrawPlotEscrowPayment(order, offer) {
                return await $contracts.$plotEscrow.withdrawPayment(sendOptions(), order, offer);
            },
            async resolvePlotEscrowOffer(order, offer) {
                return await $contracts.$plotEscrow.resolve(sendOptions(), order, offer);
            },
            async cancelPlotEscrowOrder(order) {
                return await $contracts.$plotEscrow.cancelOrder(sendOptions(), order);
            },
            async applyForPlotEscrowCustodian(application) {
                return await $contracts.$plotEscrow.applyForCustodian(sendOptions(), application);
            },
            async withdrawPlotEscrowSpaceTokenFromCustodian(order) {
                return await $contracts.$plotEscrow.withdrawFromCustodian(sendOptions(), order);
            },
            async claimPlotEscrowPayment(order, offer) {
                return await $contracts.$plotEscrow.claimPayment(sendOptions(), order, offer);
            },
            async claimPlotEscrowSpaceToken(order, offer) {
                return await $contracts.$plotEscrow.claimSpaceToken(sendOptions(), order, offer);
            },
            async plotEscrowSellerOrders() {
                await onWalletReady();
                return await $contracts.$plotEscrow.getSellerOrders(walletAddress);
            },
            async plotEscrowSellerOrdersCount() {
                await onWalletReady();
                return await $contracts.$plotEscrow.getSellerOrdersCount(walletAddress);
            },
            async plotEscrowBuyerOrders() {
                await onWalletReady();
                return await $contracts.$plotEscrow.getBuyerOrders(walletAddress);
            },
            async plotEscrowBuyerOrdersCount() {
                await onWalletReady();
                return await $contracts.$plotEscrow.getBuyerOrdersCount(walletAddress);
            },
            async plotEscrowOpenOrders() {
                return await $contracts.$plotEscrow.getAllOrders();
            },
            async plotEscrowOpenOrdersCount() {
                return await $contracts.$plotEscrow.getAllOrdersCount();
            },

            // Geodesic
            async cacheGeohashListToLatLonAndUtm(geohashContour) {
                return $contracts.$geodesic.cacheGeohashListToLatLonAndUtm(sendOptions(), geohashContour);
            },
            async cacheGeohashListToLatLon(geohashContour) {
                return $contracts.$geodesic.cacheGeohashListToLatLon(sendOptions(), geohashContour);
            },
            async cacheLatLonListToGeohash(latLonList) {
                return $contracts.$geodesic.cacheLatLonListToGeohash(sendOptions(), latLonList);
            },
            async cacheLatLonListToUtm(latLonList) {
                return $contracts.$geodesic.cacheLatLonListToUtm(sendOptions(), latLonList);
            },
            
            // SpaceLocker
            async buildLocker(currency) {
                const options: any = sendOptions();
                if(currency === 'eth') {
                    options.ether = await $contracts.$feeRegistry.getEthFee("SPACE_LOCKER_FACTORY");
                }
                return $contracts.$slf.buildLocker(options);
            },
            async spaceLockerDeposit(spaceLockerAddress, spaceTokenId) {
                const spaceLocker = await $contracts.$slr.getSpaceLockerByAddress(spaceLockerAddress);
                return spaceLocker.deposit(sendOptions(), spaceTokenId);
            },
            async spaceLockerWithdraw(spaceLockerAddress, spaceTokenId) {
                const spaceLocker = await $contracts.$slr.getSpaceLockerByAddress(spaceLockerAddress);
                return spaceLocker.withdraw(sendOptions(), spaceTokenId);
            },
            async spaceLockerApproveMint(spaceLockerAddress, sraAddress) {
                const spaceLocker = await $contracts.$slr.getSpaceLockerByAddress(spaceLockerAddress);
                return spaceLocker.approveMint(sendOptions(), sraAddress);
            },
            async spaceLockerApproveBurn(spaceLockerAddress, sraAddress) {
                const spaceLocker = await $contracts.$slr.getSpaceLockerByAddress(spaceLockerAddress);
                return spaceLocker.approveBurn(sendOptions(), sraAddress);
            },
            
            // SRA
            async sraMint(sraAddress, spaceLockerAddress) {
                const sra = await $contracts.$fundsRegistry.getSRAByAddress(sraAddress);
                return sra.mint(sendOptions(), spaceLockerAddress);
            },
            async sraNewMemberProposal(sraAddress, spaceLockerAddress, description) {
                const spaceLocker = await $contracts.$slr.getSpaceLockerByAddress(spaceLockerAddress);
                await spaceLocker.fetchTokenInfo();
                
                const sra = await $contracts.$fundsRegistry.getSRAByAddress(sraAddress);
                const newMemberProposalAddress = await sra.storage.getFirstContractAddressByType('new_member');
                return sra.storage.newProposal(sendOptions(), newMemberProposalAddress, [spaceLocker.spaceTokenId, description]);
            },
            async sraNewAbstractProposal(sraAddress, proposalManagerAddress, proposal) {
                const sra = await $contracts.$fundsRegistry.getSRAByAddress(sraAddress);
                await sra.fetchGeneralInfo();
                const proposalContract = await sra.storage.getProposalManagerContract(proposalManagerAddress);
                return proposalContract.proposeByObj(sendOptions(), proposal);
            },
            async sraAcceptProposal(sraAddress, proposalManagerAddress, proposalId) {
                const sra = await $contracts.$fundsRegistry.getSRAByAddress(sraAddress);
                const proposalContract = await sra.storage.getProposalManagerContract(proposalManagerAddress);
                return proposalContract.acceptProposal(sendOptions(), proposalId);
            },
            async sraDeclineProposal(sraAddress, proposalManagerAddress, proposalId) {
                const sra = await $contracts.$fundsRegistry.getSRAByAddress(sraAddress);
                const proposalContract = await sra.storage.getProposalManagerContract(proposalManagerAddress);
                return proposalContract.declineProposal(sendOptions(), proposalId);
            },
            async sraTriggerApproveProposal(sraAddress, proposalManagerAddress, proposalId) {
                const sra = await $contracts.$fundsRegistry.getSRAByAddress(sraAddress);
                const proposalContract = await sra.storage.getProposalManagerContract(proposalManagerAddress);
                return proposalContract.triggerApproveProposal(sendOptions(), proposalId);
            },
            async sraTriggerRejectProposal(sraAddress, proposalManagerAddress, proposalId) {
                const sra = await $contracts.$fundsRegistry.getSRAByAddress(sraAddress);
                const proposalContract = await sra.storage.getProposalManagerContract(proposalManagerAddress);
                return proposalContract.triggerRejectProposal(sendOptions(), proposalId);
            },
            async sraBurn(sraAddress, spaceLockerAddress) {
                const sra = await $contracts.$fundsRegistry.getSRAByAddress(sraAddress);
                return sra.burn(sendOptions(), spaceLockerAddress);
            },
            
            async sraDelegateReputation(sraAddress, fromOwner, toAddress, amount) {
                const sra = await $contracts.$fundsRegistry.getSRAByAddress(sraAddress);
                return sra.delegateReputation(sendOptions(), fromOwner, toAddress, amount);
            },
            async sraRevokeReputation(sraAddress, fromAddress, amount) {
                const sra = await $contracts.$fundsRegistry.getSRAByAddress(sraAddress);
                return sra.revokeReputation(sendOptions(), fromAddress, amount);
            },
            
            async startFundCreation(fundParams) {
                return await $contracts.$fundFactory.buildFirstStep(sendOptions(true), fundParams);
            },
            async processFundCreation(fundParams, onStepCallback?) {
                const fundContracts = await $contracts.$fundFactory.getLastCreatedContracts(fundParams.fundId);

                if(onStepCallback) {
                    onStepCallback(fundContracts);
                }
                
                let methodName;

                if(fundContracts.currentStep === 0) {
                    methodName = 'buildFirstStep';
                } else if(fundContracts.currentStep === 1) {
                    methodName = 'buildSecondStep';
                } else if(fundContracts.currentStep === 2) {
                    methodName = 'buildThirdStep';
                } else if(fundContracts.currentStep === 3) {
                    methodName = 'buildFourthStep';
                } else if(fundContracts.currentStep === 4) {
                    methodName = 'buildFifthStep';
                } else if(fundContracts.currentStep === 5) {
                    methodName = 'buildSixthStep';
                } else if(fundContracts.currentStep === 6) {
                    methodName = 'buildSeventhStep';
                } else if(fundContracts.currentStep === 7) {
                    methodName = 'buildEighthStep';
                }
                
                const stepEvent = await $contracts.$fundFactory[methodName](sendOptions(true), fundParams);
                
                if(methodName === 'buildFirstStep') {
                    fundParams.fundId = stepEvent.fundId;
                }
                
                if(methodName != 'buildEighthStep') {
                    return await this.processFundCreation(fundParams, onStepCallback);
                }
                return fundContracts.fundRa;
            },

            createTariffContract(fundStorage, category, params) {
                let factory;
                let args;
                const initialTimestamp = (Math.round(new Date().getTime() / 1000) - params.period).toString(10);
                const period = params.period.toString();
                const rate = EthData.etherToWei(params.rate);
                
                if(params.currency === 'eth') {
                    factory = $contracts.$regularEthFeeFactory;
                    args = [fundStorage.address, initialTimestamp, period, rate];
                } else {
                    factory = $contracts.$regularErc20FeeFactory;
                    args = [params.currency, fundStorage.address, initialTimestamp, period, rate];
                }

                return factory.build(sendOptions(true), args);
            },

            setTariffDetails(tariffContract, params) {
                params.feeType = params.category + '_' + (params.currency === 'eth' ? params.currency : 'erc20');
                return tariffContract.setDetails(sendOptions(true), params);
            },

            tariffPayArray(tariffContract, tokensIds, amounts, currency) {
                return tariffContract.payArray(sendOptions(true), tokensIds, amounts, currency);
            },

            tariffLockArray(tariffContract, tokensIds) {
                return tariffContract.lockArray(sendOptions(true), tokensIds);
            },

            tariffUnlockArray(tariffContract, tokensIds) {
                return tariffContract.unlockArray(sendOptions(true), tokensIds);
            },

            async contractSendMethod(contract, methodName, arg1, arg2, additionalSendOptions?) {
                return await contract[methodName](_.extend({}, sendOptions(), additionalSendOptions || {}), arg1, arg2);
            },

            async contractSendData(contract, data, additionalSendOptions?) {
                return await contract.sendMethodByData(_.extend({}, sendOptions(), additionalSendOptions || {}), data);
            }
        };

        Vue.prototype.$ethUser = Vue.prototype.$galtUser;
    }
}
