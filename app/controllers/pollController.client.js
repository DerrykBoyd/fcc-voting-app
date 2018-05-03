'use strict';

var apiUrl = appUrl + '/api/:id';
var pollUrl = appUrl + '/api/polls';

var currentUrl = new URL(window.location);
console.log(currentUrl);

var vm = new Vue({
    el: '#app',
    data: {
      username: '',
      path: currentUrl.pathname,
      loggedIn: false,
      showMyPolls: false,
      polls: [],
      myPolls: [],
    },
    methods: {
      addPoll: function (event) {
        $.post(pollUrl + '/add', testPoll);
        this.getPolls();
        this.getMyPolls();
      },
      getPolls: function (event) {
        var self = this;
        $.get(pollUrl + '/all', function(data){
          self.polls = data;
        });
        console.log('polls loaded!')
      },
      getMyPolls: function (event) {
        var self = this;
        $.get(apiUrl + '/polls', function(data){
          self.myPolls = data;
        });
      },
      togglePolls: function() {
        this.showMyPolls = !this.showMyPolls;
      }
    },
    beforeMount() {
      this.getPolls();
      this.getMyPolls();
    }
});

ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
  var user = JSON.parse(data);
  if (user.error) {
    vm.loggedIn = false;
  } else {
  vm.loggedIn = true;
  vm.username = user.username;
  }
}));

// Chart.js
var ctx = $('#myChart');
var barChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
      labels: ["Red", "Blue", "Yellow"],
      datasets: [{
          label: '# of Votes',
          data: [12, 19, 3],
          backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
      }]
  },
  options: {
    responsive: false,
  }
});


