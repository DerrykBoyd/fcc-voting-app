'use strict';

var apiUrl = appUrl + '/api/:id';
var pollUrl = appUrl + '/api/polls';

var testPoll = {
  question: 'GitHub test Poll!!!',
  options: [
    {
      title: 'option 1',
      votes: 0
    },
    {
      title: 'option 2',
      votes: 0
    }]
};

var vm = new Vue({
    el: '#app',
    data: {
      username: '',
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
