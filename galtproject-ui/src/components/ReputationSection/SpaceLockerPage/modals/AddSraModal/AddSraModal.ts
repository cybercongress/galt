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

import {ModalItem} from '../../../../../directives/AsyncModal/index'
import GaltData from "../../../../../services/galtData";

import * as _ from 'lodash';
const pIteration = require('p-iteration');

export default {
    template: require('./AddSraModal.html'),
    props: ['spaceLockerAddress'],
    components: {
        ModalItem
    },
    async created() {
        this.spaceLockerContract = await this.$slrContract.getSpaceLockerByAddress(this.spaceLockerAddress);
        await this.spaceLockerContract.fetchTokenInfo();

        if(this.$locale.loaded) {
            this.getSras();
        } else {
            this.onLoadId = this.$locale.onLoad(this.getSras);
        }
    },
    methods: {
        approve() {
            this.approving = true;

            this.$galtUser.spaceLockerApproveMint(this.spaceLockerAddress, this.sra.address)
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
        mint() {
            this.minting = true;

            this.$galtUser.sraMint(this.sra.address, this.spaceLockerAddress)
                .then(() => {
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.mint.title"),
                        text: this.getLocale("success.mint.description")
                    });
                    this.$root.$asyncModal.close('add-sra-modal');
                })
                .catch((e) => {
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.mint.title"),
                        text: this.getLocale("error.mint.description")
                    });
                    this.minting = false;
                });
        },
        newMemberProposal() {
            this.minting = true;

            this.$galtUser.sraNewMemberProposal(this.sra.address, this.spaceLockerAddress, this.newMemberProposalDescription)
                .then(async () => {
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.new_member_proposal.title"),
                        text: this.getLocale("success.new_member_proposal.description")
                    });
                    this.$root.$asyncModal.close('add-sra-modal');
                })
                .catch((e) => {
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.new_member_proposal.title"),
                        text: this.getLocale("error.new_member_proposal.description")
                    });
                    this.minting = false;
                })
        },
        cancel() {
            this.$root.$asyncModal.close('add-sra-modal');
        },
        async getSras() {
            const alreadyMinted = await this.spaceLockerContract.getSrasAddresses();
            
            let spaceRegistry = [];

            if(!_.includes(alreadyMinted, this.$sraContract.address.toLowerCase())) {
                spaceRegistry = [{
                    'title': this.$locale.get('reputation.sras.space_reputation_accounting.title'),
                    'address': this.$sraContract.address,
                    'toLowerCase': () => this.$sraContract.address.toLowerCase(),
                    'toString': () => this.$sraContract.address
                }];
            }
            
            let fundsSrasAddresses = await this.$fundsRegistryContract.getFundsList();

            fundsSrasAddresses = fundsSrasAddresses.filter((sraAddress) => {
                return !_.includes(alreadyMinted, sraAddress);
            });

            const fundsSras = await pIteration.map(fundsSrasAddresses, async (fundAddress) => {
                const fundConract = await this.$fundsRegistryContract.getSRAByAddress(fundAddress);
                const sraObj =  {
                    'title': fundConract.storage ? fundConract.storage.name : "",
                    'isPrivate': fundConract.storage ? fundConract.storage.isPrivate : false,
                    'isMintApproved': null,
                    'address': fundAddress,
                    'toLowerCase': () => fundConract.address.toLowerCase(),
                    'toString': () => fundConract.address
                };
                
                if(sraObj.isPrivate) {
                    sraObj.isMintApproved = await fundConract.storage.isMintApproved(this.spaceLockerContract.spaceTokenId);
                } else {
                    sraObj.isMintApproved = true;
                }
                return sraObj;
            });
            
            this.srasList = spaceRegistry.concat(fundsSras)
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    beforeDestroy() {
        this.$locale.unbindOnLoad(this.onLoadId);
    },
    computed: {
        approvedDisabled() {
            return this.approved || this.approving;
        },
        mintDisabled() {
            return !this.approved || this.minting;
        },
        newMemberProposalDisabled() {
            return this.mintDisabled || !this.newMemberProposalDescription;
        },
        isMintApprovedSra() {
            return this.sra && this.sra.isMintApproved;
        },
        isPrivateSra() {
            return this.sra && this.sra.isPrivate;
        }
    },
    data: function () {
        return {
            localeKey: 'reputation.space_locker_page.add_sra_modal',
            sra: null,
            srasList: [],
            newMemberProposalDescription: '',
            approving: false,
            approved: false,
            minting: false
        }
    }
}
