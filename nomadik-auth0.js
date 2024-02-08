const auth0 = new Auth0Client({
    domain: 'dev-oxu1mjqlqdkb8h1l.us.auth0.com',
    client_id: 'LNtA6Fn3VpVyKikh3CcxrF9xqRN93hyy',
    redirect_uri: window.location.origin,
    scope: 'openid profile email',
    cacheLocation: 'localstorage',
  });

// Function to run when the page loads to handle the authentication result
window.onload = async () => {
    // Check if the user is returning from Auth0 with authentication result
    try {
        await auth0.handleRedirectCallback();
        updateUI(); // A custom function to update UI based on login state
        window.history.replaceState({}, document.title, "/"); // Clean up the URL
    } catch (err) {
        console.error("Error handling redirect callback: ", err);
    }
};
  
// Function to dynamically login or logout based on the current state
const toggleAuth = async () => {
    const isAuthenticated = await auth0.isAuthenticated();
    if (isAuthenticated) {
        logout();
    } else {
        login();
    }
};

// Login function
const login = async () => {
    await auth0.loginWithRedirect();
};

// Logout function
const logout = () => {
    auth0.logout({
        returnTo: window.location.origin,
    });
};

// Function to update UI based on the user's authentication status
const updateUI = async () => {
    const isAuthenticated = await auth0.isAuthenticated();
    const btn = document.getElementById('auth-button'); 
    const profileLink = document.getElementById('profile-link');

    if (isAuthenticated) {
        btn.innerText = 'Logout';
        profileLink.style.display = 'block';
    } else {
        btn.innerText = 'Login';
        profileLink.style.display = 'none';
    }
};

// Attach the toggle function to the button
document.getElementById('auth-button').addEventListener('click', toggleAuth);

// Initially update UI based on the user's authentication status
updateUI();