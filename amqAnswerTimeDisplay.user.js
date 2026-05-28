// ==UserScript==
// @name         AMQ Answer Time Display
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       you
// @match        https://animemusicquiz.com/*
// @grant        none
// @updateURL    https://github.com/tomokarin/Scripts/raw/main/amqAnswerTimeDisplay.user.js
// ==/UserScript==

// don't load on login page
if (document.getElementById("startPage")) return;

// Wait until the LOADING... screen is hidden and load script
let loadInterval = setInterval(() => {
    if (document.getElementById("loadingScreen").classList.contains("hidden")) {
        setup();
        clearInterval(loadInterval);
    }
}, 500);

//Main Script
let ignoredPlayerIds = []

new Listener("Game Starting", ({players}) => {
    ignoredPlayerIds = []
    const self = players.find(player => player.name === selfName)
    if(self){
        const teamNumber = self.teamNumber
        if(teamNumber){
            const teamMates = players.filter(player => player.teamNumber === teamNumber)
            if(teamMates.length > 1){
                ignoredPlayerIds = teamMates.map(player => player.gamePlayerId)
            }
        }
    }
}).bindListener()

new Listener("player answered", (data) => {
    data.filter(gamePlayerId => !ignoredPlayerIds.includes(gamePlayerId)).forEach(gamePlayerId => {
        quiz.players[gamePlayerId].answer = (Math.round(amqAnswerTimesUtility.playerTimes[gamePlayerId]/10)) / 100 + " s"
    })
}).bindListener()

quiz._playerAnswerListner = new Listener(
    "player answers",
    function (data) {
        const that = quiz
        data.answers.forEach((answer) => {
            const quizPlayer = that.players[answer.gamePlayerId]
            let answerText = answer.answer
            if(amqAnswerTimesUtility.playerTimes[answer.gamePlayerId] !== undefined){
                answerText += " (" + (Math.round(amqAnswerTimesUtility.playerTimes[answer.gamePlayerId]/10)) /100 + " s)"
            }
            quizPlayer.answer = answerText
            quizPlayer.unknownAnswerNumber = answer.answerNumber
            quizPlayer.toggleTeamAnswerSharing(false)
        })

        if (!that.isSpectator) {
            that.answerInput.showSubmitedAnswer()
            that.answerInput.resetAnswerState()
        }

        that.videoTimerBar.updateState(data.progressBarState)
    }
)
