/*
Function: like()
 Purpose: when the like button is clicked, send the post's information to server so that appropriate updates can be made
      in: function has no parameters
  return: no return value
*/

function like(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange=function(){
        if(this.readyState == 4 && this.status== 200){
            let responseObj = (this.responseText);
            window.location.reload();
        }
    }
    xhttp.open("GET","/user/liked/"+ event.target.id);
    xhttp.setRequestHeader("Content-Type", "text/plain");
    xhttp.send();
}

/*
Function: deleteReview()
 Purpose: when the delete button is clicked, send the review's information to server so that appropriate updates can be made
      in: function has no parameters
  return: no return value
*/

function deleteReview(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange=function(){
        if(this.readyState == 4 && this.status== 200){
            let responseObj = (this.responseText);
            window.location.reload();
        }
    }

    xhttp.open("DELETE","/user/delete/"+ event.target.id);
    xhttp.setRequestHeader("Content-Type", "text/plain");
    xhttp.send();
}