// Initialize your app
var myApp = new Framework7({
	material: true,
	modalTitle: 'Table Tenis',

});
// Export selectors engine
var $$ = Dom7;
// Add view
var mainView = myApp.addView('.view-main', {
	domCache: true //enable inline pages

});
// Initialize Firebase
var config = {
	apiKey: "AIzaSyB5LRHsMRabuBJIuu2lZ78rLm90oMVQ_3E",
	authDomain: "cmupingpong.firebaseapp.com",
	databaseURL: "https://cmupingpong.firebaseio.com",
	storageBucket: "cmupingpong.appspot.com",
	messagingSenderId: "351881220973"
};

firebase.initializeApp(config);


var database = firebase.database();
var player_ref = database.ref('PlayerProfile/');
var user = firebase.auth().currentUser;

// var name, email, photoUrl, uid, emailVerified;


window.addEventListener('load', function() {

	playerContentIndex(3, 'rating');
	authState('load');
	// gamesTimeline();

});


$$(document).on('page:init', function(e) {

	var page = e.detail.page;
	// Player Page
	if (page.name === 'index') {
		playerContentIndex(3, 'rating');
		authState(page.name);


	}
	if (page.name === 'players') {

		playerContent('rating');

		var mySearchbar = myApp.searchbar('.searchbar', {
    	searchList: '.list-block-search',
    	searchIn: '.item-title'
		}); 
	}
	if (page.name === 'login-screen') {

		var uiConfig = {

		credentialHelper: firebaseui.auth.CredentialHelper.NONE,
		signInSuccessUrl: 'index.html',
		signInOptions: [
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.FacebookAuthProvider.PROVIDER_ID,
			firebase.auth.TwitterAuthProvider.PROVIDER_ID
		],
		// signInFlow:'popup',
		// Terms of service url.
		tosUrl: 'services.html'
		};
	// Initialize the FirebaseUI Widget using Firebase.
		var ui = new firebaseui.auth.AuthUI(firebase.auth());

		// The start method will wait until the DOM is loaded.
		ui.start('#firebaseui-auth-container', uiConfig);
	}
	if (page.name === 'add-game') {

		var user = firebase.auth().currentUser;
		var name, email, photoUrl, uid, emailVerified;
		mainView.router.reloadPage('add-game.html');

		if (user != null) {

		loadAddGame();
		name = user.displayName;

		$$('.welcomeName').html('Hi' + ' ' + name);

			if (!myApp.device.ios) {
				$$(page.container).find('input, textarea').on('focus', function(event) {
					var container = $$(event.target).closest('.page-content');
					var elementOffset = $$(event.target).offset().top;
					var pageOffset = container.scrollTop();
					var newPageOffset = pageOffset + elementOffset - 81;
					setTimeout(function() {
						container.scrollTop(newPageOffset, 300);
					}, 700);
				});
			}
		}
		else{
			$$('.welcomeName').html('No account');


			loginRedirect();
		}
	}
	if (page.name === 'timeline') {
		var user = firebase.auth().currentUser;
		name = user.displayName;

		gamesTimeline(name);
		

	}

});


var loginLink = $$('div').filter(function(index, el) {
	return $$(this).hasClass('loginLink');
});


var logoutLink = $$('a').filter(function(index, el) {
	return $$(this).hasClass('log-out');
});


logoutLink.on('click', function(e) {

	firebase.auth().signOut();
	myApp.closePanel();
	mainView.router.loadPage('index.html');
	alert('Sign Out Successful');
	logoutLink.hide();

});


