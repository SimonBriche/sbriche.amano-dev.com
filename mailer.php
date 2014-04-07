<?php 
    header('Content-Type: application/json');

    $error = "0";

    // check if fields passed are empty 

    if(empty($_POST['nom'])   ||    
    empty($_POST['prenom'])  ||
    empty($_POST['email'])  ||
    empty($_POST['message']))   
    { 
        $error = "args_missing";
    } 

    if($error == "0"){
        $nom = $_POST['nom']; 
        $prenom = $_POST['prenom']; 
        $email = $_POST['email']; 
        $message = stripslashes($_POST["message"]);      
    }

    if($error == "0"){
        if(!verifMail($email)){
             $error = "email_incorrect";   
        }
    }

    if($error == "0"){
        // create email body and send it    
        $to = 'briche.simon@gmail.com'; 
        // put your email 
        $email_subject = "Contact via sbriche.free.fr:  $nom $prenom"; 
		$email_body = "Nouveau message via sbriche.free.fr. \n\n".                 
                       "Message de :\n\nNom: $nom \nPrénom: $prenom \n".                  
                       "Email: $email\n\n\n Message : \n $message";
        $headers = "From: $email\n"; 
        $headers .= "Reply-To: $email";

        if(!mail($to,$email_subject,$email_body,$headers)){
            $error = "unexpected";
        }
    }

    echo '{"error":"'.$error.'"}';

    function verifMail($mail) 
    {
        if (preg_match ('/^[a-zA-Z0-9_]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$]/i', $mail ) ) {
            return false;
        }
        list ($nom, $domaine) = explode ('@', $mail);
        if (getmxrr ($domaine, $mxhosts))  {
            return true;
        } else {
            return false;
        } 
    }
?>