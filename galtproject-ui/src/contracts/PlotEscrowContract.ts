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

import GaltData from "../services/galtData";
import AbstractApplicationContract from "./AbstractApplicationContract";
import * as pIteration from "p-iteration";

import * as _ from 'lodash';
import EthData from "@galtproject/frontend-core/libs/EthData";

export default class PlotEscrowContract extends AbstractApplicationContract {
    applicationStatuses = [
        {id: -1, name: 'all'},
        {id: 0, name: 'not_exist'},
        {id: 1, name: 'open'},
        {id: 2, name: 'locked'},
        {id: 3, name: 'closed'},
        {id: 4, name: 'cancelled'}
    ];
    
    offerStatuses = [
        {id: -1, name: 'all'},
        {id: 0, name: 'not_exist'},
        {id: 1, name: 'open'},
        {id: 2, name: 'match'},
        {id: 3, name: 'escrow'},
        {id: 4, name: 'custodian_review'},
        {id: 5, name: 'audit_required'},
        {id: 6, name: 'audit'},
        {id: 7, name: 'resolved'},
        {id: 8, name: 'closed'},
        {id: 9, name: 'cancelled'},
        {id: 10, name: 'empty'}
    ];

    validationStatuses = [
        {id: 0, name: 'not_exist'},
        {id: 1, name: 'pending'},
        {id: 2, name: 'locked'},
        {id: 3, name: 'approved'},
        {id: 4, name: 'rejected'}
    ];
    
    escrowCurrencies = [
        {id: 0, name: 'eth'},
        {id: 1, name: 'erc20'}
    ];
    
    getEscrowCurrencyById(currencyId) {
        return _.find(this.escrowCurrencies, (currency) => currency.id == currencyId);
    }

    getEscrowCurrencyIdByName(currencyName) {
        return _.find(this.escrowCurrencies, (currency) => currency.name == currencyName).id;
    }

    getOfferStatusById(statusId) {
        return _.find(this.offerStatuses, (status) => status.id == statusId);
    }

    getOfferStatusIdByName(statusName) {
        return _.find(this.offerStatuses, (status) => status.name == statusName).id;
    }

    getValidationStatusById(statusId) {
        return _.find(this.validationStatuses, (status) => status.id == statusId);
    }

    getValidationStatusIdByName(statusName) {
        return _.find(this.validationStatuses, (status) => status.name == statusName).id;
    }
    
    async placeOrder(sendOptions, order) {
        return await this.sendMethod(
            _.extend(sendOptions, {ether: order.feeCurrency == 'eth' ? order.fee : 0}),
            "createSaleOrder",
            order.tokenId,
            EthData.etherToWei(order.price),
            order.documents.map(EthData.stringToHex),
            order.priceCurrency == 'eth' ? "0" : "1",
            order.priceCurrency == 'eth' ? EthData.nullAddress : order.priceCurrency,
            order.feeCurrency == 'galt' ? EthData.etherToWei(order.fee) : "0"
        )
    }

    async placeBid(sendOptions, order, bid) {
        return await this.sendMethod(
            sendOptions,
            "createSaleOffer",
            order.id,
            EthData.etherToWei(bid)
        )
    }

    async changeBid(sendOptions, order, bid) {
        return await this.sendMethod(
            sendOptions,
            "changeSaleOfferBid",
            order.id,
            EthData.etherToWei(bid)
        )
    }

    async changeAsk(sendOptions, order, offer, ask) {
        return await this.sendMethod(
            sendOptions,
            "changeSaleOfferAsk",
            order.id,
            offer.address,
            EthData.etherToWei(ask)
        )
    }

    async selectOffer(sendOptions, order, offer) {
        return await this.sendMethod(
            sendOptions,
            "selectSaleOffer",
            order.id,
            offer.address
        )
    }

    async attachSpaceToken(sendOptions, orderId, buyer) {
        return await this.sendMethod(
            sendOptions,
            "attachSpaceToken",
            orderId,
            buyer
        )
    }

    async attachPayment(sendOptions, order, buyer) {
        const pay = order.offersObj[buyer].ask;
        
        return await this.sendMethod(
            _.extend(sendOptions, {ether: order.escrowCurrencyName == 'eth' ? pay : 0}),
            "attachPayment",
            order.id,
            buyer
        )
    }

    async cancelSaleOffer(sendOptions, order, offer) {
        return await this.sendMethod(
            sendOptions,
            "cancelSaleOffer",
            order.id,
            offer.address
        )
    }
    
    async requestCancellationAudit(sendOptions, order, offer) {
        return await this.sendMethod(
            sendOptions,
            "requestCancellationAudit",
            order.id,
            offer.address
        )
    }

