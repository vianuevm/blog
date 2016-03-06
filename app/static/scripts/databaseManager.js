$(document).ready(function() {
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
            /**
            *   Gotta love super hacky code when you're feelin' lazy
            *   All this does is put the computer data into a Latex format
            *   so it's super pretty and fun.
            */
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
            var finalEq = "<div class=\"panel panel-default\">" + 
              "<div class=\"panel-heading\"> <b>Document:</b> " + data.document + "</div>" + 
              "<div class=\"panel-body\"> <b>Equation:</b> " +
                 eq + 
              "</div>" +
            "</div>";

            $('.showMessages').append(finalEq);
            MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
          }
        })
        return false;
    }
  })
});