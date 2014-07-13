$(function(){
  var socket = io.connect();

  socket.on('connect', function(){
    console.log('connected!');
  });

  // send keyword by using post method
  $('#keyword_form').on('submit', function(){
    var keyword = $('#keyword').val();
    console.log('keyword: ' + keyword);
    if(keyword){
      socket.emit('keyword post',keyword);
    }
  });

  socket.on('message', function(t){
    console.log('message: ' + t);
    $('<div></div>')
      .html('<li>' + t + '</li>')
      .prependTo('#tweets');
  });

});
