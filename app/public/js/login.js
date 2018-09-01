const emailField = document.querySelector('#email_input');
const passwordField = document.querySelector('#password_input');
const loginButton = document.querySelector('#loginButton');

let userPasswordInput = '';
let userEmailInput = '';

function getDetails() {
    userPasswordInput = emailField.Value;
    userEmailInput = emailField.Value;
}   

loginButton.onClick = getDetails();

