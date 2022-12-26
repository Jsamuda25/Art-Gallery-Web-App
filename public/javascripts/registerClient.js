/*
Function: verify()
 Purpose: ensures that no input fields are blank, if one or more are then an alert message is sent
      in: function has no parameters
  return: no return value
*/
function verify(){
    let username = document.getElementById("username");
	  let password = document.getElementById("password");
    if(username.value.length === 0 || password.value.length === 0 || (username.value).replace(/\s+/g,'') ==="" ||  (password.value).replace(/\s+/g,'') ==="" ){ 
		  alert("Missing input!");
    }
}
