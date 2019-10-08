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

import {
    EventBus, 
    WAIT_SCREEN_SHOW,
    WAIT_SCREEN_HIDE,
    WAIT_SCREEN_CHANGE_TEXT,
    WAIT_SCREEN_SET_OPERATION_ID
} from "../../services/events";

import * as _ from 'lodash';

export default {
    name: 'wait-screen',
    template: require('./WaitScreen.html'),
    props: [],
    created() {
        EventBus.$on(WAIT_SCREEN_SHOW, (data) => {
            this.isShowed = true;
            this.centerText = data.centerText;
            this.rightTopText = data.rightTopText;
        });
        
        EventBus.$on(WAIT_SCREEN_HIDE, () => {
            this.isShowed = false;
            this.operationId = null;
            this.operationTransactions = [];
            this.txHashToIndex = {};
            this.operationState = {
                totalTxCount: null,
                finishedTxCount: null,
                confirmedTxCount: null,
                rejectedTxCount: null,
                sentTxCount: null
            };
        });
        
        EventBus.$on(WAIT_SCREEN_CHANGE_TEXT, (data) => {
            if(data.centerText) {
                this.centerText = data.centerText;
            }
            if(data.rightTopText) {
                this.rightTopText = data.rightTopText;
            }
            if(data.centerSubText) {
                this.centerSubText = data.centerSubText;
            }
        });
        
        EventBus.$on(WAIT_SCREEN_SET_OPERATION_ID, (operationId) => {
            if(_.isNumber(operationId) || _.isString(operationId)) {
                this.operationId = operationId;
            } else {
                console.error("Incorrect operation id", operationId);
            }
        });

        this.$web3Worker.onEvent('txSent', (tx) => {
            if(tx.operationId != this.operationId) {
                return;
            }
            tx.status = 'sent';
            tx.statusText = this.$locale.get('wait_screen.transactions.sent_status');
            
            const txIndex = this.operationTransactions.push(tx) - 1;
            this.txHashToIndex[tx.hash] = txIndex;

            this.getOperationState();
        });

        this.$web3Worker.onEvent('txFailed', (tx) => {
            if(tx.operationId != this.operationId) {
                return;
            }
            const txInList = this.operationTransactions[this.txHashToIndex[tx.hash]];
            if(!txInList) {
                this.operationTransactions.push({
                    hash: 'none',
                    statusText: this.$locale.get('wait_screen.transactions.error_status') + (tx.error.message || tx.error) + (tx.repeatOfTx ? this.repeatOf(tx.repeatOfTx) : ''),
                    status: 'error'
                });
                return;
            }
            txInList.status = 'failed';
            txInList.statusText = this.$locale.get('wait_screen.transactions.reverted_status') + (tx.repeatOfTx ? this.repeatOf(tx.repeatOfTx) : '');

            this.getOperationState();
        });

        this.$web3Worker.onEvent('txConfirmation', (tx) => {
            if(tx.operationId != this.operationId) {
                return;
            }
            
            console.log(tx.hash, tx.confirmationNumber);
            
            const txInList = this.operationTransactions[this.txHashToIndex[tx.hash]];
            txInList.status = 'mining';
            txInList.statusText = this.$locale.get('wait_screen.transactions.confirmations_status', {value: tx.confirmationNumber}) + (tx.repeatOfTx ? this.repeatOf(tx.repeatOfTx) : '');
        });

        this.$web3Worker.onEvent('txConfirmed', (tx) => {
            if(tx.operationId != this.operationId) {
                return;
            }
            const txInList = this.operationTransactions[this.txHashToIndex[tx.hash]];
            txInList.status = 'mined';
            txInList.statusText = this.$locale.get('wait_screen.transactions.mined_status') + (tx.repeatOfTx ? this.repeatOf(tx.repeatOfTx) : '');
            
            this.getOperationState();
        });

        this.$web3Worker.onEvent('txError', (tx) => {
            if(tx.operationId != this.operationId) {
                return;
            }
            const txInList = this.operationTransactions[this.txHashToIndex[tx.hash]];
            txInList.status = 'error';
            const message = (tx.error.message || tx.error);
            let type;
            if(_.includes(message, 'reverted')) {
                type = 'reverted';
            } else {
                type = 'unknown';
            }
            txInList.statusText = this.$locale.get('wait_screen.transactions.reverted_status') + type + (tx.repeatOfTx ? this.repeatOf(tx.repeatOfTx) : this.$locale.get('wait_screen.transactions.will_repeat'));

            this.getOperationState();
        });
    },
    methods: {
        getOperationState() {
            this.$web3Worker.callMethod('getOperationState', this.operationId).then((operationState) => {
                _.extend(this.operationState, operationState);
            })
        },
        repeatOf(txHash) {
            return this.$locale.get('wait_screen.transactions.repeat_of') + '0x...' + txHash.slice(-3);
        }
    },
    computed: {
        operationTransactionsReversed() {
            return _.reverse(_.clone(this.operationTransactions));
        },
        transactionsCount() {
            return this.operationTransactions.length;
        }
    },
    data() {
        return {
            isShowed: false,
            centerText: '',
            centerSubText: '',
            rightTopText: '',
            operationId: null,
            operationTransactions: [],
            txHashToIndex: {},
            operationState: {
                totalTxCount: null,
                finishedTxCount: null,
                confirmedTxCount: null,
                rejectedTxCount: null,
                sentTxCount: null
            }
        }
    }
}
