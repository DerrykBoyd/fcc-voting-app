'use strict';

(function () {

   var displayName = document.querySelector('#display-name');
   var apiUrl = appUrl + '/api/:id';

   function updateHtmlElement (data, element, userProperty) {
      element.innerHTML = data[userProperty];
   }

   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
      var userObject = JSON.parse(data);
      console.log(userObject);

      if (displayName !== null) {
         updateHtmlElement(userObject, displayName, 'username');
      }

   }));
})();
