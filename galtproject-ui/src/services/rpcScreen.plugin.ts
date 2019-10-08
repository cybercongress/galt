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
    install (Vue, options: any = {}) {

        let defaultCenterText;
        let defaultRightTopText;

        let isShowed = false;
        
        let videoYoutubeId;

        Vue.prototype.$rpcScreen = {
            show: function(mainServer?, altServers?) {
                const waitScreen = document.getElementById('rpc-screen');

                if(waitScreen) {
                    this.changeCenterText(defaultCenterText);
                    this.changeRightTopText(defaultRightTopText);
                    this.changeCenterSubText("");
                    waitScreen.style.display = 'flex';
                } else {
                    const appContainer = document.body;
                    const newWaitScreen = document.createElement('div');
                    newWaitScreen.id = 'rpc-screen';

                    const centerTextEl = document.createElement('div');
                    centerTextEl.id = 'rpc-screen-center-text';
                    centerTextEl.innerHTML = defaultCenterText + "<br/>" + mainServer;
                    newWaitScreen.appendChild(centerTextEl);

                    const centerSubTextEl = document.createElement('div');
                    centerSubTextEl.id = 'rpc-screen-center-sub-text';
                    centerSubTextEl.innerHTML = '<br/>' + altServers.join('<br/>');
                    newWaitScreen.appendChild(centerSubTextEl);
                    
                    const videoContainetEl = document.createElement('div');
                    centerSubTextEl.id = 'rpc-screen-center-video';
                    centerSubTextEl.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoYoutubeId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
                    newWaitScreen.appendChild(videoContainetEl);

                    const rightTopTextEl = document.createElement('div');
                    rightTopTextEl.id = 'rpc-screen-right-top-text';
                    rightTopTextEl.innerHTML = defaultRightTopText;
                    newWaitScreen.appendChild(rightTopTextEl);

                    appContainer.appendChild(newWaitScreen);
                }

                isShowed = true;
            },
            hide: function() {
                const waitScreen = document.getElementById('rpc-screen');
                waitScreen.style.display = 'none';
                isShowed = false;
            },
            setDefaultText: function(centerText, rightTopText) {
                defaultCenterText = centerText;
                defaultRightTopText = rightTopText;
            },
            setVideoYoutubeId: function(_videoYoutubeId) {
                videoYoutubeId = _videoYoutubeId;
            },
            isShowed() {
                return isShowed;
            }
        };
    }
}
