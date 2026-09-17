//This function includes necessary js files for the application
// URL = https://prod-cicm.uspto.gov/gitlab/wwwusptogov/infrastructure/-/tree/develop/web-cms-common/var/www/ais/html/includes/j/ 


function include(file)
{
  var script  = document.createElement('script');
  script.src  = file;
  script.type = 'text/javascript';
  script.defer = true;
 
  document.getElementsByTagName('head').item(0).appendChild(script);
}
 

/* include any js files here */
// include('/includes/j/searchusa.js'); - searchusa not in use, so commented this line


if( window.location.hostname.toLowerCase() == "www.uspto.gov" ) 
{
	include('https://components.uspto.gov/js/ais/12-www.js');
	
}
