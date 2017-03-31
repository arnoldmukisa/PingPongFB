// Initialize your app
var myApp = new Framework7({
	material: true,
	modalTitle: 'Table Tenis',
	// onPageInit: function(app, page) {
	// },
	// modalCloseByOutside:true,
	// pushState:true
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

var uiConfig = {
	credentialHelper: firebaseui.auth.CredentialHelper.NONE,
	signInSuccessUrl: 'index.html',
	signInOptions: [
		firebase.auth.EmailAuthProvider.PROVIDER_ID,
		firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		firebase.auth.FacebookAuthProvider.PROVIDER_ID,
		firebase.auth.TwitterAuthProvider.PROVIDER_ID
	],
	// Terms of service url.
	tosUrl: 'services.html'
};
// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

var database = firebase.database();
var user = firebase.auth().currentUser;

window.addEventListener('load', function() {
	playerContentIndex(3, 'rating');
	authState();

});

$$(document).on('page:init', function(e) {

	var page = e.detail.page;
	// Player Page
	if (page.name === 'index') {
		playerContentIndex(3, 'rating');
		authState();

	}
	if (page.name === 'players') {

		playerContent('rating');

	}
	if (page.name === 'login-screen') {
		// The start method will wait until the DOM is loaded.
		ui.start('#firebaseui-auth-container', uiConfig);
	}
	if (page.name === 'add-game') {
		loadAddGame();
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
	if (page.name === 'add-game') {
		loadAddGame();
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

});

$$('#log-out').on('click', function(e) {
	firebase.auth().signOut();
	// Sign-out successful.
	myApp.closePanel();
	// mainView.router.reloadPreviousPage('index.html');
	alert('sign out successful');
	// mainView.router.refreshPage();
	mainView.router.loadPage('index.html');
	$$("#log-out").hide();
	$$(".welcomeCard").children().hide();
	// mainView.router.reloadloadPage(ignoreCache = true, 'index.html');
});

// ===============================================End of Auth UI=====================================================

// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('about', function(page) {
	// run createContentPage func after link was clicked
	$$('.create-page').on('click', function() {
		createContentPage();
	});
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

			player_ref.once("value", function(snapshot) {
				snapshot.forEach(function(player_snap) {
					// var uid = player_snap.child("uid").val();
					var displayName = player_snap.child("displayName").val();

					if (displayName.toLowerCase().indexOf(query.toLowerCase()) >= 0)
						results.push(displayName);
					console.log(displayName);
				});
				render(results)
			});

		}
	});
	// End of Opponents Name field


	//Getting data from Form
	$$('.form-to-data').on('click', function() {

		//Current User Data
		var UserformData = myApp.formToData('#UserScoreForm'); // formData is an Object
		var user_uid = user.uid;
		var user_name = user.displayName;
		var user_score = parseInt(UserformData["UserScore"]);

		//Opponent Data
		var OpponentformData = myApp.formToData('#OpponentScoreForm');
		var opponent_name = OpponentformData["OpponentName"];
		var opponent_score = parseInt(OpponentformData["OpponentScore"]);

		var player_ref = database.ref('PlayerProfile/');
		player_ref.orderByChild("displayName").equalTo(opponent_name).on("child_added", function(snapshot) {
			opponent_uid = snapshot.key;
			opponent_rating = snapshot.val().rating;
			opponent_matches = snapshot.val().matches;

			pushGame();
		}); //End of player_ref opponent_uid

		// var opponentUser = {};

		if (!opponent_score || !user_score || !opponent_name) {
			myApp.alert('field is empty...');
			return;
		}

		var winner_score, winner_uid, winner_name, winner_rating;
		var loser_score, loser_uid, loser_name, loser_rating;

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
			var Game = Games.child('Game')
			Game.push({
				// date: firebase.database.ServerValue.TIMESTAMP,
				loser: {
					// new_rating: new_loser_rating,
					score: loser_score,
					uid: loser_uid,
					username: loser_name
				},
				winner: {
					// new_rating: new_winner_rating,
					score: winner_score,
					uid: winner_uid,
					username: winner_name
				}
			})

			updateMatches(user_uid);
			updateMatches(opponent_uid);

			alert("Game Added!!");
			mainView.router.loadPage('index.html');

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

					new_winner_rating = (winner_rating + changeInRating + pointsAwarded);
					console.log('old winner rating  ' + winner_rating + ' updated winner rating ' + new_winner_rating);

					new_loser_rating = (loser_rating - changeInRating);
					console.log('old loser rating  ' + loser_rating + 'updated loser rating ' + new_loser_rating);

					myApp.alert('Your New Rating is :' + new_winner_rating);

				} else if (winner_rating == loser_rating) {
					pointsAwarded = (points / 10);
					console.log(' 2 pointsAwarded  ' + pointsAwarded);

					new_winner_rating = (winner_rating + pointsAwarded);
					new_loser_rating = (loser_rating - pointsAwarded);
					myApp.alert(new_winner_rating + ':Same Rating Players' + new_loser_rating);

				} else {
					myApp.alert('Something is wrong')
				}

				var updates = {};
				updates['PlayerProfile/' + loser_uid + '/rating'] = new_loser_rating;
				updates['PlayerProfile/' + winner_uid + '/rating'] = new_winner_rating;
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

	});
	// ==========End of Add Score================

	// ==========Get Profiles====================

	var user = firebase.auth().currentUser;
	var name, email, photoUrl, uid, emailVerified;

	if (user != null) {

		name = user.displayName;

		$$('.welcomeName').html('Hi' + ' ' + name);


	} else {
		$$('.welcomeName').html('No account');

	}

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
authState = function() {
	firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				// User is signed in.
				var displayName = user.displayName;
				var email = user.email;
				var emailVerified = user.emailVerified;
				var photoURL = user.photoURL;
				var uid = user.uid;
				var providerData = user.providerData;
				user.getToken().then(function(accessToken) {
					document.getElementById('sign-in-status').textContent = 'Signed in';
					document.getElementById('log-out').textContent = 'log out';
					// document.getElementById('login-screen').textContent = 'Sign out';
					var authLink = $$('a').filter(function(index, el) {
						return $$(this).hasClass('auth');
					})
					authLink.remove();

					$$('.welcomeCard').children().show();

					var welcomeHome = $$('div').filter(function(index, el) {
						return $$(this).hasClass('welcomeHome');
					})
					welcomeHome.html(' ' + displayName);

					var ratingHome = $$('div').filter(function(index, el) {
						return $$(this).hasClass('ratingHome');
					})
					ratingHome.html(' ' + '|0| 1000');

				});
				console.log(displayName); // for dev purposes
				//Create Profile Table if does not exists
				var PlayerProfile = database.ref('PlayerProfile/');
				PlayerProfile.once('value', function(snapshot) {
					if (snapshot.hasChild(uid)) {} // log.console('exists')
					else {
						var PlayerProfile = database.ref('PlayerProfile/' + uid);
						PlayerProfile.set({
							rating: 1000,
							matches: 0,
							displayName: displayName
						});
						alert("Profle Created!");
					}
				});
			} else {
				// User is signed out.
				document.getElementById('sign-in-status').textContent = 'Signed out';
				// var signInStatus = $$('span').filter(function(index, el) {
				// 	return $$(this).hasClass('sign-in-status');
				// })
				// signInStatus.html('Sign in');
				// document.getElementById('login-screen').textContent = 'Sign in';
				// document.getElementById('account-details').textContent = 'null';
				var loginLink = $$('div').filter(function(index, el) {
					return $$(this).hasClass('loginLink');
				})
				loginLink.html('Sign in');

				var welcomeCard = $$('div').filter(function(index, el) {
					return $$(this).hasClass('welcomeCard');
				})
				welcomeCard.remove();
			}
		},
		function(error) {
			console.log(error);
		});
};
//==============================End of authState Function=================================


// ============================================Generate Player List=============================
playerContent = function(sort) {

	// list_no = 100;
	var player_ref = database.ref('PlayerProfile/');

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
			$$('.player-list').find('ul').prepend(itemHTML);
			// When loading done, we need to reset it

		});
	});
};
playerContentIndex = function(list_no, sort) {

	// list_no = 100;
	var player_ref = database.ref('PlayerProfile/');

	player_ref.orderByChild(sort).limitToLast(list_no).once("value", function(snapshot) {
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
