var twitch = window.Twitch.ext;
var token = "";
var channelId = "";
var api = '';

twitch.onAuthorized(function(auth) {
    token = auth.token;
    channelId = auth.channelId;
    checkStatus();
    $('#submitChar').show();
});

/*
    Check whether this channel id already has a name assigned
*/
function checkStatus() {

    $.ajax({
            url: api + 'checkStatus',
            type: 'GET',
            headers: {
                'Authorization': 'podArmory_' + token
            },
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json'
        })
        .done(function(data) {

            // if char already available update name
            if (data.status == 200) {
                $('#currentAccname').html(data.payload);
                return;
            }

            // no char for given channel id found
            $('#currentAccname').html("n / a");
            return;

        })
        .fail(function(xhr, status, error) {
            $('.message--text').html('Server error.<br>Contact support if this error persists.');
            $('#message').addClass('message--state-error').stop().fadeToggle();
        })
}


function setName(name) {

    $('.pod-live-conf-body-content').hide();
    $('#loader').stop().fadeToggle();

    $.ajax({
            url: api + 'setName',
            type: 'POST',
            // contentType: 'application/json; charset=UTF-8',
            headers: {
                'Authorization': 'podArmory_' + token
            },
            dataType: 'json',
            data: {
                accname: name
            }
        })
        .done(function(data) {

            // char exists and was successfuly set
            if (data.status == 200) {
                $('.message--text').html('Successfuly set "' + data.payload + '" as character.');
                $('#message').addClass('message--state-success').stop().fadeToggle();
                $('#currentAccname').html(data.payload);
                return;
            }

            // no char with given name was found
            $('.message--text').html('Failed to get last character for account "' + data.payload + '". <br> No such character found.');
            $('#message').addClass('message--state-error').stop().fadeToggle();
            return;

        })
        .fail(function(xhr, status, error) {
            $('.message--text').html('Server error: Failed to set character. Contact support if this error persists.');
            $('#message').addClass('message--state-error').stop().fadeToggle();
        })
        .always(function() {
            $('#loader').hide();
            $('.pod-live-conf-body-content').stop().fadeToggle();
        });;

};

$(function() {

    $('.message--close').on('click', function() {
        $(this).parent().hide();
    });

    $('#submitChar').on('click', function() {

        // reset message container
        $('#message').removeClass('message--state-error message--state-success').hide();

        // throw error on empty values
        var nameVal = $('#podAccname').val();
        if (!nameVal) {
            $('.message--text').html('Set a name!');
            $('#message').addClass('message--state-error').stop().fadeToggle();
            return;
        }

        // proceed with ajax call
        setName(nameVal);

    });

});