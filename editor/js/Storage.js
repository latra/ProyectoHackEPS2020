
function Storage() {
	var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

	if ( indexedDB === undefined ) {

		console.warn( 'Storage: IndexedDB not available.' );
		return { init: function () {}, get: function () {}, set: function () {}, clear: function () {} };

	}
	firebase.initializeApp({
		apiKey: 'AIzaSyCcuXRFBNLSlhl5dj77hWt-Rn8MXkYgrcg',
		authDomain: 'i-crossbar-296920.firebaseapp.com',
		projectId: 'i-crossbar-296920'
	});

	var firebasedb = firebase.firestore();

	var name = 'threejs-editor';
	var version = 1;

	var database;

	return {

		init: function ( callback ) {


			var request = indexedDB.open( name, version );
			request.onupgradeneeded = function ( event ) {

				var db = event.target.result;

				if ( db.objectStoreNames.contains( 'states' ) === false ) {

					db.createObjectStore( 'states' );

				}

			};


			request.onsuccess = function ( event ) {

				database = event.target.result;

				callback();

			};

			request.onerror = function ( event ) {

				console.error( 'IndexedDB', event );

			};


		},

		get: function ( callback ) {

			var docRef = firebasedb.collection("projects").doc("template");

			docRef.get().then(function(doc) {
				if (doc.exists) {
					console.log("Document data:", doc.data());
					var transaction = database.transaction( [ 'states' ], 'readwrite' );
					var objectStore = transaction.objectStore( 'states' );
					var request = objectStore.clear();
					request.onsuccess = function () {

						var transaction1 = database.transaction( [ 'states' ], 'readwrite' );
						var objectStore1 = transaction1.objectStore( 'states' );
						var request1 = objectStore1.put( doc.data().data, 0 );
						request1.onsuccess = function () {
							var transaction2 = database.transaction( [ 'states' ], 'readwrite' );
							var objectStore2 = transaction2.objectStore( 'states' );
							var request2 = objectStore2.get( 0 );
							request2.onsuccess = function ( event ) {
								firebasedb.collection("projects").doc("template")
									.onSnapshot(function(doc) {

										console.log("Updated data: ", doc.data());
										var start = performance.now();
										var transaction = database.transaction( [ 'states' ], 'readwrite' );
										var objectStore = transaction.objectStore( 'states' );
										var request = objectStore.put( doc.data().data, 0 );
										request.onsuccess = function () {

											console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Saved state to IndexedDB. ' + ( performance.now() - start ).toFixed( 2 ) + 'ms' );
											editor.clear();
											editor.fromJSON(doc.data().data);

										};
									});
								callback( event.target.result );

							};
						};
					};


				} else {

					// doc.data() will be undefined in this case
					console.log("No such document!");
					var transaction = database.transaction( [ 'states' ], 'readwrite' );
					var objectStore = transaction.objectStore( 'states' );
					var request = objectStore.get( 0 );
					request.onsuccess = function ( event ) {

						callback( event.target.result );

					};
				}
			}).catch(function(error) {
				console.log("Error getting document:", error);
			});





		},

		set: function ( data ) {

			var start = performance.now();
			var transaction = database.transaction( [ 'states' ], 'readwrite' );
			var objectStore = transaction.objectStore( 'states' );
			var request = objectStore.put( data, 0 );
			var file = firebasedb.collection("projects").doc("template");
			var docRef = firebasedb.collection("projects").doc("template");

			docRef.get().then(function(doc) {
				if (!doc.exists ||  doc.data().data.scene != data.scene) {
					file.set({
						data
					}, { merge: true });
					request.onsuccess = function () {

						console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Saved state to IndexedDB. ' + ( performance.now() - start ).toFixed( 2 ) + 'ms' );

					};
				}
			});


		},

		clear: function () {

			if ( database === undefined ) return;

			var transaction = database.transaction( [ 'states' ], 'readwrite' );
			var objectStore = transaction.objectStore( 'states' );
			var request = objectStore.clear();
			request.onsuccess = function () {

				console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Cleared IndexedDB.' );

			};

		}

	};

}

export { Storage };