// =================Add Game Page=====================
// myApp.onPageInit('add-game', function(page) {
function loadAddGame() {

// Populating Opponents Name Field
var autocompleteDropdownAll = myApp.autocomplete({
	input: '#autocomplete-dropdown-all',
	openIn: 'dropdown',
	source: function(autocomplete, query, render) {

		var results = [];
		var player_ref = database.ref('PlayerProfile/');

		player_ref.on("value", function(snapshot) {
			snapshot.forEach(function(player_snap) {
				// var uid = player_snap.child("uid").val();
				var displayName = player_snap.child("displayName").val();

				if (displayName.toLowerCase().indexOf(query.toLowerCase()) >= 0)
					results.push(displayName);
				// console.log(displayName);
			});
			render(results)
		});

	}
});
	// End of Opponents Name field

function validateScores(opponent_score,user_score,opponent_name) {

	if (!opponent_score || !user_score || !opponent_name) {
	myApp.alert('field is empty...');
	return;
	}
}

	//Getting data from Form
$$('.form-to-data').on('click', function() {

var user = firebase.auth().currentUser;
	//Current User Data
	var UserformData = myApp.formToData('#UserScoreForm'); // formData is an Object
	var user_uid = user.uid;
	var user_name = user.displayName;
	var user_score = parseInt(UserformData["UserScore"]);

	//Opponent Data
	var OpponentformData = myApp.formToData('#OpponentScoreForm');
	var opponent_name = OpponentformData["OpponentName"];
	var opponent_score = parseInt(OpponentformData["OpponentScore"]);

	validateScores(opponent_score,user_score,opponent_name);

	player_ref.orderByChild("displayName").equalTo(opponent_name).on("child_added", function(snapshot) {

		opponent_uid = snapshot.key;
		opponent_rating = snapshot.val().rating;
		opponent_matches = snapshot.val().matches;

		pushGame();
	}); //End of player_ref opponent_uid


var winner_score, winner_uid, winner_name, winner_rating;
var loser_score, loser_uid, loser_name, loser_rating, totalPoints;

function findWinner() {

	console.log('12 This is the user_score at the point ' + user_score + 'This is the opponent_score ' + opponent_score);
	if (user_score > opponent_score) {
		console.log('13 This is the user_score at the point ' + user_score + 'This is the opponent_score ' + opponent_score);

		winner_score = user_score;
		winner_uid = user_uid;
		winner_name = user_name;

		loser_score = opponent_score;
		loser_uid = opponent_uid;
		loser_name = opponent_name;
		console.log();
		('User Won with :' + winner_score + ' Opponent lost with:' + loser_score);

	} else {
		console.log('14 This is the user_score at the point ' + user_score + 'This is the opponent_score ' + opponent_score);
		winner_score = opponent_score;
		winner_uid = opponent_uid;
		winner_name = opponent_name;

		loser_score = user_score;
		loser_uid = user_uid;
		loser_name = user_name;
		console.log('Opponent Won with:' + winner_score + ' User lost with: ' + loser_score);
	}
}

function pushGame() {

	findWinner();

	calculateRating();

	var Games = database.ref('Games/');
	var Game = Games.child('Game');
	var Stats = Games.child('Stats');
	var time_stamp =firebase.database.ServerValue.TIMESTAMP;

	Game.push({
		// date: firebase.database.ServerValue.TIMESTAMP,
		added_by:user_uid,
		user_score:user_score,
		user_name:user_name,
		opponent_uid:opponent_uid,
		opponent_name:opponent_name,
		opponent_score:opponent_score,
		totalPoints:'?',
		status:'pending',
		date:time_stamp	
	})
	// var gameKey=game.key();

	Stats.push({
			// gameKey:game,
			date:time_stamp,	
			// new_rating: new_winner_rating,
			winner_score: winner_score,
			winner_uid: winner_uid,
			winner_name: winner_name,
			loser_score: loser_score,
			loser_uid: loser_uid,
			loser_name: loser_name
		
	});


	updateMatches(user_uid);
	updateMatches(opponent_uid);

	alert("Game Added!");
	mainView.router.reloadPage('add-game.html');
	mainView.router.loadPage('timeline.html');

} //End of push Game function

function calculateRating() {

	//Evaluate winner rating and loser rating
	database.ref('/PlayerProfile/' + user_uid).once('value').then(function(snapshot) {

		var user_rating = snapshot.val().rating;

		console.log('1 This is the user_score at the point ' + user_score + 'This is the opponent_score ' + opponent_score);

		if (user_score > opponent_score) {
			console.log(' 2 This is the user_score at the point ' + user_score + 'This is the opponent_score ' + opponent_score);

			console.log('Winner is ' + user_name + ' with as score of ' + user_score);

			winner_rating = user_rating;
			loser_rating = opponent_rating;
			// myApp.alert('user_rating:' + winner_rating + 'opponent_rating:' + loser_rating);

		} else {
			console.log(' 3 This is the user_score at the point ' + user_score + 'This is the opponent_score ' + opponent_score);
			console.log('Winner is ' + opponent_name + 'with as score of ' + opponent_score);

			winner_rating = opponent_rating;
			loser_rating = user_rating

			// myApp.alert('user_rating:' + loser_rating + 'opponent_rating:' + winner_rating);
		}

		points = (winner_score - loser_score);

		console.log('points ' + points);

		var diffInRatings = (winner_rating - loser_rating);

		console.log('diffInRating :' + diffInRatings);

		var changeInRating = ((0.000128 * (diffInRatings * diffInRatings)) - (0.064 * diffInRatings) + 8);

		console.log('changeInRating :' + changeInRating);

		if (winner_rating != loser_rating) {
			pointsAwarded = (points / 10);
			console.log(' Points Awarded  ' + pointsAwarded);

			totalPoints=Math.round10(pointsAwarded+changeInRating,-2);

			new_winner_rating = (winner_rating + changeInRating + pointsAwarded);
			console.log('old winner rating  ' + winner_rating + ' updated winner rating ' + new_winner_rating);

			new_loser_rating = (loser_rating - changeInRating);
			console.log('old loser rating  ' + loser_rating + 'updated loser rating ' + new_loser_rating);

			myApp.alert('New Rating : '+ Math.round10(new_winner_rating,-2), 'Game Stats');
			// myApp.alert('Your New Rating is :' + new_winner_rating);

		} else if (winner_rating == loser_rating) {
			pointsAwarded = (points / 10);
			console.log(' 2 pointsAwarded  ' + pointsAwarded);

			totalPoints=Math.round10(pointsAwarded,-2);

			new_winner_rating = (winner_rating + pointsAwarded);
			new_loser_rating = (loser_rating - pointsAwarded);
			myApp.alert(new_winner_rating + ': Same Rating Players ' + new_loser_rating);

		} else {
			myApp.alert('Something is wrong')
		}

		var updates = {};

		updates['PlayerProfile/' + winner_uid + '/rating'] = Math.round10(new_winner_rating,-2);
		updates['PlayerProfile/' + loser_uid + '/rating'] = Math.round10(new_loser_rating,-2);
		
		return database.ref().update(updates);

	});
}


function updateMatches(uid) {

matches_ref = database.ref('/PlayerProfile/' + uid).once('value').then(function(snapshot) {
	var current_matches = snapshot.val().matches;

	updated_matches = current_matches + 1;

	var updates = {};
	updates['PlayerProfile/' + uid + '/matches'] = updated_matches;
	// updates['PlayerProfile/' + uid2 + '/matches'] = new_matches;
	return database.ref().update(updates);
	});
}

});// End of on-form-click

// ==========End of Add Score================

}
// ========================End of Add Page Init===========================