    async emptySaleOffer(sendOptions, order, offer) {
        return await this.sendMethod(
            sendOptions,
            "emptySaleOffer",
            order.id,
            offer.address
        )
    }

    async reopenSaleOrder(sendOptions, order, offer) {
        return await this.sendMethod(
            sendOptions,
            "reopenSaleOrder",
            order.id,
            offer.address
        )
    }
    
    async withdrawSpaceToken(sendOptions, order, offer) {
        return await this.sendMethod(
            sendOptions,
            "withdrawSpaceToken",
            order.id,
            offer.address
        )
    }

    async withdrawPayment(sendOptions, order, offer) {
        return await this.sendMethod(
            sendOptions,
            "withdrawPayment",
            order.id,
            offer.address
        )
    }

    async resolve(sendOptions, order, offer) {
        return await this.sendMethod(
            sendOptions,
            "resolve",
            order.id,
            offer.address
        )
    }
    
    async cancelOrder(sendOptions, order) {
        return await this.sendMethod(
            sendOptions,
            "cancelOpenSaleOrder",
            order.id
        )
    }
    
    async applyForCustodian(sendOptions, application) {
        return await this.sendMethod(
            _.extend(sendOptions, {ether: application.feeCurrency == 'eth' ? application.fee : 0}),
            "applyCustodianAssignment",
            application.orderId,
            application.buyer,
            application.custodians,
            application.feeCurrency == 'galt' ? EthData.etherToWei(application.fee) : "0"
        )
    }
    
    async withdrawFromCustodian(sendOptions, order) {
        return await this.sendMethod(
            sendOptions,
            "withdrawTokenFromCustodianContract",
            order.id,
            order.buyer.address
        )
    }

    async claimPayment(sendOptions, order, offer) {
        return await this.sendMethod(
            sendOptions,
            "claimPayment",
            order.id,
            offer.address
        )
    }

    async claimSpaceToken(sendOptions, order, offer) {
        return await this.sendMethod(
            sendOptions,
            "claimSpaceToken",
            order.id,
            offer.address
        )
    }

    async getSellerOrdersCount(sellerAddress){
        return this.massCallMethod("getSaleOrderArrayBySellerLength", [sellerAddress]);
    }
    async getSellerOrders(sellerAddress, params: any = {}){
        return this.massCallMethod("getSellerOrders", [sellerAddress])
            .then(async (orders_ids) => {
                return await this.getOrdersByIds(orders_ids, params);
            });
    }

    async getBuyerOrdersCount(buyerAddress){
        return this.massCallMethod("getSaleOrderArrayByBuyerLength",[buyerAddress]);
    }
    async getBuyerOrders(buyerAddress, params: any = {}){
        return this.massCallMethod("getBuyerOrders", [buyerAddress])
            .then(async (orders_ids) => {
                return await this.getOrdersByIds(orders_ids, params);
            });
    }
    
    async getOpenOrders(params: any = {}){
        return this.massCallMethod("getOpenSaleOrders")
            .then(async (orders_ids) => {
                return await this.getOrdersByIds(orders_ids, params);
            });
    }
    async getOpenOrdersCount(){
        return this.massCallMethod("getOpenSaleOrdersLength");
    }

    async getAllApplications(options){
        return this.massCallMethod("getAuditRequiredSaleOrders")
            .then(async (applications_ids) => {
                return await this.getApplicationsByIds(applications_ids, options);
            });
    }
    
    async userApplicationsIds(userWallet) {
        return [];
    }

    async getOracleApplicationsIds(userWallet) {
        return await this.massCallMethod('getAuditorOrders', [userWallet]);
    }

    async getOracleApplications(userWallet) {
        return this.getOracleApplicationsIds(userWallet)
            .then(async (applications_ids) => {
                return await this.getApplicationsByIds(applications_ids, {});
            });
    }
    
    async getAllOrders(params: any = {}){
        return this.massCallMethod("getSaleOrders")
            .then(async (orders_ids) => {
                return await this.getOrdersByIds(orders_ids, params);
            });
    }
    async getAllOrdersCount(){
        return this.massCallMethod("getSaleOrdersLength");
    }
    async getOrdersByIds(ordersIds, params: any = {}){
        const applications = await pIteration.map(ordersIds, async (applicationId) => {
            return await this.getOrderById(applicationId, params);
        });
        return _.reverse(applications);
    }

    async getApplicationById(orderId, params: any = {}) {
        return this.getOrderById(orderId, params);
    }

