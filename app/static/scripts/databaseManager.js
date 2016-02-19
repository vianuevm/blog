$(document).ready(function() {
 var myDataRef = new Firebase('https://zhacks.firebaseio.com/');
  var dbData = "";
  $('#messageInput').keypress(function (e) {
    if (e.keyCode == 13) {
      var name = $('#nameInput').val();
      var text = $('#messageInput').val();
      myDataRef.push({name: name, text: text});
      $('#messageInput').val('');
    }
  });

  $('.msgButton').click(function() {
      myDataRef.once('value', function(snapshot) {
        dbData = snapshot.val();
      });
      $('.showMessages').append(JSON.stringify(dbData));
  });

  myDataRef.on('child_added', function(snapshot) {
    var message = snapshot.val();
    dbData = snapshot.val();
    displayChatMessage(message.name, message.text);
  });
  function displayChatMessage(name, text) {
    $('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('#messagesDiv'));
    $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
  };
});