// Generate dynamic page
var dynamicPageIndex = 0;

function createContentPage() {
	mainView.router.loadContent(
		'<!-- Top Navbar-->' +
		'<div class="navbar">' +
		'  <div class="navbar-inner">' +
		'    <div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Back</span></a></div>' +
		'    <div class="center sliding">Dynamic Page ' + (++dynamicPageIndex) + '</div>' +
		'  </div>' +
		'</div>' +
		'<div class="pages">' +
		'  <!-- Page, data-page contains page name-->' +
		'  <div data-page="dynamic-pages" class="page">' +
		'    <!-- Scrollable page content-->' +
		'    <div class="page-content">' +
		'      <div class="content-block">' +
		'        <div class="content-block-inner">' +
		'          <p>Here is a dynamic page created on ' + new Date() + ' !</p>' +
		'          <p>Go <a href="#" class="back">back</a> or go to <a href="services.html">Services</a>.</p>' +
		'        </div>' +
		'      </div>' +
		'    </div>' +
		'  </div>' +
		'</div>'
	);
	return;
}
// ===============================FUNCTIONS================================================//
authState = function(page) {
	firebase.auth().onAuthStateChanged(function(user) {

	if (user) {
		// User is signed in.
		displayWelcomeBar('show');

		var displayName = user.displayName;
		var email = user.email;
		var emailVerified = user.emailVerified;
		var photoURL = user.photoURL;
		var uid = user.uid;
		var providerData = user.providerData;
		user.getToken().then(function(accessToken) {

			document.getElementById('sign-in-status').textContent = 'Signed in';
			// document.getElementById('log-out').textContent = 'log out';
			var loginLink	= $$('a').filter(function(index, el) {
				return $$(this).hasClass('auth'); 
			})
			loginLink.remove();
			displayRatingHome(uid,page);

		});
		//Create Profile Table if does not exists
		createNewProfile(uid);

	} else {
		// User is signed out.
		document.getElementById('sign-in-status').textContent = 'Signed out';
		var loginLink = $$('div').filter(function(index, el) {
		return $$(this).hasClass('loginLink');
		})

		loginLink.html('Sign in');

		var timelineLink = $$('a').filter(function(index, el) {
			return $$(this).hasClass('timelineLink');
			})
		timelineLink.remove();

		logoutLink.remove();

		}
	},
	function(error) {
		console.log(error);
	});
};
//==============================End of authState Function=================================


