"use strict";

const apiUrl = appUrl + "/api/:id";
const pollUrl = appUrl + "/api/polls";
const currentUrl = new URL(window.location);

let getIP = function() {
  $.get("https://api.ipify.org")
    .done(function(data) {
      vm.userIP = data;
    })
    .fail(function() {
      $.get("https://json.geoiplookup.io/api")
        .done(function(data) {
          vm.userIP = data.ip;
        })
        .fail(function(err) {
          console.log(err);
        });
    });
};

var vm = new Vue({
  el: "#app",
  data: {
    pollID: '',
    pollData: {},
    username: '',
    userIP: '',
    path: currentUrl.pathname,
    pollQuestion: '',
    pollOptions: [],
    titles: [],
    loggedIn: false,
  },
  methods: {
    getPollID: function() {
      this.pollID = this.path.slice(-6);
    },
    getPollData: function(pollID) {
      let self = this;
      $.get(appUrl + "/api/pollData/" + pollID, function(data) {
        self.pollData = data;
        self.pollQuestion = data.question;
        self.pollOptions = data.options;
      });
    }
  },
  beforeMount() {
    getIP();
    this.getPollID(currentUrl);
    this.getPollData(this.pollID);
  }
});

ajaxFunctions.ready(
  ajaxFunctions.ajaxRequest("GET", apiUrl, function(data) {
    var user = JSON.parse(data);
    if (user.error) {
      vm.loggedIn = false;
    } else {
      vm.loggedIn = true;
      vm.username = user.username;
    }
  })
);

// function to set the titles of the chart from poll options
let titles = [];
function chartTitles() {
  let pollID = currentUrl.pathname.slice(-6);
  $.get(appUrl + "/api/pollData/" + pollID, function(data) {
    let pollOptions = data.options;
    for (let option of pollOptions) {
      titles.push(option.title);
    }
    console.log(titles);
    console.log(barChart.data);
    barChart.data.labels = titles;
    barChart.update();
  });
} chartTitles();

// Chart.js
var ctx = $("#myChart");
var barChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: [],
    datasets: [
      {
        label: "# of Votes",
        data: [1, 1, 1],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)"
        ],
        borderColor: [
          "rgba(255,99,132,1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)"
        ],
        borderWidth: 1
      }
    ]
  },
  options: {
    responsive: false
  }
});