    async getOrderById(orderId, params: any = {}) {
        params.method = 'getSaleOrder';
        const order = await super.getApplicationById(orderId, params, (roleValidation, application) => {
            // if(_.includes(this.approveConfirmationsToRoles[order.approveConfirmations], roleValidation.roleName)) {
            //     roleValidation.statusName = 'approved';
            //     roleValidation.status = this.getValidationStatusIdByName(roleValidation.statusName);
            // }
            // if(order.statusName == 'review') {
            //     return;
            // }
            // if(roleValidation.oracle && roleValidation.oracle == params.validationForAddress) {
            //     if(_.includes(['locked', 'approved', 'rejected', 'reverted'], roleValidation.statusName)) {
            //         // set personal status for oracle
            //         order.status = this.getApplicationStatusIdByName(roleValidation.statusName);
            //         order.statusName = this.getApplicationStatusName(application);
            //     }
            // }
        });

        order.contractType = 'plotEscrow';

        order.escrowCurrencyName = (this.getEscrowCurrencyById(order.escrowCurrency) || {}).name;
        if(order.escrowCurrencyName == "erc20") {
            order.escrowCurrencyName = order.tokenContract.toLowerCase() == GaltData.contractsConfig.galtTokenAddress.toLowerCase() ? 'galt' : order.tokenContract;
        }
        
        order.ask = GaltData.weiToEtherRound(order.ask);

        order.offersListAddresses = order.offersList;
        order.offersList = [];
        order.offersObj = {};
        
        order.spaceToken = null;
        
        order.resolved = false;

        let promises = [];
        
        if(order.lastBuyer == GaltData.nullAddress){
            order.lastBuyer = null;
        }
        
        if(order.tokenContract == GaltData.nullAddress){
            order.tokenContract = null;
        }

        order.spaceTokenId = order.spaceTokenId.toString(10);

        order.buyer = {};
        
        if(order.lastBuyer) {
            order.buyer = await this.massCallMethod("getSaleOffer", [order.id, order.lastBuyer]);

            order.buyer.statusName = (this.getOfferStatusById(order.buyer.status) || {}).name;
            order.buyer.address = order.lastBuyer;
            order.buyer.ask = GaltData.weiToEtherRound(order.buyer.ask);
            order.buyer.bid = GaltData.weiToEtherRound(order.buyer.bid);
            
            order.buyer.buyerResolved = order.buyer.resolved == 1 || order.buyer.resolved == 3;
            order.buyer.sellerResolved = order.buyer.resolved == 2 || order.buyer.resolved == 3;

            order.lastBuyerActive = ['open'].indexOf(order.buyer.statusName) === -1;
            
            order.spaceTokenAttached = (await GaltData.ownerOfTokenId(order.spaceTokenId)).toLowerCase() == this.address.toLowerCase();
            
            if(order.buyer.custodianApplicationId == GaltData.nullBytes32) {
                order.buyer.custodianApplicationId = null;
            }
            
            if(order.buyer.custodianApplicationId) {
                order.buyer.custodianApplication = await GaltData.getPlotCustodianApplication(order.buyer.custodianApplicationId);
            }
            
            if(order.buyer.statusName === 'audit_required' || order.buyer.statusName === 'audit') {
                order.buyer.audit = await this.massCallMethod("getSaleOfferAudit", [order.id, order.buyer.address]);
                order.buyer.audit.address = order.buyer.audit.addr;
                order.buyer.audit.statusName = (this.getValidationStatusById(order.buyer.audit.status) || {}).name;
            }
        }
        
        order.custodians = await GaltData.spaceTokenCustodians(order.spaceTokenId);

        promises = order.offersListAddresses.map(async (address: string, index: number) => {
            let offer;
            
            if(address == order.lastBuyer) {
                offer = order.buyer;
            } else {
                offer = await this.massCallMethod("getSaleOffer", [order.id, address]);

                offer.statusName = (this.getOfferStatusById(offer.status) || {}).name;
                offer.address = address;
                offer.ask = GaltData.weiToEtherRound(offer.ask);
                offer.bid = GaltData.weiToEtherRound(offer.bid);
            }

            order.offersList[index] = offer;
            order.offersObj[address] = offer;
            return offer;
        });

        const spaceTokenPromise = GaltData.getSpaceTokenObjectById(order.spaceTokenId).then((spaceToken) => {
            order.spaceToken = spaceToken;
        }).catch(() => { });

        try {
            await spaceTokenPromise;
        } catch (e) {

        }

        order.resolvePromise = Promise.all(promises).then(() => {
            order.offersList = _.clone(order.offersList);
            order.offersObj = _.clone(order.offersObj);
            order.resolved = true;
        });
        
        return order;
    }
}