// ============================================Generate Player List=============================
playerContent = function(sort) {

// var player_ref = database.ref('PlayerProfile/');

player_ref.orderByChild(sort).on("value", function(snapshot) {
	snapshot.forEach(function(player_snap) {
		var ratings = player_snap.child("rating").val();
		var players = player_snap.child("displayName").val();
		var matches = player_snap.child("matches").val();

		// Random image
		var picURL = './img/account_circle.svg';
		// Random song
		var player = players;
		// Random author
		var rating = ratings;

		var match = matches;
		// List item html
		var itemHTML = 	'<li class="item-content">' +
						'<div class="item-media"><img src="' + picURL + '" width="44"/></div>' +
						'<div class="item-inner">' +
						'<div class="item-title-row">' +
						'<div class="item-title">' + player + '</div>' +
						'</div>' +
						'<div class="item-subtitle">' + '|' + match + '|' + '	' + rating + '</div>' +
						'</div>' +
						'</li>';
		// Prepend new list element
		$$('.player-list').find('ul').prepend(itemHTML);
		// When loading done, we need to reset it

	});
});
};

function playerContentIndex(list_no, sort) {

// list_no = 100;
var player_ref = database.ref('PlayerProfile/');

player_ref.orderByChild(sort).limitToLast(list_no).on("value", function(snapshot) {
	snapshot.forEach(function(player_snap) {
		var ratings = player_snap.child("rating").val();
		var players = player_snap.child("displayName").val();
		var matches = player_snap.child("matches").val();

		// Random image
		var picURL = './img/account_circle.svg';
		// Random song
		var player = players;
		// Random author
		var rating = ratings;

		var match = matches;
		// List item html
		var itemHTML = '<li class="item-content">' +
						'<div class="item-media"><img src="' + picURL + '" width="44"/></div>' +
						'<div class="item-inner">' +
						'<div class="item-title-row">' +
						'<div class="item-title">' + player + '</div>' +
						'</div>' +
						'<div class="item-subtitle">' + '|' + match + '|' + '	' + rating + '</div>' +
						'</div>' +
						'</li>';
		// Prepend new list element
		$$('.player-list-index').find('ul').prepend(itemHTML);
	});
});
};

function displayWelcomeBar(status) {

var welcomeHTML=	'<div class="center card-header bg-green color-white">'+
					'<div class="left"></div>'+
					'<div class="center card-content ratingHome " style="font-size: 21px; font-weight: 100;"></div>'+
					'<div class="right"></div>'+
					'</div>';

	// Prepend new list element
	if (status=='show') {

		$$('.welcomeCard').html(welcomeHTML);
		$$('navTitle').html()

	}

	else if (status=='hide') {

		welcomeHTML ='';
		$$('.welcomeCard').html(welcomeHTML);
	}

}

