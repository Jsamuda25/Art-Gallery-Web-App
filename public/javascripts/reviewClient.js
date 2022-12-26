/*
Function: verify()
 Purpose: ensures that no input fields are blank, if one or more are then an alert message is sent
      in: function has no parameters
  return: no return value
*/
function verify(){
    let review = document.getElementById("review");
    if(review.value.length === 0 || (review.value).replace(/\s+/g,'') ===""){ 
		  alert("Missing input!");
    }
}


