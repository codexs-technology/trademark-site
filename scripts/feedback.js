var FeedbackWindow;
var authorgroup, buffer;

// --------------------------------------------
//               validateEmail
// Validate if e-mail address
// Returns true if so (and also if could not be executed because of old browser)
// --------------------------------------------

function validateEmail  (valfield,   // element to be validated
                         infofield,  // id of element to receive info/error msg
                         required)   // true if required
{
  var stat = commonCheck (valfield, infofield, required);
  if (stat != proceed) return stat;

  var tfld = trim(valfield.value);  // value of field with whitespace trimmed off
  var email = /^[^@]+@[^@.]+\.[^@]*\w\w$/  ;
  if (!email.test(tfld)) {
    msg (infofield, "error", "ERROR: not a valid e-mail address");
    setfocus(valfield);
    return false;
  }

  var email2 = /^[A-Za-z][\w.-]+@\w[\w.-]+\.[\w.-]*[A-Za-z][A-Za-z]$/  ;
  if (!email2.test(tfld)) 
    msg (infofield, "warn", "Unusual e-mail address - check if correct");
  else
    msg (infofield, "warn", "");
  return true;
}


function Unload()
{
  if (FeedbackWindow)
  {     FeedbackWindow.close();}
}

function ShowFeedbackForm(group)
{
        authorgroup = group;
        var leftOffset = (screen.width - 528) / 2;
        var topOffset = (screen.height - 185) / 2;
        window.onunload = Unload;
        FeedbackWindow = window.open ("", "warning", 'location=no,toolbar=no,titlebar=no,scrollbars=no,resizable=no,menubar=no,Height=420,Width=650,top=' + topOffset + ',left=' + leftOffset);
        FeedbackWindow.focus();
        buffer = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>";
        buffer += "<HTML>";
        buffer += "<head>";
        buffer += "<title>USPTO WebSite Feedback Form</title>";
        buffer += "<style>.container {width:100%; height:100%;}</style>";
        buffer += "<link rel='stylesheet' href='/includes/c/validate.css' type='text/css' media='all' charset='utf-8' />";
        buffer += "<script type='text/javascript' src='/includes/j/ombudsman_validation.js'>";
        buffer += "</scr"+"ipt>";
        buffer += "<script type='text/javascript' src='/includes/j/refresh_session.js'>";
        buffer += "</scr"+"ipt>";
        buffer += "</head>";
        buffer += "<BODY bgcolor='#FFFFFF' onload='JavaScript:refreshSession();' >";
        buffer += "<table class='container'>";
        buffer += "<tr><td>";
        buffer += "<FORM name='form1' method='post' enctype='multipart/form-data' action='/cgi-bin/forms/maildata.pl'>";
        buffer += "<INPUT type='hidden' name='reference_id' id='reference_id' value='' >";
        buffer += "<INPUT type='hidden' name='form_number' id='form_number' value='7'>";
        buffer += "<STRONG>Have a comment about the Web page you were viewing?</STRONG>";
        buffer += "<BR><BR>Write your message below:";
        buffer += "<BR>";
        buffer += "<TEXTAREA name='feedback' cols='60' rows='10' id='feedback'></TEXTAREA>";
        buffer += "<BR><BR>";
        buffer += "</td></tr>";
        buffer += "<tr><td>";
        buffer += "If you would like a response, please enter a valid e-mail address:";
        buffer += "<BR><LABEL><STRONG>E-mail Address:  </STRONG></LABEL>";
        buffer += "<INPUT id='email' maxlength='35' size='35' type='text' name='Email' onchange=\"validateEmail(this, 'inf_email', false)\;\"><span id='inf_email'>&nbsp;</span>";
        buffer += "<BR>";
        buffer += "<BR>";
        buffer += "<i>For other assistance, please see our <a href='/about/contacts/index.jsp' target='new'>Contact Us</a> page</i>";
        buffer += "<INPUT name='location' type='hidden'>";
        buffer += "<INPUT name='section' id='section' type='hidden'>";
        buffer += "<P><INPUT type='submit' name='Submit' value='Submit'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<INPUT type='button' value='Cancel' onclick='window.close()'></P>";
        buffer += "<BR>";
        buffer += "</FORM>";
        buffer += "<script>var loc = window.location.href;";
        buffer += "document.form1.location.value = loc;";
        buffer += "var authorgroup='" + authorgroup + "';";
        buffer += "document.form1.section.value = authorgroup;";
        buffer += "</scr"+"ipt>";
        buffer += "<noscript> <p> This is a timed form and it requires JavaScript to reset the timer. Without JavaScript, you must complete this form in 30 minutes. </p> </noscript>";
        buffer += "</td></tr>";
        buffer += "</table>";
        buffer += "</BODY>";
        buffer += "</html>";

        FeedbackWindow.document.open();
        FeedbackWindow.document.write(buffer);
        FeedbackWindow.document.close();
}

