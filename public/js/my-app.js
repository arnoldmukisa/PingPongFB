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


// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
	domCache:true //enable inline pages
});

/* ===== Login screen page events ===== */
// myApp.onPageInit('login-screen-embedded', function (page) {
//     $$(page.container).find('.button').on('click', function () {
//         var username = $$(page.container).find('input[name="username"]').val();
//         var password = $$(page.container).find('input[name="password"]').val();
//         myApp.alert('Username: ' + username + ', password: ' + password, function () {
//             mainView.router.back();
//         });
//     });
// });



// $$('.login-screen').find('.button').on('click', function () {
//   const username = $$('.login-screen').find('input[name="username"]').val();
//   const password = $$('.login-screen').find('input[name="password"]').val();
//   const auth= firebase.auth();
//
//   const promise = auth.signInWithEmailAndPassword(username, password);
//   promise.catch(e => console.log(e.message));
//
//   myApp.alert('Username: ' + username + ', password: ' + password, function () {
//     myApp.closeModal('.login-screen');
//   });
// });
//
// $$('.login-screen').find('.signup').on('click', function () {
//   const username = $$('.login-screen').find('input[name="username"]').val();
//   const password = $$('.login-screen').find('input[name="password"]').val();
//   const auth= firebase.auth();
//
//   const promise = auth.createUserWithEmailAndPassword(username, password);
//   promise.catch(e => console.log(e.message));
//
//   myApp.alert('Username: ' + username + ', password: ' + password, function () {
//     myApp.closeModal('.login-screen');
//   });
// });
// //Add Real time listener// Handle account status
// firebase.auth().onAuthStateChanged(firebaseUser=>{
//     if(firebaseUser){
//     console.log(firebaseUser);
//     // window.location = 'index.html';
//       $$('.score').html(firebaseUser);
//     }
//     else{
//     console.log("not logged in");
//     }
// })
// ============End of login screen=============



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
	var SecondPlayer = ('PlayerOne PlayerTwo PlayerThree PlayerFour PlayerFive').split(' ');

	var autocompleteDropdownAll = myApp.autocomplete({
		input: '#autocomplete-dropdown-all',
		openIn: 'dropdown',
		source: function (autocomplete, query, render) {
			var results = [];
			// Find matched items
			for (var i = 0; i < SecondPlayer.length; i++) {
				if (SecondPlayer[i].toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(SecondPlayer[i]);
			}
			// Render items by passing array with result items
			render(results);
		}
	});


	//Getting data from Form
	$$('.form-to-data').on('click', function(){

		var UserformData = myApp.formToData('#UserScoreForm');// formData is an Object
		var OpponentformData = myApp.formToData('#OpponentScoreForm');

		var UserScore= UserformData["UserScore"];
		var OpponentName= OpponentformData["OpponentName"];
		var OpponentScore= OpponentformData["OpponentScore"];
		var date= OpponentformData["date"];
		var pointsAwarded="8";
		var pointsDeducted="8";


		// ==========Add Scores============
		// $$.ajax({
		//     type: 'POST',
		//     url: 'Write_controller/form_helper',
		//     dataType: "html",
		//     data: {
		//       //php var : Form Value/Name
		//       UserScore: UserScore,
		//       OpponentName:OpponentName,
		//       OpponentScore: OpponentScore,
		//       date:date,
		//       pointsAwarded:pointsAwarded,
		//       pointsDeducted:pointsDeducted
		//
		//             },
		//     success: function() {
		//             mainView.router.loadPage('index.php');
		//             //mainView.router.back();
		//             alert("You Have Gained"+JSON.stringify(pointsAwarded)+"Points");
		//             //onDataReceived(data); //this is a function that contains the flot code
		//     }
		// });
		// End of Add Scores php

	});
	// ==========End of Add Score============

// ============Auth Status===============

	// ===========Get Rating============

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

// =============Auth UI============================

myApp.onPageInit('login-screen', function (page) {
    
// FirebaseUI config.
			var uiConfig = {
				credentialHelper:firebaseui.auth.CredentialHelper.NONE,
				signInSuccessUrl: 'index.html',
				signInOptions: [
					// Leave the lines as is for the providers you want to offer your users.
					firebase.auth.EmailAuthProvider.PROVIDER_ID,
					firebase.auth.GoogleAuthProvider.PROVIDER_ID,
					firebase.auth.FacebookAuthProvider.PROVIDER_ID,
					firebase.auth.TwitterAuthProvider.PROVIDER_ID
					//firebase.auth.GithubAuthProvider.PROVIDER_ID
					
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
						console.log(displayName);
						// alert(displayName);
						// $('.score').html(displayName);
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

// ================End of Auth UI==================

// ===============Log Out======================
//var signOut = firebase.auth().signOut();

$$('#log-out').on('click', function() {

	firebase.auth().signOut();
  // Sign-out successful.
  alert('sign out successful');
  mainView.router.loadPage('index.php');

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
