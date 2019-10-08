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
    name: 'tutorials-page',
    template: require('./TutorialsPage.html'),
    components: {},
    created() {

    },
    mounted() {
        this.getVideos();
        
        this.onLoadId = this.$locale.onLoad(() => {
            this.getVideos();
        });
    },
    beforeDestroy() {
        this.$locale.unbindOnLoad(this.onLoadId);
    },
    methods: {
        getVideos() {
            this.playlistId = this.$locale.get('tutorials.youtube_playlist_id');
            if(!this.playlistId) {
                this.tutorials = [];
                return;
            }
            
            this.$http.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${this.playlistId}&key=${this.googleApiKey}`).then(response => {
                this.tutorials = response.data.items.map((videoItem) => {
                    const videoSnippet = videoItem.snippet;
                    return {
                        title: videoSnippet.title,
                        youtubeUri: videoSnippet.resourceId.videoId
                    }
                });
            });
        }
    },
    data() {
        return {
            onLoadId: null,
            googleApiKey: 'AIzaSyB-YgXjBdus9bnjd_mC9NGVqgMGtgvAgj0',
            playlistId: this.$locale.get('tutorials.youtube_playlist_id'),
            tutorials: []
        };
    },
    watch: {
    },
    computed: {
        
    },
}
