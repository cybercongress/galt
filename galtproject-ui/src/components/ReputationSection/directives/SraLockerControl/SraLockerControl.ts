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

import GaltData from "../../../../services/galtData";

import * as _ from 'lodash';

export default {
    name: 'sra-locker-control',
    template: require('./SraLockerControl.html'),
    props: ['sraAddress', 'spaceLockerAddress', 'loading'],
    async mounted() {
        this.getSra();
    },
    watch: {
        async user_wallet() {
            this.getSra();
        },
        async sraAddress() {
            this.getSra();
        },
    },
    methods: {
        async getSra() {
            this.$emit('update:loading', true);
            this.sra = null;

            const sra = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);

            await sra.fetchGeneralInfo();
            this.sra = sra;
            this.isSraMember = this.user_wallet && (await this.sra.getIsMember(this.user_wallet));
            this.isPrivateSra = this.sra.storage && this.sra.storage.isPrivate;

            if(!this.isSraMember && this.isPrivateSra) {
                const newMemberProposalContract = await this.sra.storage.getNewMemberProposalContract();
                this.userSentJoinProposal = (await newMemberProposalContract.getActiveProposalsBySenderCount(this.user_wallet)) > 0;
            }

            if (this.spaceLockerAddress) {
                const spaceLocker = await this.$slrContract.getSpaceLockerByAddress(this.spaceLockerAddress);
                await spaceLocker.fetchTokenInfo();
                this.spaceLocker = spaceLocker;

                this.showLockerControl = spaceLocker.owner.toLowerCase() === this.user_wallet.toLowerCase();

                //TODO: optimize: use isSraMember
                if (this.showLockerControl) {
                    const isSraMinted = await this.spaceLocker.getIsMinted(this.sraAddress);
                    this.sraApprovedToSpaceLocker = isSraMinted;

                    if (isSraMinted) {
                        const ownerHas = await this.sra.getOwnerHasSpaceToken(this.user_wallet, this.spaceLocker.spaceTokenId);
                        this.spaceLockerMintedToSra = ownerHas;
                        if(!this.spaceLockerMintedToSra && this.isPrivateSra) {
                            this.isMintApprovedSra = await this.sra.storage.isMintApproved(this.spaceLocker.spaceTokenId);
                        } else {
                            this.isMintApprovedSra = true;
                        }
                    }
                }
            }
            this.$emit('update:loading', false);
        },
        reputationBurn() {
            this.$emit('update:loading', true);

            this.$galtUser.sraBurn(this.sraAddress, this.spaceLockerAddress)
                .then(async () => {
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.reputation_burn.title"),
                        text: this.getLocale("success.reputation_burn.description")
                    });
                    this.$emit('update');
                    await this.getSra();
                    this.$emit('update:loading', false);
                })
                .catch((e) => {
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.reputation_burn.title"),
                        text: this.getLocale("error.reputation_burn.description")
                    });
                    this.$emit('update:loading', false);
                })
        },
        reputationMint() {
            this.$emit('update:loading', true);

            this.$galtUser.sraMint(this.sraAddress, this.spaceLockerAddress)
                .then(async () => {
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.reputation_mint.title"),
                        text: this.getLocale("success.reputation_mint.description")
                    });
                    this.$emit('update');
                    await this.getSra();
                    this.$emit('update:loading', false);
                })
                .catch((e) => {
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.reputation_munt.title"),
                        text: this.getLocale("error.reputation_mint.description")
                    });
                    this.$emit('update:loading', false);
                })
        },
        newMemberProposal() {
            this.$emit('update:loading', true);

            GaltData.specifyDescriptionModal({localeKey: this.localeKey + '.new_member_proposal_description_modal'}).then((description) => {
                this.$galtUser.sraNewMemberProposal(this.sraAddress, this.spaceLockerAddress, description)
                    .then(async () => {
                        this.$notify({
                            type: 'success',
                            title: this.getLocale("success.new_member_proposal.title"),
                            text: this.getLocale("success.new_member_proposal.description")
                        });
                        this.$emit('update');
                        await this.getSra();
                        this.$emit('update:loading', false);
                    })
                    .catch((e) => {
                        console.error(e);

                        this.$notify({
                            type: 'error',
                            title: this.getLocale("error.new_member_proposal.title"),
                            text: this.getLocale("error.new_member_proposal.description")
                        });
                        this.$emit('update:loading', false);
                    })
            }).catch(() => {});
        },
        approveMint() {
            this.$emit('update:loading', true);

            this.$galtUser.spaceLockerApproveMint(this.spaceLockerAddress, this.sraAddress)
                .then(async () => {
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.approve_mint.title"),
                        text: this.getLocale("success.approve_mint.description")
                    });
                    this.$emit('update');
                    await this.getSra();
                    this.$emit('update:loading', false);
                })
                .catch((e) => {
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.approve_mint.title"),
                        text: this.getLocale("error.approve_mint.description")
                    });
                    this.$emit('update:loading', false);
                })

        },
        approveBurn() {
            this.$emit('update:loading', true);

            this.$galtUser.spaceLockerApproveBurn(this.spaceLockerAddress, this.sraAddress)
                .then(async () => {
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.approve_burn.title"),
                        text: this.getLocale("success.approve_burn.description")
                    });
                    this.$emit('update');
                    await this.getSra();
                    this.$emit('update:loading', false);
                })
                .catch((e) => {
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.approve_burn.title"),
                        text: this.getLocale("error.approve_burn.description")
                    });
                    this.$emit('update:loading', false);
                })

        },
        
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_locker_control',
            sra: null,
            spaceLocker: null,
            showLockerControl: false,
            sraApprovedToSpaceLocker: false,
            spaceLockerMintedToSra: false,
            isPrivateSra: false,
            isSraMember: false,
            isMintApprovedSra: false,
            userSentJoinProposal: false
        }
    }
}
