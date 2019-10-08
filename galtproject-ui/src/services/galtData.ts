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

import * as pIteration from "p-iteration";
import * as _ from "lodash";
import ConfirmModal from "../modals/ConfirmModal/ConfirmModal";
import SpecifyAmountModal from "../modals/SpecifyAmountModal/SpecifyAmountModal";
import UseInternalWalletModal from "../modals/UseInternalWalletModal/UseInternalWalletModal";
import SpecifySelectOptionModal from "../modals/SpecifySelectOptionModal/SpecifySelectOptionModal";
import ChangelogModal from "../modals/ChangelogModal/ChangelogModal";
import * as moment from 'moment';
import SpecifyDescriptionModal from "../modals/SpecifyDescriptionModal/SpecifyDescriptionModal";
import Web3Manager from "@galtproject/frontend-core/libs/Web3Manager";
import EthData from "@galtproject/frontend-core/libs/EthData";

const EthContract = require('../libs/EthContract');
const config = require("../../config");
const galtUtils = require('@galtproject/utils');

export default class GaltData {
    static contractsConfig: any;
    static contractsConfigPromise: any;
    
    static cachedLocale: {[language: string]: any} = {};
    static $http: any;
    static $store: any;
    static $root: any;
    static $web3Worker: any;
    static $contracts: any;
    static $serverWeb3: any;
    static $web3: any;
    
    static operationsCount: number = 0;
    
    static gasForSendGeohashes: number = 7524849;

    static geohashesPerTransactionAdd = 15;
    static geohashesPerTransactionRemove = 15;
    
    static nullAddress = '0x0000000000000000000000000000000000000000';
    static nullBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
    
    static applicationTypes = {
        'plotManager': '0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6',
        'plotClarification': '0x6f7c49efa4ebd19424a5018830e177875fd96b20c1ae22bc5eb7be4ac691e7b7',
        'plotValuation': '0x619647f9036acf2e8ad4ea6c06ae7256e68496af59818a2b63e51b27a46624e9',
        'plotCustodian': '0xe2ce825e66d1e2b4efe1252bf2f9dc4f1d7274c343ac8a9f28b6776eb58188a6',
        'plotEscrow': '0xf17a99d990bb2b0a5c887c16a380aa68996c0b23307f6633bd7a2e1632e1ef48',
        'claimManager': '0x6cdf6ab5991983536f64f626597a53b1a46773aa1473467b6d9d9a305b0a03ef'
    };

    static spaceTokensTypes = [
        {name: "all"},
        {name: 'plot'},
        {name: 'building'},
        {name: 'predefined_building'},
        {name: 'predefined_room'}
    ];
    
    static applicationContractsTypes = [
        {name: "all"},
        {name: 'plotManager'},
        {name: 'plotClarification'},
        {name: 'plotValuation'},
        {name: 'plotCustodian'},
        {name: 'claimManager'}
    ];
    
    static applicationCurrencies = [
        {id: 0, name: 'eth'},
        {id: 1, name: 'galt'}
    ];

    static paymentMethods = [
        {id: 0, name: 'none'},
        {id: 1, name: 'eth'},
        {id: 2, name: 'galt'},
        {id: 3, name: 'eth_and_galt'}
    ];
    
