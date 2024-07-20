function sendEmail(email, username, oldCredits, newCredits, showToast) {
    const templateParams = {
        to_email: email,
        username: username,
        old_credits: oldCredits,
        new_credits: newCredits
    };

    //console.log('Sending email with params:', templateParams);

    // Commented out the email sending process
    // emailjs.send('service_60e25c6', 'template_kcu1xni', templateParams)
    //     .then(function(response) {
    //         console.log('Email sent successfully', response);
    //         showToast('Email sent successfully');
    //     })
    //     .catch(function(error) {
    //         console.error('Error sending email:', error);
    //         showToast('Error sending email: ' + error.text);
    //     });
}
