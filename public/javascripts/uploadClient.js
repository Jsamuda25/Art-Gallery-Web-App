/*
Function: verify()
 Purpose: ensures that no input fields are blank, if one or more are then an alert message is sent
      in: function has no parameters
  return: no return value
*/
function verify(){
    let title = document.getElementById("title");
    let author = document.getElementById("artist");
	let year = document.getElementById("year");
    let category = document.getElementById("category");
    let medium = document.getElementById("medium");
    let description = document.getElementById("description");
    let link = document.getElementById("link");
    if(title.value.length === 0 || title.value.length === 0 || (year.value).replace(/\s+/g,'') ==="" ||  (year.value).replace(/\s+/g,'') ==="" || author.value.length === 0 || (author.value).replace(/\s+/g,'') ==="" || category.value.length === 0 || (category.value).replace(/\s+/g,'') ==="" || medium.value.length === 0 || (medium.value).replace(/\s+/g,'') ==="" || description.value.length === 0 || (description.value).replace(/\s+/g,'') ==="" || link.value.length === 0 || (link.value).replace(/\s+/g,'') ===""){ 
		  alert("Missing input!");
    }
}