    static erc20Abi = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]';

    static config;
    
    static async init(vueInstance) {
        this.config = config;
        this.$http = vueInstance.$http;
        this.$store = vueInstance.$store;
        this.$root = vueInstance.$root;
        this.$web3Worker = vueInstance.$web3Worker;
        this.$contracts = vueInstance.$contracts;

        await Web3Manager.initClientWeb3();
        await Web3Manager.initServerWeb3([config.rpcServer]);
        await Web3Manager.onClientWeb3Ready();
    }

    static rpcServer() {
        return config.rpcServer;
    }

    static wsServer() {
        return config.wsServer;
    }
    
    static callMethodsRpcServer() {
        if(config.enableWebSocket) {
            return GaltData.wsServer();
        } else {
            return GaltData.rpcServer();
        }
    }

    static rpcServerId() {
        return config.rpcServerId;
    }

    static contractsDeploymentId() {
        return config.contractsDeploymentId;
    }

    static altRpcServers() {
        return (config.altRpcServers || "").split(",");
    }

    static allowableRpcServers() {
        const allServers = GaltData.altRpcServers();
        allServers.unshift(GaltData.rpcServer());
        return allServers;
    }

    static version() {
        return config.version;
    }
    
    static async getChangelogHtml() {
        return new Promise((resolve, reject) => {
            this.$http.get('/build/changelog.html').then((response) => {
                resolve(response.data);
            });
        });
    }

    static async getContractsConfig(networkId) {
        this.contractsConfigPromise = new Promise((resolve, reject) => {
            if (this.contractsConfig)
                return resolve(this.contractsConfig);

            this.$http.get(config.contractsConfigUrl + networkId + '.json?cacheBuster=' + new Date().getTime()).then((response) => {
                if(!response || !response.data) {
                    setTimeout(() => GaltData.getContractsConfig(networkId), 1000);
                    return;
                }
                this.contractsConfig = response.data;
                console.log('contractsConfig', this.contractsConfig);
                resolve(this.contractsConfig);
            }).catch(() => {
                setTimeout(() => {
                    GaltData.getContractsConfig(networkId).then(resolve);
                }, 1000);
            });
        });
        return this.contractsConfigPromise;
    }

    static async getLocale(language) {
        return new Promise((resolve, reject) => {
            if (this.cachedLocale[language])
                return resolve(this.cachedLocale[language]);

            this.$http.get('/locale/' + language + '.json').then((response) => {
                if(!response || !response.data) {
                    setTimeout(() => GaltData.getLocale(language), 1000);
                    return;
                }
                this.cachedLocale[language] = response.data;
                console.log(language + ' locale', this.cachedLocale[language]);
                resolve(this.cachedLocale[language]);
            }).catch(() => {
                setTimeout(() => {
                    GaltData.getLocale(language).then(resolve);
                }, 1000);
            });
        });
    }
    
    static async calculateEthForGeohashesTransactions(txCount, txPrice?){
        if(!txPrice) {
            txPrice = await EthData.gasPrice(GaltData.gasForSendGeohashes);
        }

        return GaltData.roundToDecimal(txCount * txPrice);
    }

    static copyToClipboard (str) {
        const el = document.createElement('textarea');
        el.value = str;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }
    
    static cutHex(hex) {
        return hex.slice(0, 7) + "..." + hex.slice(-4);
    }

    static async waitSeconds(seconds) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 1000 * seconds)
        });
    }
    
    static isNumber(str) {
        if(_.isString(str) && !/^[0-9.]+$/.test(str)) {
            return false;
        }
        return !_.isNaN(parseFloat(str));
    }

    static isHex(str) {
        return _.startsWith(str, '0x');
    }
    
    static beautyNumber(number) {
        if(!GaltData.isNumber(number)) {
            return '';
        }
        number = parseFloat(number);
        number = Math.round(number * 100) / 100;
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    static beautyDate(date) {
        if(_.isNumber(parseInt(date))) {
            date = new Date(parseInt(date) * 1000);
        }
        let mDate = moment(date);
        let now = moment();

        if (now.diff(mDate, 'hours') >= 24)
            return mDate.format("D MMMM YYYY H:mm:ss");
        else
            return mDate.fromNow();
    }

    static async sendMassTransaction(contractName, operationId, sendOptions, method, args) {
        const contract = this.$contracts['$' + contractName.replace('Contract', '')];

        await contract.onReady();
        
        if(sendOptions.privateKey) {
            this.$web3Worker.callMethod('sendTransactionToContract', {
                contractAbi: contract.abi,
                contractAddress: contract.address,
                contractName: contractName,
                operationId: operationId,
                rpcServer: GaltData.callMethodsRpcServer(),
                method: method,
                sendOptions: sendOptions,
                args: args
            });
        } else {
            const txResponse = await contract.sendMethod.apply(contract, [sendOptions, method].concat(args)).catch((response) => {
                return response;
            });
            this.$web3Worker.callMethod('addTransactionWatcherToOperation', {
                operationId: operationId,
                txHash: txResponse.hash
            });
        }
    }

    static async sendMassCallByAddress(contractAddress, contractAbi, contractName, method, args?) {
        return this.$web3Worker.callMethod('callMethodFromContract', {
            contractAbi: _.isObject(contractAbi) ? contractAbi : JSON.parse(contractAbi),
            contractAddress: contractAddress,
            contractName: contractName + "_" + contractAddress,
            rpcServer: GaltData.callMethodsRpcServer(),
            method: method,
            args: args || []
        });
    }

    static async sendMassCall(contractName, method, args?) {
        const contract = this.$contracts['$' + contractName.replace('Contract', '')];
        
        try {
            await contract.onReady();
        } catch (e) {
            console.error('Contract ' + contractName + ' not found');
            return;
        }
        
        return contract.massCallMethod(method, args);
    }
    
    static getNewOperationId(){
        GaltData.operationsCount = parseInt(localStorage.getItem('operationsCount') || '0');
        const newOperationId = ++GaltData.operationsCount;
        localStorage.setItem('operationsCount', newOperationId.toString());
        return newOperationId;
    }
    
    static getApplicationsTypesList () {
        return _.map(GaltData.applicationTypes, (id, name) => { return {id, name}; })
    }

    // ===========================================================
    // Helpers
    // ===========================================================

    static geohashToUint = galtUtils.geohashToGeohash5;
    static uintToGeohash = galtUtils.numberToGeohash;
    static geohashToTokenId = galtUtils.geohashToTokenId;
    static tokenIdToGeohash = galtUtils.tokenIdToGeohash;

    static geohashArrayToUint(geohashArray: string[]) {
        return geohashArray.map(galtUtils.geohashToGeohash5)
    }

    static roundToDecimal(number, decimal = 4) {
        return Math.ceil(number * Math.pow(10, decimal)) / Math.pow(10, decimal);
    }

    static weiToSzaboRound(wei) {
        return EthData.roundToDecimal(EthData.weiToSzabo(wei));
    }

    static weiToEtherRound(wei) {
        return EthData.roundToDecimal(EthData.weiToEther(wei));
    }

    static upperFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    static humanizeKey(keyString) {
        return GaltData.upperFirst(_.snakeCase(keyString)).replace(/_/g, " ")
    }
    
    // ===========================================================
    // Erc20 Contract
    // ===========================================================
    static async erc20Balance(erc20Address, userWallet) {
        const balanceInWei = await GaltData.sendMassCallByAddress(erc20Address, GaltData.erc20Abi, 'ERC20','balanceOf', [userWallet]);
        return GaltData.weiToEtherRound(balanceInWei);
    }

    static async approveErc20(sendOptions, erc20Address, approveToWallet, approveAmount){
        await this.$contracts.$galtToken.onReady();
        const erc20Contract = new EthContract(GaltData.erc20Abi, erc20Address);
        erc20Contract.setWeb3Worker(GaltData.$web3Worker);
        return erc20Contract.sendMethod(sendOptions, 'approve', approveToWallet, EthData.etherToWei(approveAmount));
    }

    static async getErc20Allowance(erc20Address, userAddress, approveToWallet) {
        return EthData.weiToEther(await GaltData.sendMassCallByAddress(erc20Address, GaltData.erc20Abi,'allowance', [userAddress, approveToWallet]));
    }
    
    // ===========================================================
    // Galt Contract
    // ===========================================================
    static async galtBalance(userWallet) {
        const balanceInWei = await GaltData.sendMassCall('galtTokenContract','balanceOf', [userWallet]);
        return EthData.weiToEtherRound(balanceInWei);
    }

    static async approveGalt(sendOptions, approveToWallet, approveAmount){
        return this.$contracts.$galtToken.sendMethod(sendOptions, 'approve', approveToWallet, EthData.etherToWei(approveAmount));
    }

    static async getGaltAllowance(userAddress, approveToWallet) {
        return EthData.weiToEther(await GaltData.sendMassCall('galtTokenContract','allowance', [userAddress, approveToWallet]));
    }

    static async galtTotalSupply() {
        const balanceInWei = await GaltData.sendMassCall('galtTokenContract','totalSupply');
        return EthData.weiToEtherRound(balanceInWei);
    }

    // ===========================================================
    // Space Contract
    // ===========================================================
    static async ownerOfTokenId(tokenId) {
        return GaltData.sendMassCall('spaceTokenContract','ownerOf', [tokenId])
            .then(r => {
                return r;
            })
            .catch((e) => {
                return "";
            });
    }

    static spaceTokensListToGeohashList(spaceTokensList) {
        return spaceTokensList.map(spaceToken => spaceToken.geohash);
    }

    static async spaceTokensCount(userWallet) {
        if(!userWallet) {
            return 0;
        }
        return parseInt(await GaltData.sendMassCall('spaceTokenContract', 'balanceOf', [userWallet]));
    }

    static async getUserSpaceTokensIds(userAddress) {
        if(!userAddress) {
            return [];
        }
        return _.reverse(await GaltData.sendMassCall('spaceTokenContract', "tokensOfOwner", [userAddress]));
    }

    static async getUserSpaceTokens(userAddress){
        const tokensIds = await GaltData.getUserSpaceTokensIds(userAddress);
        return GaltData.spaceTokenIdsToObjects(tokensIds);
    }
    
    static async spaceTokenIdsToObjects(tokensIds){
        const result = [];

        for(let i = 0; i < tokensIds.length; i++) {
            const tokenId = tokensIds[i];
            result.push(await GaltData.getSpaceTokenObjectById(tokenId));
        }
        return result;
    }
    
    static async getSpaceTokenObjectById(tokenId){
        tokenId = tokenId.toString(10);
        if(_.includes(tokenId, "0x")){
            tokenId = galtUtils.tokenIdHexToTokenId(tokenId);
        }
        // const type = galtUtils.isPack(tokenId) ? 'pack' : 'geohash';
        
        // if(type == 'pack') {
        const geoData = await GaltData.getPackageGeoData(tokenId);
        geoData.level = parseInt(geoData.level);
        geoData.area = EthData.weiToEtherRound(geoData.area);
        
        const owner = await GaltData.ownerOfTokenId(tokenId);
        
        let type;
        if(geoData.areaSource === 1) {
            type = geoData.level == 0 ? 'plot' : 'building'
        } else {
            if(_.includes(geoData.description, 'room=')) {
                type = 'predefined_room';
            } else {
                type = 'predefined_building';
            }
        }

        const spaceToken: any = {
            tokenId: tokenId,
            tokenIdHex: EthData.tokenIdToHex(tokenId),
            type,
            // geohashes: await GaltData.getPackageGeohashes(tokenId),
            level: geoData.level,
            ledgerIdentifier: EthData.hexToString(geoData.ledgerIdentifier),
            description: geoData.description,
            areaSource: geoData.areaSource,
            colorLevel: geoData.level < 10 ? geoData.level : geoData.level % 10 + 1,
            heights: geoData.heights,
            contour: geoData.contour,
            area: geoData.area,
            areaStr: GaltData.beautyNumber(geoData.area),
            custodians: await GaltData.spaceTokenCustodians(tokenId),
            documents: await GaltData.spaceTokenCustodianDocuments(tokenId),
            //TODO: enable market
            // price: await GaltData.spaceTokenPrice(tokenId),
            owner: owner,
            notFound: !owner
        };
        
        GaltData.setAdditionalDescription(spaceToken);
        
        if(spaceToken.additionalDescription) {
            const configAddressDescription = _.find(spaceToken.additionalDescription, {name:"config_address"});
            if(configAddressDescription) {
                spaceToken.configAddress = configAddressDescription.value;
            }
        }
        
        return spaceToken;
            
        // } else {
        //     return {
        //         tokenId: tokenId,
        //         tokenIdHex: GaltData.tokenIdToHex(tokenId),
        //         type: 'geohash',
        //         geohash: GaltData.tokenIdToGeohash(tokenId),
        //         isPack: false,
        //         isGeohash: true
        //     };
        // }
    }
    
    static getSpaceTokenArea(tokenId) {
        return this.$contracts.$splitMerge.getTokenArea(tokenId);
    }
    
    static setAdditionalDescription(obj) {
        if(!obj.description) {
            return;
        }
        const additionalDescription = obj.description.split('|\n');
        obj.additionalDescription = additionalDescription.filter((item) => /^\S+=.+$/.test(item)).map(item => {
            obj.description = obj.description.replace('|\n' + item, "").replace(item, "");

            const split = item.split('=');
            return {
                name: split[0],
                value: split[1] || ''
            }
        });
    }

    static getAdditionalDescriptionForSend(obj) {
        let description = obj.description;
        if(obj.additionalDescription && obj.descriptionNames.length) {
            obj.descriptionNames.forEach(name => {
                if(obj.additionalDescription.length) {
                    description += `|\n${name}=` + ((_.find(obj.additionalDescription, {name}) || {}).value || '');
                } else {
                    description += `|\n${name}=` + (obj.additionalDescription[name] || '');
                }
            });
        }
        return description;
    }

    static async getSpaceTokensTree(spaceToken, ownerHardCode = true) {
        const spaceList = await GaltData.getUserSpaceTokens(spaceToken.owner);
        const intersectsSpaceTokens = spaceList
            .filter((spaceTokenItem) => {
                spaceTokenItem.current = spaceTokenItem.tokenId == spaceToken.tokenId;
                
                return spaceTokenItem.tokenId == spaceToken.tokenId
                    || galtUtils.geohash.contour.intersects(spaceToken.contour, spaceTokenItem.contour)
                    || galtUtils.geohash.contour.mergePossible(spaceToken.contour, spaceTokenItem.contour);
            });

        let result;
        
        // TODO: remove hardcode
        // if(ownerHardCode && spaceToken.owner.toLowerCase() === '0xebfE09Ec1C269bbFe029b2000817FCB802d7D33D'.toLowerCase()) {
        //     return _.orderBy(spaceList, ['level']);
        // }

        if(spaceToken.level == 0) {
            result = intersectsSpaceTokens;
        } else {
            let rootSpaceToken = _.find(spaceList, (spaceTokenItem) => {
                return spaceTokenItem.level == 0
                    && galtUtils.geohash.contour.intersects(spaceTokenItem.contour, spaceToken.contour);
            });
            
            if(!rootSpaceToken) {
                rootSpaceToken = spaceToken;
            }

            result = spaceList
                .filter((spaceTokenItem) => {
                    spaceTokenItem.current = spaceTokenItem.tokenId == spaceToken.tokenId;
                    
                    return spaceTokenItem.tokenId == rootSpaceToken.tokenId
                        || galtUtils.geohash.contour.intersects(rootSpaceToken.contour, spaceTokenItem.contour)
                        || galtUtils.geohash.contour.mergePossible(rootSpaceToken.contour, spaceTokenItem.contour);
                });
        }

        return _.orderBy(result, ['level']);
    }

    static async getUserGeohashes(userAddress) {
        const spaceTokensIds = await GaltData.getUserSpaceTokensIds(userAddress);
        const geohashes = [];
        spaceTokensIds.forEach((tokenId) => {
            if(galtUtils.isGeohash(tokenId)) {
                geohashes.push(GaltData.tokenIdToGeohash(tokenId));
            }
        });
        return geohashes;
    }

    static async transferSpaceToken(sendOptions, recipient, spaceTokenId) {
        // TODO: discover how to dont use hardcode gas amount in MetaMask
        return this.$contracts.$spaceToken.sendMethod(
            _.extend(sendOptions),
            "transferFrom",
            sendOptions.from,
            recipient,
            spaceTokenId
        );
    }
    
    static async transferGalt(sendOptions, recipient, galtAmount) {
        return this.$contracts.$galtToken.sendMethod(
            _.extend(sendOptions),
            "transfer",
            recipient,
            EthData.etherToWei(galtAmount)
        );
    }

    static async approveAllSpace(sendOptions, approveToWallet, bool) {
        return this.$contracts.$spaceToken.sendMethod(sendOptions, 'setApprovalForAll', approveToWallet, bool);
    }

    static async isApprovedSpace(tokenOwner, approveToWallet, approveTokenId){
        return (await GaltData.sendMassCall('spaceTokenContract', 'getApproved', [approveTokenId])) == approveToWallet; //(await GaltData.sendMassCall('spaceTokenContract', 'isApprovedForAll', [tokenOwner, approveToWallet])) ||
    }

    static async isApprovedForAllSpace(tokenOwner, approveToWallet){
        return GaltData.sendMassCall('spaceTokenContract', 'isApprovedForAll', [tokenOwner, approveToWallet]);
    }

    // ===========================================================
    // PlotManagerContract Contract: for user
    // ===========================================================
    
    static getApplicationCurrencyById(currencyId) {
        return _.find(GaltData.applicationCurrencies, (currency) => currency.id == currencyId);
    }

    static getApplicationCurrencyIdByName(currencyName) {
        return _.find(GaltData.applicationCurrencies, (currency) => currency.name == currencyName).id;
    }

    static getPaymentMethodById(paymentMethodId) {
        return _.find(GaltData.paymentMethods, (paymentMethod) => paymentMethod.id == paymentMethodId);
    }

    static getPaymentMethodIdByName(paymentMethodName) {
        return _.find(GaltData.paymentMethods, (currency) => currency.name == paymentMethodName).id;
    }
    
    static async getPaymentMethod(applicationType, multisigAddress){
        let contractName = applicationType;
        if(applicationType === 'plotManagerResubmit') {
            contractName = 'plotManager';
        }
        if(contractName === 'spaceLockerFactory' || contractName === 'fundFactory') {
            return 'eth_and_galt';
        }
        const paymentMethodId = await GaltData.sendMassCall(contractName + 'Contract', 'paymentMethod', [multisigAddress]);
        return (GaltData.getPaymentMethodById(paymentMethodId) || {}).name || 'not_found';
        // return (await GaltData.sendMassCall('plotManagerContract', 'getApproved', [approveApplicationId])) == approveToWallet;
    }
    
    static async updateApplication(application, getApplicationPromise){
        let updatedApplication = await getApplicationPromise;
        if(!updatedApplication.resolved && updatedApplication.resolvePromise) {
            updatedApplication.resolvePromise.then(() => {
                _.extend(application, updatedApplication);
            })
        } else {
            _.extend(application, updatedApplication);
        }
    }

    // ===========================================================
    // PlotManagerContract Contract: for oracle
    // ===========================================================

    static async isOracle(userWallet) {
        return GaltData.sendMassCall('oraclesContract', 'getOracle', [userWallet]).then((oracle) => {
            return oracle.active;
        });
    }

    static async getApplicationFeeInEth(application){
        let resultFee;
        if(application.contractType == 'plotManager') {
            let methodName = 'getSubmissionFeeByArea';
            let weiArea = EthData.etherToWei(_.includes(application.type, 'predefined') ? application.customArea : await this.$contracts.$geodesic.getContourArea(application.contour));
            let args = [application.multiSig, "0", weiArea];
            
            if(application.applicationId) {
                methodName = 'getResubmissionFeeByArea';
                args = [application.applicationId, weiArea];
            }
            
            if(!application.statusName || application.statusName == 'new') {
                resultFee = await GaltData.sendMassCall('plotManagerContract', methodName, args);
            } else {
                resultFee = await GaltData.sendMassCall('plotManagerContract', methodName, args);
            }
            resultFee = EthData.weiToEtherRound(resultFee);
        } else if(application.contractType == 'spaceLockerFactory') {
            resultFee = await this.$contracts.$feeRegistry.getEthFee("SPACE_LOCKER_FACTORY");
        } else if(application.contractType == 'fundFactory') {
            resultFee = await this.$contracts.$fundFactory.getEthFee();
        } else {
            resultFee = await GaltData.sendMassCall(application.contractType + 'Contract', 'minimalApplicationFeeEth', [application.multiSig]);
            resultFee = EthData.weiToEtherRound(resultFee);
        }
        return resultFee;
    }

    static async getApplicationFeeInGalt(application){
        let resultFee;
        if(application.contractType == 'plotManager') {
            let weiArea = EthData.etherToWei(_.includes(application.type, 'predefined') ? application.customArea : await this.$contracts.$geodesic.getContourArea(application.contour));

            let methodName = 'getSubmissionFeeByArea';
            let args = [application.multiSig, "1", weiArea];

            if(application.applicationId) {
                methodName = 'getResubmissionFeeByArea';
                args = [application.applicationId, weiArea];
            }
            
            if(!application.statusName || application.statusName == 'new') {
                resultFee = await GaltData.sendMassCall('plotManagerContract', methodName, args);
            } else {
                resultFee = await GaltData.sendMassCall('plotManagerContract', methodName, args);
            }
            resultFee = EthData.weiToEtherRound(resultFee);
        } else if(application.contractType == 'spaceLockerFactory') {
            resultFee = await this.$contracts.$feeRegistry.getGaltFee("SPACE_LOCKER_FACTORY");
        } else if(application.contractType == 'fundFactory') {
            resultFee = await this.$contracts.$fundFactory.getGaltFee();
        } else {
            resultFee = await GaltData.sendMassCall(application.contractType + 'Contract', 'minimalApplicationFeeGalt', [application.multiSig]);
            resultFee = EthData.weiToEtherRound(resultFee);
        }
        return resultFee;
    }
    // ===========================================================
    // PlotCustodianContract Contract: for user
    // ===========================================================
    static async getPlotCustodianApplication(applicationId) {
        return GaltData.$contracts.$plotCustodian.getApplicationById(applicationId);
    }
    
    // ===========================================================
    // Oracles Contract
    // ===========================================================
    static async getOracle(oracleAddress) {
        if(!oracleAddress) {
            return null;
        }
        const oracle = await GaltData.sendMassCall('oraclesContract', 'getOracle', [oracleAddress]);
        
        oracle.activeRoles = oracle.activeOracleTypes.map(EthData.hexToString).filter(role => role);
        oracle.allRoles = oracle.assignedOracleTypes.map(EthData.hexToString).filter(role => role);
        oracle.descriptionHashes = oracle.descriptionHashes.map(EthData.hexToString);
        oracle.name = EthData.hexToString(oracle.name);
        oracle.position = EthData.hexToString(oracle.position);
        oracle.address = oracleAddress;
        
        GaltData.setAdditionalDescription(oracle);
        
        return oracle;
    }
    static async getAllOracles() {
        let oracles = await GaltData.sendMassCall('oraclesContract', 'getOracles');
        
        oracles = _.uniq(oracles);
        
        return pIteration.map(oracles, async (oracleAddress) => {
            return GaltData.getOracle(oracleAddress);
        });
    }
    static async getOracleRoles(userWallet) {
        const oracle = await GaltData.getOracle(userWallet);
        if(!oracle) {
            return [];
        }
        return oracle.allRoles;
    }
    static async getApplicationRoles(type) {
        const rolesHex = await GaltData.sendMassCall('oraclesContract', 'getApplicationTypeOracleTypes', [GaltData.applicationTypes[type]]);
        return rolesHex.map(EthData.hexToString);
    }
    static async getApplicationRoleData(role) {
        const roleData = await GaltData.sendMassCall('oraclesContract', 'oracleTypesMap', [EthData.stringToHex(role)]);
        roleData.descriptionHash = EthData.hexToString(roleData.descriptionHash);
        return roleData;
    }
    static async getApplicationRolesData(type) {
        const roles = await GaltData.getApplicationRoles(type);
        const rolesWithData = [];
        
        await pIteration.forEach(roles, async (role, index) => {
            const roleData = await GaltData.getApplicationRoleData(role);
            roleData.name = role;
            rolesWithData[index] = roleData;
        });
        
        return rolesWithData;
    }
    static async editOracle(sendOptions, oracleData) {
        return this.$contracts.$oracles.sendMethod(
            sendOptions,
            'addOracle',
            oracleData.address,
            EthData.stringToHex(oracleData.name),
            EthData.stringToHex(oracleData.position),
            oracleData.description,
            oracleData.descriptionHashes.map(EthData.stringToHex),
            oracleData.roles.map(EthData.stringToHex)
        );
    }
    static async deactivateOracle(sendOptions, oracleAddress) {
        return this.$contracts.$oracles.sendMethod(
            sendOptions,
            'removeOracle',
            oracleAddress
        );
    }
    
    static setApplicationRoles(sendOptions, roles, type) {
        return this.$contracts.$oracles.sendMethod(
            _.extend(sendOptions),
            'setApplicationTypeOracleTypes',
            GaltData.applicationTypes[type],
            roles.map((role) => EthData.stringToHex(role.name)),
            roles.map((role) => role.rewardShare),
            roles.map((role) => EthData.stringToHex(role.descriptionHash))
        );
    }
    
    static deleteApplicationRoles(sendOptions, type) {
        return this.$contracts.$oracles.sendMethod(
            _.extend(sendOptions),
            'deleteApplicationType',
            GaltData.applicationTypes[type]
        );
    }

    static async hasOraclesRole(userWallet, role) {
        return GaltData.sendMassCall('oraclesContract', 'hasRole', [userWallet, EthData.stringToHex(role)]);
    }
    // ===========================================================
    // SplitMerge Contract
    // ===========================================================
    static async getPackageContour(tokenId){
        return this.$contracts.$splitMerge.getPackageContour(tokenId);
    }
    static async getPackageContourSandbox(tokenId){
        return this.$contracts.$splitMergeSandbox.getPackageContour(tokenId);
    }
    static async getPackageGeoData(tokenId){
        return this.$contracts.$splitMerge.getPackageGeoData(tokenId);
    }
    static async getPackageGeoDataSandbox(tokenId){
        return this.$contracts.$splitMergeSandbox.getPackageGeoData(tokenId);
    }
    
    // ===========================================================
    // SpaceDex Contract: for user
    // ===========================================================
    static async spaceTokenCustodians(tokenId){
        return this.$contracts.$scr.spaceTokenCustodians(tokenId);
    }
    static async spaceTokenCustodianDocuments(tokenId){
        return this.$contracts.$scr.spaceTokenCustodianDocuments(tokenId);
    }

    static async spaceTokenPrice(tokenId){
        return this.$contracts.$plotValuation.spaceTokenPrice(tokenId).catch(() => null);
    }
    
    // ===========================================================
    // Multisig Contracts
    // ===========================================================
    static async getMulstiSigList() {
        const multisigAddresses = await this.$contracts.$msr.getMultiSigAddresses();
        // TODO: fetch additional info for MultiSig
        return multisigAddresses.map((address) => { return { address }; })
    }
    static async getOSAofMultisig(mulstisigAddress) {
        const arbitrationConfig = await this.$contracts.$msr.getArbitrationConfigOfMultiSig(mulstisigAddress);
        return arbitrationConfig.getOSA();
    }
    
    static getSraByAddress(owner) {
        return this.$contracts.$fundsRegistry.getSRAByAddress(owner);
    }
    
    static getFundFeeContract(address) {
        return this.$contracts.$fundsRegistry.getFeeContract(address);
    }

    // static async get
    // ===========================================================
    // Modals
    // ===========================================================
    static confirmModal(props) {
        return new Promise((resolve, reject) => {
            this.$root.$asyncModal.open({
                id: 'confirm-modal',
                component: ConfirmModal,
                props: props,
                onClose(confirmed) {
                    if(confirmed) {
                        resolve();
                    } else {
                        reject();
                    }
                }
            });
        });
    }

    static specifyDescriptionModal(props) {
        return new Promise((resolve, reject) => {
            this.$root.$asyncModal.open({
                id: 'specify-description-modal',
                component: SpecifyDescriptionModal,
                props: props,
                onClose(description) {
                    if(description) {
                        resolve(description);
                    } else {
                        reject();
                    }
                }
            });
        });
    }

    static specifyAmountModal(props) {
        return new Promise((resolve, reject) => {
            this.$root.$asyncModal.open({
                id: 'specify-amount-modal',
                component: SpecifyAmountModal,
                props: props,
                onClose(amount) {
                    if(amount) {
                        resolve(amount);
                    } else {
                        reject();
                    }
                }
            });
        });
    }

    static specifySelectOptionModal(props) {
        return new Promise((resolve, reject) => {
            this.$root.$asyncModal.open({
                id: 'specify-select-option-modal',
                component: SpecifySelectOptionModal,
                props: props,
                onClose(selected) {
                    if(selected) {
                        resolve(selected);
                    } else {
                        reject();
                    }
                }
            });
        });
    }

    static changelogModal() {
        return new Promise((resolve, reject) => {
            this.$root.$asyncModal.open({
                id: 'changelog-modal',
                component: ChangelogModal
            });
        });
    }

    static useInternalWalletModal(contractName, subjectId, txCount, ethPerTx?, sentEthPromise?) {
        return new Promise((resolve, reject) => {
            this.$root.$asyncModal.open({
                id: 'use-internal-wallet-modal',
                component: UseInternalWalletModal,
                props: {
                    contractName,
                    subjectId,
                    txCount,
                    ethPerTx,
                    sentEthPromise
                },
                onClose(mode) {
                    if(mode == 'metamask' || mode == 'internal_wallet') {
                        resolve(mode);
                    } else {
                        reject();
                    }
                }
            });
        });
    }
}
