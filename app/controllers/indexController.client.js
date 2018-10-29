'use strict';

const apiUrl = `${appUrl}/api/:id`;
const pollUrl = `${appUrl}/api/polls`;

const defaultPoll = {
  question: '',
  options:[
    {
      title: ''
    },
    {
      title: ''
    },
    {
      title: ''
    },
  ]
};

const vm = new Vue({
  el: '#app',
  data: {
    username: '',
    loggedIn: false,
    showAllPolls: true,
    showMyPolls: false,
    showNewPoll: false,
    formOK: false,
    polls: [],
    myPolls: [],
    pollData: {
      question: '',
      options: [
        {
          title: ''
        },
        {
          title: ''
        },
        {
          title: ''
        },
      ],
      voters: [],
    },
  },
  computed: {
    hideMyPolls: function() {
      if (!this.showAllPolls && !this.showNewPoll) {
        return false;
      } else return true;
    },
    hideAllPolls: function() {
      if (!this.showMyPolls && !this.showNewPoll) {
        return false;
      } else return true;
    },
    checkForm: function () {
      if (!this.pollData.question) return false;
      for (let option of this.pollData.options) {
        if (!option.title) return false;
      }
      return true;
    },
  },
  methods: {
    removeOption: function(index) {
      this.pollData.options.splice(index, 1);
    },
    addOption: function() {
      this.pollData.options.push({
        title: '',
      });
    },
    hideForm: function() {
      this.showNewPoll = !this.showNewPoll;
    },
    addPoll: function () {
      $.post(`${pollUrl}/add`, this.pollData)
        .done( () => {
          console.log('poll added!!');
          this.pollData = defaultPoll;
          this.hideForm();
          this.getPolls();
          this.getMyPolls();
        });
    },
    getPolls: function () {
      let self = this;
      $.get(`${pollUrl}/all`, function(data){
        self.polls = data;
      });
    },
    getMyPolls: function () {
      let self = this;
      $.get(`${apiUrl}/polls`, function(data){
        self.myPolls = data;
      });
    },
    togglePolls: function () {
      this.showMyPolls = !this.showMyPolls;
      this.showAllPolls = !this.showAllPolls;
    },
    deletePoll: function(poll) {
      let self = this;
      $.post(`${appUrl}/api/deletePoll?pollID=${poll.pollID}`, (data) => {
        console.log(`Deleted: ${data.pollID}`);
        self.getMyPolls();
        self.getPolls();
      });
    }
  },
  beforeMount() {
    this.getPolls();
    this.getMyPolls();
  }
});

ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
  let user = JSON.parse(data);
  if (user.error) {
    vm.loggedIn = false;
  } else {
    vm.loggedIn = true;
    vm.username = user.username;
  }
}));
