const socket = io();
/**
 * [イベント] ページの読込み完了
 */
window.onload = () => {
    document.querySelector('#msg').focus();
}

const app = new Vue({
    el: '#app',
    data: {
        textInput: '',
        myMessages: [],
        memberMessages: [],
        wasMe: false,
    },
    methods: {
        sendMessage() {
            this.myMessages.push(this.textInput);
            this.wasMe = true;
            socket.emit('post', this.textInput);
            this.textInput = '';
        }
    },
    mounted() {
        socket.on('member-post', (msg) => {
        console.log(msg);
            if (this.wasMe) {
                this.wasMe = false;
            } else {
                this.memberMessages.push(msg);
            }
        });
    }
});
