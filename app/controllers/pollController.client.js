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
    newOption: '',
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
    updateVotes: function(option) {
      console.log('updatingVotes... ' + option)
      let self = this;
      self.selectedOption = option;
      $.post(appUrl + '/api/' + vm.pollID + '/addVote?option=' + option + '&username=' + vm.username + '&userIP=' + vm.userIP, (err) => {
        if (err) console.log(err)
      }).done(chartTitles())
    },
    addOption: function() {
      let option = this.newOption;
      console.log('adding... ' + option)
      $.post(appUrl + '/api/addOption?option=' + option + '&pollID=' + this.pollID, (err, res) => {
        if (err) console.log(err);
        console.log(res);
      }).done(() => {
        this.pollOptions.push({"title":option});
        this.newOption = '';
        this.getPollData();
        chartTitles();
      })
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
    let reducedTitles = []
    titles.reduce((acc, cur)=> {
      if (cur.length < 11) reducedTitles.push(cur)
      else {
        let shortStr = cur.slice(0, 10)
        reducedTitles.push(shortStr)
      }
    }, 0)
    barChart.data.labels = reducedTitles;
    // update bar chart with voter numbers
    $.get(appUrl + "/api/"+pollID+"/addVote", (data) => {
      // function that takes titles and data and returns voters in correct order in array
      voters = populateVotes(titles, data)
    }).done(() => {
      barChart.data.datasets[0].data = voters;
      updateChartColors(voters);
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

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function updateChartColors(voters) {
  for (let i = 0; i < voters.length; i++) {
    if (!barChart.data.datasets[0].backgroundColor[i]) {
      barChart.data.datasets[0].backgroundColor.push(getRandomColor());
    }
  }
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
        backgroundColor: [],
        borderWidth: 1
      }
    ]
  },
  options: {
    responsive: false,
    cutoutPercentage: 25
  }
});
