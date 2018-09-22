<template>
<div>
    <h1>Welcome to SpotifyShuffler !</h1>
    <button v-on:click="login">Login to Spotify</button>
</div>
</template>

<script>
export default {
    methods: {
        login: function() {
            console.log("coucou");
            console.log(this.$auth.isConnected);
            this.$auth.login({
                complete: () => console.log("Conneccfted!"),
                error: () => console.log("errrrr"),
            });
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../style";

div {
    height: 50%;
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    margin: 25%;
    button {
        background-color: $primary_clr;
        border: 0;
        height: 60px;
        width: 160px;
        border-radius: 30px;
    }
}
</style>
