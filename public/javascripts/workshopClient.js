/*
Function: verify()
 Purpose: ensures that no input fields are blank, if one or more are then an alert message is sent
      in: function has no parameters
  return: no return value
*/
function verify(){
    let review = document.getElementById("workshop");
    if(review.value.length === 0 || (review.value).replace(/\s+/g,'') ===""){ 
		  alert("Missing input!");
    }
}

/*
Function: enroll()
 Purpose: when the enroll button is clicked, send the workshop's information to server and then make appropraite updates
      in: function has no parameters
  return: no return value
*/
function enroll(){
    alert("Succesfully enrolled!");

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange=function(){
        if(this.readyState == 4 && this.status== 200){
            let responseObj = (this.responseText);
            window.location.reload();

        }
    }
    xhttp.open("PUT","/user/enroll/"+ event.target.id);
    xhttp.setRequestHeader("Content-Type", "text/plain");
    xhttp.send();

}

