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

import Explorer from "../../../../Explorer/Explorer";

import * as _ from 'lodash';
import {
    EventBus,
    EXPLORER_DRAW_SPACE_TOKEN,
    EXPLORER_DRAW_SPACE_TOKENS_LIST
} from '../../../../../services/events';

import BuySpaceModal, {default as AttachPaymentModal} from "./modals/AttachPaymentModal/AttachPaymentModal";
import GaltData from "../../../../../services/galtData";
import PlotEscrowOrderCard from "../../directives/PlotEscrowOrderCard/PlotEscrowOrderCard";
import AttachSpaceTokenModal
    from "../../SellSpacePage/PlotEscrowToSell/modals/AttachSpaceTokenModal/AttachSpaceTokenModal";

export default {
    name: 'plot-escrow-to-buy',
    template: require('./PlotEscrowToBuy.html'),
    components: {
        PlotEscrowOrderCard,
        Explorer
    },
    created() {
        this.getOrdersData();
        this.getOrderStatuses();

        setInterval(this.getOrdersData.bind(this), 10000);
        
        this.$store.watch((state) => state.user_wallet,
            (user_wallet) => this.getOrdersList()
        );
    },
    mounted() {

    },
    methods: {
        getOrdersData(){
            this.$plotEscrowContract.getOpenOrdersCount().then((ordersCount) => {
                if(ordersCount == this.ordersCount) {
                    return;
                }
                this.ordersCount = ordersCount;
                this.getOrdersList();
            });
        },
        async getOrderStatuses() {
            this.orderStatuses = await this.$locale.setTitlesByNamesInList(this.$plotEscrowContract.applicationStatuses, 'order_statuses.');
        },
        async getOrdersList() {
            this.loading = true;
            const userOrders = await this.$galtUser.plotEscrowBuyerOrders();
            const openOrders = await this.$plotEscrowContract.getOpenOrders();
            this.ordersList = _.clone(userOrders);
            
            openOrders.forEach((openOrder) => {
                if(userOrders.some((userOrder) => userOrder.id == openOrder.id)) {
                    return;
                }
                this.ordersList.push(openOrder);
            });
            
            this.showOrdersOnMap();
            this.loading = false;
        },
        async showOrdersOnMap(){
            const spaceTokens = await GaltData.spaceTokenIdsToObjects(this.ordersList.map(order => order.spaceTokenId));
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKENS_LIST, spaceTokens);

        },
        async showSpaceToken(order) {
            const spaceToken = await GaltData.getSpaceTokenObjectById(order.spaceTokenId);
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKEN, spaceToken);
        },
        updateOrder(order) {
            GaltData.updateApplication(order, this.$galtUser.getOrder(order.contractType, order.id, {
                
            }))
        },

        placeBid(order) {
            if(order.seller == this.user_wallet) {
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.cant_buy_of_yourself.title'),
                    text: this.getLocale('error.cant_buy_of_yourself.description')
                });
                return;
            }
            GaltData.specifyAmountModal({
                title: this.getLocale("place_bid_modal.title"),
                placeholder: this.getLocale("place_bid_modal.placeholder"),
                defaultValue: order.ask
            }).then(async (amount: any) => {
                this.$galtUser.placePlotEscrowBid(order, amount).then(() => {
                    this.updateOrder(order);
                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.place_bid.title'),
                        text: this.getLocale('success.place_bid.description')
                    });
                })
            });
        },
        changeBid(order) {
            GaltData.specifyAmountModal({
                title: this.getLocale("change_bid_modal.title"),
                placeholder: this.getLocale("change_bid_modal.placeholder"),
                defaultValue: order.offersObj[this.user_wallet].bid
            }).then(async (amount: any) => {
                this.$galtUser.changePlotEscrowBid(order, amount).then(() => {
                    this.updateOrder(order);
                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.place_bid.title'),
                        text: this.getLocale('success.place_bid.description')
                    });
                })
            });
        },
        cancelBid(order) {
            GaltData.confirmModal({
                title: this.getLocale("cancel_bid_modal.title")
            }).then(async () => {
                this.$galtUser.cancelPlotEscrowOffer(order, order.offersObj[this.user_wallet]).then(() => {
                    this.updateOrder(order);
                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.cancel.title'),
                        text: this.getLocale('success.cancel.description')
                    });
                })
            });
        },
        cancelRequest(order) {
            GaltData.confirmModal({
                title: this.getLocale("cancel_request_modal.title")
            }).then(async () => {
                this.$galtUser.cancelRequestPlotEscrowOffer(order, order.offersObj[this.user_wallet]).then(() => {
                    this.updateOrder(order);
                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.cancel_request.title'),
                        text: this.getLocale('success.cancel_request.description')
                    });
                })
            });
        },
        withdrawPayment(order) {
            this.$galtUser.withdrawPlotEscrowPayment(order, order.offersObj[this.user_wallet]).then(() => {
                this.updateOrder(order);
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.withdraw_payment.title'),
                    text: this.getLocale('success.withdraw_payment.description')
                });
            })
        },
        async attachPayment(order) {
            let userBalance;
            if(order.tokenContract) {
                userBalance = await this.$galtUser.erc20Balance(order.tokenContract);
            } else {
                userBalance = await this.$galtUser.ethBalance();
            }
            if(userBalance < order.buyer.ask) {
                //TODO: user friendly currency
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.not_enough_balance.title', {value: order.buyer.ask}),
                    text: this.getLocale('error.not_enough_balance.description', {value: order.buyer.ask})
                });
                return;
            }
            this.$root.$asyncModal.open({
                id: 'attach-payment-modal',
                component: AttachPaymentModal,
                props: {
                    orderId: order.id
                },
                onClose: () => {
                    this.updateOrder(order);
                }
            });
        },
        resolve(order) {
            GaltData.confirmModal({
                title: this.getLocale("resolve_modal.title")
            }).then(async () => {
                this.$galtUser.resolvePlotEscrowOffer(order, order.buyer).then(() => {
                    this.updateOrder(order);
                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.resolve.title'),
                        text: this.getLocale('success.resolve.description')
                    });
                })
            });
        },
        claimSpaceToken(order) {
            this.$galtUser.claimPlotEscrowSpaceToken(order, order.buyer).then(() => {
                this.updateOrder(order);
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.claim_space_token.title'),
                    text: this.getLocale('success.claim_space_token.description')
                });
            })
        },
        toggleAllOffers(order) {
            this.$set(order, 'showAllOrders', !order.showAllOrders);
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    data() {
        return {
            localeKey: 'plot_escrow.buy',
            loading: true,
            intervals: [],
            orderStatuses: [],
            filterByStatus: 'all',
            ordersList: [],
            ordersCount: null
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        },
        filteredOrders() {
            let result;

            if(this.filterByStatus == 'all') {
                result = this.ordersList;
            } else {
                result = this.ordersList.filter((order) => {
                    return order.statusName == this.filterByStatus;
                });
            }

            return result;
        }
    },
}
