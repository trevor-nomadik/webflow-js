document.addEventListener('DOMContentLoaded', function() {
    // Initialize the Auth0 client
    const auth0 = new Auth0Client({
      domain: 'dev-oxu1mjqlqdkb8h1l.us.auth0.com',
      client_id: 'LNtA6Fn3VpVyKikh3CcxrF9xqRN93hyy',
      redirect_uri: window.location.origin,
      scope: 'openid profile email' 
    });
  
    // Check if the user is authenticated
    auth0.isAuthenticated().then(function(isAuthenticated) {
      if (isAuthenticated) {
        // User is logged in, get the user profile
        auth0.getUser().then(function(user) {
          // Display user's name and profile picture
          if(user) {
            // Check and display user's name
            const userNameElement = document.getElementById('auth-name');
            if(userNameElement) {
              userNameElement.textContent = user.name || 'No Name Provided';
            }

            // Check and display user's email
            const userEmailElement = document.getElementById('auth-email');
            if(userEmailElement) {
                userEmailElement.textContent = user.email || 'No Email Provided';
            }
  
            // Check and display user's profile picture
            const userPictureElement = document.getElementById('auth-profile-picture');
            if(userPictureElement) {
              userPictureElement.src = user.picture || 'path/to/default/image.png'; // Provide a default image path if needed
            }
          }
        });
      } else {
        // User is not logged in, redirect or handle accordingly
        console.info('User not authenticated');
        window.location.href = '/'; // Redirect to home page
      }
    }).catch(function(err) {
      console.error('Authentication check failed:', err);
    });
  });