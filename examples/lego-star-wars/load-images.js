
var Gallery = { 'images' : [
      
  {
    'name'  : 'Darth Vader',
    'alt' : 'A Black Clad warrior lego toy',
    'url': 'https://lego-gallery-dlmgouauwv.now.sh/myLittleVader.jpg',
    'credit': '<a href="https://www.flickr.com/photos/legofenris/">legOfenris</a>, published under a <a href="https://creativecommons.org/licenses/by-nc-nd/2.0/">Attribution-NonCommercial-NoDerivs 2.0 Generic</a> license.'
  },

  {
    'name'  : 'Snow Troopers',
    'alt' : 'Two lego solders in white outfits walking across an icy plain',
    'url': 'https://lego-gallery-dlmgouauwv.now.sh/snowTroopers.jpg',
    'credit': '<a href="https://www.flickr.com/photos/legofenris/">legOfenris</a>, published under a <a href="https://creativecommons.org/licenses/by-nc-nd/2.0/">Attribution-NonCommercial-NoDerivs 2.0 Generic</a> license.'
  },

  {
    'name'  : 'Bounty Hunters',
    'alt' : 'A group of bounty hunters meeting, aliens and humans in costumes.',
    'url': 'https://lego-gallery-dlmgouauwv.now.sh/bountyHunters.jpg',
    'credit': '<a href="https://www.flickr.com/photos/legofenris/">legOfenris</a>, published under a <a href="https://creativecommons.org/licenses/by-nc-nd/2.0/">Attribution-NonCommercial-NoDerivs 2.0 Generic</a> license.'
  },

]};

function loadImage(imgJSON) {
  // return a promise for an image loading
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest();
    request.open('GET', imgJSON.url);
    request.responseType = 'blob';

    request.onload = function() {
      if (request.status == 200) {
        var arrayResponse = [];
        arrayResponse[0] = request.response;
        arrayResponse[1] = imgJSON;
        resolve(arrayResponse);
      } else {
        reject(Error('Image didn\'t load successfully; error code:' + request.statusText));
      }
    };

    request.onerror = function() {
      reject(Error('There was a network error.'));
    };

    // Send the request
    request.send();
  });
}

function addImage(arrayResponse) {
  var myImage = document.createElement('img');
  var myFigure = document.createElement('figure');
  var myCaption = document.createElement('caption');
  var imageURL = window.URL.createObjectURL(arrayResponse[0]);

  myImage.src = imageURL;
  myImage.setAttribute('alt', arrayResponse[1].alt);
  myCaption.innerHTML = '<strong>' + arrayResponse[1].name + '</strong>: Taken by ' + arrayResponse[1].credit;

  document.getElementById('images').appendChild(myFigure);
  myFigure.appendChild(myImage);
  myFigure.appendChild(myCaption);
}

function loadImages() {
  for(var i = 0; i<=Gallery.images.length-1; i++) {
    loadImage(Gallery.images[i]).then(function(arrayResponse) {
      addImage(arrayResponse);
    }, function(Error) {
      console.log(Error);
    });
  }
}
