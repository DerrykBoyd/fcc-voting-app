'use strict';

const apiUrl = `${appUrl}/api/:id`;
const currentUrl = new URL(window.location);

const getIP = function () {
  $.get('https://api.ipify.org')
    .done((data) => {
      vm.userIP = data;
      setVote();
    })
    .fail(() => {
      $.get('https://json.geoiplookup.io/api')
        .done(function(data) {
          vm.userIP = data.ip;
          setVote();
        })
        .fail(function(err) {
          console.log(err);
        });
    });
};

// function to populate vote if user previously voted - DONE
let setVote = () => {
  $.post(`${appUrl}/api/checkVote?user=${vm.username}&userIP=${vm.userIP}&pollID=${vm.pollID}`, (data) => {
    // handle returned data from API call - data will be the option selected for the IP
    vm.selectedOption = data;
    chartTitles();
  });
};

const vm = new Vue({
  el: '#app',
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
    getPollID() {
      this.pollID = this.path.slice(-6);
    },
    getPollData(pollID) {
      let self = this;
      $.get(`${appUrl}/api/pollData/${pollID}`, function(data) {
        self.pollData = data;
        self.pollQuestion = data.question;
        self.pollOptions = data.options;
      });
    },
    updateVotes(option) {
      console.log(`updatingVotes... ${option}`);
      let self = this;
      let pollOptions = self.pollOptions;
      let chartData = barChart.data.datasets[0].data;
      let previousOpt = self.selectedOption;
      self.selectedOption = option;
      // remove previous vote and add new vote to bar chart
      for (let i = 0; i < pollOptions.length; i++) {
        // if vote removed reduce the chart data by 1
        if (pollOptions[i].title === previousOpt) chartData[i] -= 1;
        // if vote added increase chart data by 1
        if (pollOptions[i].title === option) chartData[i] += 1;
      }
      barChart.update();
      // add the new vote to the db
      $.post(`${appUrl}/api/${vm.pollID}/addVote?option=${option}&username=${vm.username}&userIP=${vm.userIP}`);
    },
    addOption() {
      let option = this.newOption;
      console.log(`adding... ${option}`);
      $.post(`${appUrl}/api/addOption?option=${option}&pollID=${this.pollID}`, (err) => {
        if (err) console.log(err);
      }).done(() => {
        this.pollOptions.push({'title':option});
        this.newOption = '';
        this.getPollData();
        chartTitles();
      });
    },
  },
  beforeMount() {
    getIP();
    this.getPollID(currentUrl);
    this.getPollData(this.pollID);
  },
  created() {
    setVote();
  },
});

ajaxFunctions.ready(
  ajaxFunctions.ajaxRequest('GET', apiUrl, (data) => {
    let user = JSON.parse(data);
    if (user.error) {
      vm.loggedIn = false;
    } else {
      vm.loggedIn = true;
      vm.username = user.username;
    }
  }),
);

// function to set the titles of the chart from poll options
// add votes to bar chart
function chartTitles() {
  const pollID = currentUrl.pathname.slice(-6);
  $.get(`${appUrl}/api/pollData/${pollID}`, (data) => {
    let pollOptions = data.options;
    let titles = [];
    let voters = [];
    for (let option of pollOptions) {
      titles.push(option.title);
    }
    // set the chart labels to the poll option titles
    let reducedTitles = [];
    titles.reduce((acc, cur)=> {
      if (cur.length < 11) reducedTitles.push(cur);
      else {
        let shortStr = cur.slice(0, 10);
        reducedTitles.push(shortStr);
      }
    }, 0);
    barChart.data.labels = reducedTitles;
    // update bar chart with voter numbers
    $.get(`${appUrl}/api/${pollID}/addVote`, (data) => {
      // function that takes titles and data and returns voters in correct order in array
      voters = populateVotes(titles, data);
    }).done(() => {
      barChart.data.datasets[0].data = voters;
      updateChartColors(voters);
      barChart.update();
    });
  });
}

function populateVotes(titles, votes) {
  const voteArr = [];
  // populate the voteArr with the correct amount of fields
  titles.reduce((acc, cur, idx) => {
    voteArr[idx] = 0;
  }, 0);
  // check each vote and increment the voteArr values
  votes.reduce((acc, cur) => {
    if (titles.indexOf(cur.option) != -1) {
      const index = titles.indexOf(cur.option);
      voteArr[index]++;
    }
  }, 0);
  return voteArr;
}

function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
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
const ctx = $('#myChart');
const barChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: [],
    datasets: [
      {
        label: '# of Votes',
        data: [],
        backgroundColor: [],
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: false,
    cutoutPercentage: 25,
  },
});
