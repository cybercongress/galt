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

export default {
    name: 'claim-manager-chat',
    template: require('./ClaimManagerChat.html'),
    props: ['applicationId'],
    components: {},
    mounted() {
        this.getMessagesCount();
    },
    methods: {
        async getMessagesCount() {
            this.$claimManagerContract.getApplicatioMessagesCount(this.applicationId).then(messagesCount => {
                this.messagesCount = messagesCount;
            })
        },
        toggleChat() {
            this.showChat = !this.showChat;
            
            if(this.showChat) {
                this.getMessages();
            }
        },
        async getMessages() {
            this.$claimManagerContract.getApplicationWithMessages(this.applicationId).then(application => {
                this.application = application;
                this.messagesCount = application.messageCount;
            })
        },
        sendMessage() {
            this.sending = true;
            this.$galtUser.sendClaimManagerMessage(this.applicationId, this.newMessageText).then(() => {
                this.sending = false;
                this.getMessages();
                this.newMessageText = '';
            })
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    data() {
        return {
            messagesCount: null,
            application: null,
            sending: false,
            showChat: false,
            newMessageText: '',
            localeKey: 'claim_manager_chat'
        }
    }
}
