window.onload = loaded;

/**
 * AI Use: AI Assisted
 * @param {*} event Login event 
 */
function handleLogin(event) {
    //Prevent page reload
    event.preventDefault(); 
    
    // Retrieve values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log("Simulated Login Attempt:");
    console.log("Username:", username);
    console.log("Password:", password);

    //Perform the redirection
    window.location.href = 'PersonalWishlist.html'; 
}
