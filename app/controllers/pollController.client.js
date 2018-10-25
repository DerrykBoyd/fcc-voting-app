"use strict";

const apiUrl = appUrl + "/api/:id";
const pollUrl = appUrl + "/api/polls";
const currentUrl = new URL(window.location);

let getIP = function(callback) {
  $.get("https://api.ipify.org")
    .done(function(data) {
      vm.userIP = data;
      setVote();
    })
    .fail(function() {
      $.get("https://json.geoiplookup.io/api")
        .done(function(data) {
          vm.userIP = data.ip;
          setVote();
        })
        .fail(function(err) {
          console.log(err);
        });
    });
};

//function to populate vote if user previously voted - DONE
let setVote = () => {
  $.post(appUrl + '/api/checkVote?user='+vm.username+'&userIP='+vm.userIP+'&pollID='+vm.pollID, (data) => {
    //handle returned data from API call - data will be the option selected for the IP
    vm.selectedOption = data;
    chartTitles();
  });
}

var vm = new Vue({
  el: "#app",
  data: {
    pollID: '',
    pollData: {},
    username: 'none',
    userIP: '',
    path: currentUrl.pathname,
    pollQuestion: '',
    pollOptions: {},
    titles: [],
    loggedIn: false,
    selectedOption: '',
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
    },
    updateVotes: (option) => {
      console.log('updatingVotes... ' + option)
      let self = this;
      self.selectedOption = option;
      $.post(appUrl + '/api/' + vm.pollID + '/addVote?option=' + option + '&username=' + vm.username + '&userIP=' + vm.userIP, (err) => {
        if (err) console.log(err)
      }).done(chartTitles())
    }
  },
  beforeMount() {
    getIP();
    this.getPollID(currentUrl);
    this.getPollData(this.pollID);
  },
  created() {
    setVote();
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
// add votes to bar chart
function chartTitles() {
  let pollID = currentUrl.pathname.slice(-6);
  $.get(appUrl + "/api/pollData/" + pollID, function(data) {
    let pollOptions = data.options;
    let titles = [];
    let voters = [];
    for (let option of pollOptions) {
      titles.push(option.title);
    }
    // set the chart labels to the poll option titles
    barChart.data.labels = titles;
    // update bar chart with voter numbers
    $.get(appUrl + "/api/"+pollID+"/addVote", (data) => {
      // function that takes titles and data and returns voters in correct order in array
      voters = populateVotes(titles, data)
    }).done(() => {
      barChart.data.datasets[0].data = voters;
      barChart.update();
    })
  });
}

function populateVotes (titles, votes) {
  let voteArr = []
  // populate the voteArr with the correct amount of fields
  titles.reduce((acc, cur, idx, arr)=>{
	  voteArr[idx] = 0;
  }, 0)
  // check each vote and increment the voteArr values
  votes.reduce((acc, cur) => {
    if (titles.indexOf(cur.option) != -1) {
        let index = titles.indexOf(cur.option)
        voteArr[index]++
      }
  }, 0)
  return voteArr;
}

// Chart.js
var ctx = $("#myChart");
var barChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: [],
    datasets: [
      {
        label: "# of Votes",
        data: [],
        backgroundColor: [
          "rgba(255, 0, 0, 0.8)",
          "rgba(0, 0, 255, 0.8)",
          "rgba(255, 255, 0, 0.8)",
          "rgba(0, 255, 0, 0.8)",
          "rgba(0, 255, 255, 0.8)",
          "rgba(255, 0, 255, 0.8)"
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
    responsive: false,
    cutoutPercentage: 25
  }
});
