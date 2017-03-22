// Initialize your app
var myApp = new Framework7({
	material: true,
	modalCloseByOutside:true,
	// pushState:true
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

// Export selectors engine
var $$ = Dom7;
// Add view
var mainView = myApp.addView('.view-main', {
	domCache:true //enable inline pages

});
window.addEventListener('load', function() {
		playerContent(3);
		authState();
	});

$$(document).on('page:init', function (e) {

	var page = e.detail.page;
	// Player Page
	if (page.name === 'players') {

		playerContent(1000);

	}
	if (page.name === 'login-screen') {

		var uiConfig = {
			credentialHelper:firebaseui.auth.CredentialHelper.NONE,
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
		// The start method will wait until the DOM is loaded.
		ui.start('#firebaseui-auth-container', uiConfig);

	}

})


	// ===============================================End of Auth UI=====================================================

	// Callbacks to run specific code for specific pages, for example for About page:
	myApp.onPageInit('about', function (page) {
		// run createContentPage func after link was clicked
		$$('.create-page').on('click', function () {
			createContentPage();
		});
	});



	// =================Add Game Page=====================
	myApp.onPageInit('AddGame', function (page) {


// Populating Opponents Name Field
	var autocompleteDropdownAll = myApp.autocomplete({
		input: '#autocomplete-dropdown-all',
		openIn: 'dropdown',
		source: function (autocomplete, query, render) {

	var results=[];
	var player_ref = database.ref('PlayerProfile/');

		player_ref.once("value", function(snapshot) {
		snapshot.forEach(function(player_snap) {
			var uid = player_snap.child("uid").val();
			var displayName = player_snap.child("displayName").val();

        if (displayName.toLowerCase().indexOf(query.toLowerCase()) >= 0)
			results.push(displayName);
		});
		});
		render(results)

		}
	});
// End of Opponents Name field

		//Getting data from Form
		$$('.form-to-data').on('click', function(){

			var user = firebase.auth().currentUser;
			// var database = firebase.database();



			//Current User Data
			var UserformData = myApp.formToData('#UserScoreForm');// formData is an Object
			var user_uid=user.uid;
			var displayName= user.displayName;
			var user_score= UserformData["UserScore"];

			//Opponent Data
			var OpponentformData = myApp.formToData('#OpponentScoreForm');
			var opponent_name= OpponentformData["OpponentName"];
			var opponent_uid= "uid";
			var opponent_score= OpponentformData["OpponentScore"];

			//var pointsAwarded="8";
			//var pointsDeducted="8";

			var date = new Date();

			var Games = database.ref('Games/');
			var Game= Games.child('Game')
			Game.push({
				date:date,
				loser:{
					new_rating:1000,
					score:opponent_score,
					uid:opponent_uid,
					username:opponent_name
				},
				winner:{
					new_rating:1000,
					score:user_score,
					uid:user_uid,
					username:displayName
				}
			})
			alert("Game Added!!");

			mainView.router.loadPage('index.html');

		});
// ==========End of Add Score============

		// ============Auth Status===============
		// =======================================Get Profiles========================================

		// var ref = database.ref('PlayerProfile/');
		//
		// 	ref.on("value", function(snapshot)
		// 	{
		// 		var profile = snapshot.val();
		//
		// 	}, function (error) {
		// 		 console.log("Error: " + error.code);
		// 	});
		// 	ref.orderByChild("displayName").on("child_added", function(data) {
		//
		//
		// });

		// ===========Get Rating============
		// var PlayerProfile = database.ref('PlayerProfile/');
		// var rating= PlayerProfile.child('rating')
		// PlayerProfile.once('value', function(snapshot) {
		// 	if (snapshot.hasChild(uid))
		//End of Get Rating php

		var user = firebase.auth().currentUser;
		var name, email, photoUrl, uid, emailVerified;

		if(user !=null){

			name=user.displayName;

			$$('#welcomeName').html('Hi'+' '+name);

		}else{
			$$('#welcomeName').html('No account');

		}

	});
	// ==========End of Add Page Init==================



	// ===============Log Out======================
	//var signOut = firebase.auth().signOut();


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
		if (user)
		{
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
				document.getElementById('auth').textContent = 'Sign out';
				var authLink = $$('a').filter(function(index, el) {
									return $$(this).hasClass('auth');
							})
				authLink.toggleClass('sign-in')
				authLink.removeAttr('href')

				document.getElementById('account-details').textContent = JSON.stringify({
					displayName: displayName,
					email: email,
					emailVerified: emailVerified,
					photoURL: photoURL,
					uid: uid,
					accessToken: accessToken,
					providerData: providerData
				}, null, '  ');
			});
			console.log(displayName); // for dev purposes
			//Create Profile Table if does not exists
			var PlayerProfile = database.ref('PlayerProfile/');
			PlayerProfile.once('value', function (snapshot)
			{
					if (snapshot.hasChild(uid))
					{}// log.console('exists')
					else
					{
					var PlayerProfile = database.ref('PlayerProfile/'+uid);
					PlayerProfile.set(
					{
						rating:1000,
						matches:'1',
						displayName:displayName
					});
					alert("Profle Created!");
					}
				});
			}
			else
			{
				// User is signed out.
				document.getElementById('sign-in-status').textContent = 'Signed out';
				document.getElementById('auth').textContent = 'Sign in';
				//$$('sign-in').removeAttr(href);
				//$$('sign-in').addClass('log-out');
				document.getElementById('account-details').textContent = 'null';
			}
		}, function(error) {
			console.log(error);
		});
	};
//==============================End of authState Function=================================
$$('#log-out').on('click', function() {
	firebase.auth().signOut();
	// Sign-out successful.
	alert('sign out successful');
	mainView.router.loadPage('index.html');

});

// ============================================Generate Player List=============================
playerContent = function (list_no) {

		// list_no = 100;
		var player_ref = database.ref('PlayerProfile/');

		player_ref.orderByChild("rating").limitToFirst(list_no).once("value", function(snapshot) {
		snapshot.forEach(function(player_snap) {
			var ratings = player_snap.child("rating").val();
			var players = player_snap.child("displayName").val();

				 // Random image
				 var picURL = './img/account_circle.svg';
				 // Random song
				 var player = players;
				 // Random author
				 var rating = ratings;
				 // List item html
				 var itemHTML = '<li class="item-content">' +
													 '<div class="item-media"><img src="' + picURL + '" width="44"/></div>' +
													 '<div class="item-inner">' +
														 '<div class="item-title-row">' +
															 '<div class="item-title">' + player + '</div>' +
														 '</div>' +
														 '<div class="item-subtitle">' + rating + '</div>' +
													 '</div>' +
												 '</li>';
				 // Prepend new list element
					$$('.player-list').find('ul').prepend(itemHTML);
			 // When loading done, we need to reset it

		});
		});


};
