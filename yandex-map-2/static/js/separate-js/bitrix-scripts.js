$(document).ready(function () {
    $('#newsList').on('change', function () {
        var url = $(this).val();

        location.href=''+ url +'';
    });

    $('#callBack, #consultForm, #contactForm, #calculator, #feedback, #placeForm').on('submit', function (event) {

        event.preventDefault();
        var id = $(this).closest("form").attr('id');
        getAjax('#' + id);
        return false;
    });
});

function getAjax(formId) {

    $('.success').empty();
    var data = $(formId).serialize();
    $.ajax({
        type: 'POST',
        data: {
            data: data,
            modeJs: 'Y'
        },
        dataType: 'json',
        success: function (result) {
            if (result.status == true) {
                $(' .success-form').empty().append(result.message);
		yaCounter20844181.reachGoal(''+result.yaCounter+'');
		ga('send', 'event', 'sendform', 'send', ''+result.ga+'');
		roistat.event.send(''+result.roistat+'');
                if (result.reload == true) window.location.href = "/";
            } else {
                $('.error-form').empty().append(result.message);
            }
        }
    });
}