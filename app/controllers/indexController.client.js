'use strict';

var apiUrl = appUrl + '/api/:id';
var pollUrl = appUrl + '/api/polls';

var testPoll = {
  question: 'Which is the best test poll?',
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
      loggedIn: false
    },
    methods: {
      addPoll: function (event) {
        $.post(pollUrl, testPoll);
        alert('the click button is working')
      }
    }
});

ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
  var user = JSON.parse(data);
  vm.loggedIn = true;
  vm.username = user.username;
}));
