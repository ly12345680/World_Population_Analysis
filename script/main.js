document.addEventListener('DOMContentLoaded', function () {
    var button1Link = document.getElementById('button1Link');
    var button2Link = document.getElementById('button2Link');
    var button3Link = document.getElementById('button3Link');
    var button4Link = document.getElementById('button4Link');
  
    button1Link.addEventListener('click', function (event) {
      event.preventDefault();
      console.log('Button 1 clicked');
      window.location.href = 'button1.html';
    });
  
    button2Link.addEventListener('click', function (event) {
      event.preventDefault();
      console.log('Button 2 clicked');
      window.location.href = 'button2.html';
    });

    button3Link.addEventListener('click', function (event) {
        event.preventDefault();
        console.log('Button 3 clicked');
        window.location.href = 'button3.html';
    });

    button4Link.addEventListener('click', function (event) {
        event.preventDefault();
        console.log('Button 4 clicked');
        window.location.href = 'button4.html';
    });
  });