function displayRatingHome(uid,page) {

var player_ref_uid = database.ref('PlayerProfile/'+uid);
	player_ref_uid.on("value", function(snapshot) {

	var	rating = snapshot.val().rating;
	var	matches = snapshot.val().matches;
	var displayName=snapshot.val().displayName;

	var name = $$('div').filter(function(index, el) {
		return $$(this).hasClass('navTitle');
	})
	name.html(displayName);
	// $$('navTitle').html(displayName);
	// console.log(displayName);

	var ratingHome = $$('div').filter(function(index, el) {
		return $$(this).hasClass('ratingHome');
	})
	ratingHome.html('|'+matches+'|'+' '+rating);
});
if (page =='timeline') {

}

}

function createNewProfile(uid) {
// var player_ref = database.ref('PlayerProfile/');
var player_ref = database.ref('PlayerProfile/');
player_ref.once('value', function(snapshot) {

	if (snapshot.hasChild(uid)) {

		console.log('exists');

	} // log.console('exists')
	// else if (snapshot.hasChild(displayName)) {

	// }
	else {
		var new_player_ref = database.ref('PlayerProfile/' + uid);
		PlayerProfile.set({
			rating: 1000,
			matches: 0,
			displayName: displayName
		});
		alert("Profle Created!");
	}
});

}

function loginRedirect() {

    myApp.modal({
    title:  'Your Not Logged In',
    text: 'Login to be able to add game scores',
    verticalButtons: true,
    buttons: [
      {
        text: 'Login',
        onClick: function() {
          mainView.router.loadPage('#login-screen');
        }
      },
      {
        text: 'Cancel',
        onClick: function() {
          mainView.router.loadPage('index.html');
        }
      },
    ]
  })

}


function gamesTimeline(name) {

var player_ref = database.ref('PlayerProfile/');

player_ref.orderByChild("displayName").equalTo(name).on("child_added", function(snapshot) {

	user_uid = snapshot.key;

	getGameData(user_uid);

}); 


function getGameData(user_uid) {
				
var myGamesRef = firebase.database().ref('Games/Game/').orderByChild('added_by').equalTo(user_uid);

	myGamesRef.on('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
		var childKey = childSnapshot.key;
		var childData = childSnapshot.val();
		var user_score = childSnapshot.val().user_score;
		var user_name =	childSnapshot.val().user_name;
		var user_uid = childSnapshot.val().added_by;
		var opponent_score = childSnapshot.val().opponent_score;
		var opponent_uid = childSnapshot.val().opponent_uid;
		var opponent_name = childSnapshot.val().opponent_name;
		var time_stamp = childSnapshot.val().date;
		var d = new Date(time_stamp).toUTCString().slice(0, -4);

		displayGameData(d,user_name,user_score,opponent_name,opponent_score);
		
		});
	});
}

}//End of gamesTimeline

function displayGameData(d,user_name,user_score,opponent_name,opponent_score) {

var timelineItem =	'<div class="timeline-item">'+
					'<div class="timeline-item-date">'+ '<small>'+'</small></div>'+
					'<div class="timeline-item-divider"></div>'+
					'<div class="timeline-item-content">'+
					'<div class="timeline-item-inner">'+

				    '<div class="timeline-item-time">'+d+'</div>'+
				    '<div class="timeline-item-subtitle">'+

				    '<div class="chip">'+
                    '<div class="chip-media bg-red">'+user_score+'</div>'+
                    '<div class="chip-label">'+user_name+'</div>'+
                    '</div>'+

				    // '<div class="timeline-item-text">vs</div>'+
				    '<div class="timeline-item-subtitle">'+

				    '<div class="chip">'+
                    '<div class="chip-media bg-bluegray">'+opponent_score+'</div>'+
                    '<div class="chip-label">'+opponent_name+'</div>'+
                    '</div>'+
				   
				    '</div>'+
					'</div>'+
					'</div>'+
					'</div>'

	$$('.timeline-loop').prepend(timelineItem);
}
(function() {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // If the value is negative...
    if (value < 0) {
      return -decimalAdjust(type, -value, exp);
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})();
