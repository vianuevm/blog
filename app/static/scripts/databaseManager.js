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

  $('#target').keypress(function() {
      var keycode = (event.keyCode ? event.keyCode : event.which);
      if(keycode == '13'){
        var terms = this.value.split(" ");  
        var data = {
          query: terms
        };
        $.ajax({
          type: 'POST',
          url: '/tfidf',
          data: JSON.stringify(data),
          contentType: 'application/json;charset=UTF-8',
          error: function() {
            console.log('Failure!');
          },
          success: function(data) {
            console.log(data);
            var eq = "$$\\frac{";
            for(var i = 0; i < data["numerator"].length; ++i) {
              eq += data.numerator[i];
              if(i !== data.numerator.length - 1) {
                eq += " + ";
              } 
            }
            eq += "}{";
            eq += "\\sqrt{"
            for(var j = 0; j < data["l_denominator"][0].length; ++j) {
              eq += "(" + data.l_denominator[0][j] + ")^2";
              if(j !== data.l_denominator[0].length - 1) {
                eq += " + ";
              } 
            }
            eq += "} + ";
            eq += "\\sqrt{"
            for(var k = 0; k < data["r_denominator"][0].length; ++k) {
              eq += "(" + data.r_denominator[0][k] + ")^2";
              if(k !== data.r_denominator[0].length - 1) {
                eq += " + ";
              } 
            }

            eq += "}";
            eq += "} = " + data["cosine"] + "$$";

            parser = new DOMParser();
            doc = parser.parseFromString(eq, "text/xml");
            $('.showMessages').append(eq);
            $('.showMessages').append(data.document);
            MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
          }
        })
        return false;
    }

  })

  $('.msgButton').click(function() {
      myDataRef.once('value', function(snapshot) {
        dbData = snapshot.val();
        for(var item in dbData) {
          if(dbData.hasOwnProperty(item)) {
            console.log(item);
            var arr = dbData[item].text.split(" ");
            var termFrequency = (dbData[item].text.match(/guyss/g) || []).length / arr.length;            
          }
        }
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