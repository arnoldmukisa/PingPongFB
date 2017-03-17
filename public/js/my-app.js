// Initialize your app
var myApp = new Framework7({
	material: true
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

// ============================================Auth UI====================================================

myApp.onPageInit('login-screen', function (page) {

	// FirebaseUI config.
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

});

initApp = function() {
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
				document.getElementById('sign-in').textContent = 'Sign out';
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


			//Creating Profile for new User
			var PlayerProfile = database.ref('PlayerProfile/');
			PlayerProfile.once('value', function(snapshot) {
				if (snapshot.hasChild(uid))
				{
					// alert('exists');
				}
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
			else {
				// User is signed out.
				document.getElementById('sign-in-status').textContent = 'Signed out';
				document.getElementById('sign-in').textContent = 'Sign in';
				//$$('sign-in').removeAttr(href);
				//$$('sign-in').addClass('log-out');
				document.getElementById('account-details').textContent = 'null';
			}
		}, function(error) {
			console.log(error);
		});
	};
	window.addEventListener('load', function() {
		initApp()
	});

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

		// Opponet data array
		// var SecondPlayer = ('PlayerOne PlayerTwo PlayerThree PlayerFour PlayerFive').split(' ');
		// for(var displayName in SecondPlayer){
	  //   alert(displayName + ': ' + SecondPlayer[displayName]);
		// 	}



		var player_ref = firebase.database().ref('PlayerProfile/');

		player_ref.once("value", function(snapshot) {
		var data = snapshot.forEach(function(player_snap) {

			// var key = player_snap.key();
			var uid = player_snap.child("uid").val();
			var displayName = player_snap.child("displayName").val();

				console.log(displayName);
				// results=[displayName];

						var autocompleteDropdownAll = myApp.autocomplete({
							input: '#autocomplete-dropdown-all',
							openIn: 'dropdown',
							source: function (autocomplete, query, render) {

								// Find matched items



								// results = [displayName];
								// for (var i = 0; i < SecondPlayer.length; i++)
								// {
								// 	if (SecondPlayer[i].toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(SecondPlayer[i]);
								// }
								// Render items by passing array with result items


								for (var i = 0; i < displayName.length; i++)
								{
									// if (displayName[i].toLowerCase().indexOf(query.toLowerCase()) >= 0) displayName.push(displayName[i]);
								}
								// Render items by passing array with result items
								render(displayName);
							}
						});

});
});

		//Getting data from Form
		$$('.form-to-data').on('click', function(){

			var user = firebase.auth().currentUser;
			// var name, email, photoUrl, uid, emailVerified;

			// if(user !=null){

			var uid=user.uid;
			var username= user.username;

			//$$('#welcomeName').html('Hi'+' '+name);
			// }else{
			// 	$$('#welcomeName').html('No account');
			// 	myApp.alert(' Sign In ');
			//
			// }
			var database = firebase.database();

			var UserformData = myApp.formToData('#UserScoreForm');// formData is an Object
			var OpponentformData = myApp.formToData('#OpponentScoreForm');

			var user_score= UserformData["UserScore"];
			var opponent_name= OpponentformData["OpponentName"];
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
					uid:"Opponrts Uid",
					username:opponent_name
				},
				winner:{
					new_rating:1000,
					score:opponent_score,
					uid:"opponent_uid",
					username:opponent_name
				}
			})
			alert("Game Added!!");
			mainView.router.load(index)

		});
		// ==========End of Add Score============

		// ============Auth Status===============
		// =======================================Get Profiles========================================

		var ref = firebase.database().ref('PlayerProfile/');

			ref.on("value", function(snapshot)
			{
				var profile = snapshot.val();

				// console.log(profile);

			}, function (error) {
			   console.log("Error: " + error.code);
			});
			ref.orderByChild("displayName").on("child_added", function(data) {
   	// 	console.log(data.val().displayName);
});

		// ===========Get Rating============
		// var PlayerProfile = database.ref('PlayerProfile/');
		// var rating= PlayerProfile.child('rating')
		// PlayerProfile.once('value', function(snapshot) {
		// 	if (snapshot.hasChild(uid))



		//     $$.ajax({
		//       type: "POST",
		//       url: 'Read_controller/read_rating',
		//       data: {username:'amukisa'},
		//       //async: false,
		//       dataType: JSON,
		//       success: function (data) {
		//
		//         //JSON.stringify(data);
		//
		//         var rate =  data;
		//
		//         $$('.score').html(rate);
		//         console.log(data[0][0].rating);
		//       }
		//
		// });
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

	$$('#log-out').on('click', function() {

		firebase.auth().signOut();
		// Sign-out successful.
		alert('sign out successful');
		mainView.router.loadPage('index.html');

	});

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
