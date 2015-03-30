jQuery(document).ready(function () {

    /***** DATE DROPPER *****/
    /************************/
    jQuery('input[name=alert_date_from]').dateDropper({lock: 'to', lang: 'fr', color: '#ffcc00'});
    jQuery('input[name=alert_date_to]').dateDropper({lock: 'from', lang: 'fr', color: '#ffcc00'});

    /***** FOCUS EFFECT *****/
    /************************/
    jQuery('#searchbox_form input, #searchbox_form select')
            .focusin(function () {
                jQuery('.sb-home-modal').addClass('active');
            })
            .focusout(function () {
                jQuery('.sb-home-modal').removeClass('active');
                jQuery('.dd_').removeClass('dd_fadein');
            });

    /***** SUBMIT FORM *****/
    /***********************/
    jQuery('body').on('click', '#submit_search', function (e) {
        e.preventDefault();

        if (jQuery(this).hasClass('disabled')) {
            return false;
        }

        if (!jQuery('#searchbox_form').valid())
            return false;

        var urlOpts = {
            brand:            jQuery('input[name=user_brand]').val(),
            page:             jQuery('input[name=user_page]').val(),
            origin_iata:      jQuery('input[name=user_departure]').val(),
            destination_iata: jQuery('input[name=user_arrival]').val(),
            origin_full:      jQuery('input[name=alert_from]').val(),
            destination_full: jQuery('input[name=alert_to]').val(),
            date_from:        jQuery('input[name=alert_date_from]').val(),
            date_to:          jQuery('input[name=alert_date_to]').val(),
            period:           jQuery('input[name=alert_period]').val()
        };

        // Open generated URL in a new window
        window.open(submit_url(urlOpts));

    });
    jQuery('#searchbox_form').validate({
        rules: {
            alert_from: {
                required: true,
                minlength: 3
            },
            alert_to: {
                required: true,
                minlength: 3
            }
        },
        errorPlacement: function () {
            return true;
        }
    });


    /***** AUTOCOMPLETE ENGINE *****/
    /*******************************/
    jQuery('.txt-auto').autocomplete({
        source: function (request, response) {
            var lang = jQuery('input[name=user_language]').val();
            jQuery.ajax({
                //type: "GET",
                url: "http://apps-odigeo.com/alerts/results/city_autocomplete/" + lang + '/' + request.term,
                dataType: "jsonp",
                //crossDomain: true,
                /*data: {
                 city_name: request.term,
                 limit: 5,
                 type: 'country'
                 },*/
                success: function (data) {
                    console.log(data);
                    response(jQuery.map(data, function (item) {
                        return {
                            label: item.name,
                            value: item.city_code,
                            country: item.country
                        };
                    }));
                },
                error: function () {
                    console.log('error');
                }
            });
        },
        focus: function (event, ui) {
            jQuery(".ui-helper-hidden-accessible").hide();
            event.preventDefault();
        },
        select: function (event, data) {
            var input = jQuery(this).attr('data-related');
            jQuery(this).val(data.item.label);
            jQuery('input[name=' + input + ']').val(data.item.value);
            return false;
        },
        autoFocus: true,
        minLength: 3
    }).each(function () {
        jQuery(this).data("ui-autocomplete")._renderItem = function (ul, item) {
            ul.addClass('location_list');
            return jQuery("<li></li>")
                    .append(item.label + " (" + jQuery.trim(item.country) + ")")
                    .data("ui-autocomplete-item", item)
                    .appendTo(ul);
        };
    });


    /* DATEPICKER */
    jQuery("#datepicker").datepicker({
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        minDate: 0,
        dateFormat: 'MM yy',
        onClose: function (dateText, inst) {
            var month = jQuery("#ui-datepicker-div .ui-datepicker-month :selected").val();
            var year = jQuery("#ui-datepicker-div .ui-datepicker-year :selected").val();
            jQuery(this).datepicker('setDate', new Date(year, month, 1));
        }
    });

    jQuery(".icon-calendar").click(function () {
        jQuery("#datepicker").datepicker("show");
    });

});

function submit_url(options) {
  
    var origin      = options.origin_iata !== undefined      ? options.origin_iata      : options.origin_full;
    var destination = options.destination_iata !== undefined ? options.destination_iata : options.destination_full;
    var brand       = options.brand || "edreams"; 
    var page_ext    = options.page || "com"; 
    var url_base, url_search_string, url_parameters, url_tracking;

    switch (brand) {
        case "travellink":
            url_base = 'http://www.' + brand + '.' + page_ext + '/presentation/external/searchRedirect.jsp',
                    url_parameters = '?type=Flow' +
                    '&name=FGExternalFlightSearch' +
                    '&ClassOfService=E' +
                    '&D_Day=' + get_date_format(options.date_from, 'D', '') + // DD
                    '&D_Month=' + get_date_format(options.date_from, 'Y', '') + get_date_format(options.date_from, 'M', '') + // YYYYMM
                    '&D_Time=TANY' +
                    '&D_City=' + origin +
                    '&R_Day=' + get_date_format(options.date_to, 'D', 'return') + // get_date_format(flight_period, 'D')
                    '&R_Month=' + get_date_format(options.date_to, 'Y', 'return') + get_date_format(options.date_to, 'M', 'return') + // YYYYMM get_date_format(flight_period, 'Y', 'return') + get_date_format(flight_period, 'M', 'return')
                    '&R_Time=TANY' +
                    '&A_City=' + destination +
                    '&NR_OF_ADT=1' +
                    '&NR_OF_CHD=0' +
                    '&NR_OF_INF=0' +
                    '&D_DATERANGE=H1' +
                    '&R_DATERANGE=H1' +
                    '&PAGE_ORIGIN=EXTERNAL' +
                    '&TripType=2' +
                    '&SiteId=TLSE',
                    url_tracking = '&utm_medium=&utm_content=&utm_source=&utm_campaign=';
            break;
        default:
            if(options.date_to !== undefined && options.date_from !== undefined){
                url_search_string = '/engine/waitPage/waitingPage.jsp?action=engine/ItinerarySearch/search';
            }
            else {
                url_search_string = '/engine/waitPage/waitingPage.jsp?action=engine/searchOffers/search';
            }
            url_base = 'http://www.' + brand + '.' + page_ext + url_search_string,
            url_parameters = '&departureDate=' + options.date_from +
                    '&departureLocation=' + origin +
                    '&returnDate=' + options.date_to +
                    '&arrivalLocation=' + destination +
                    '&cabinClassName=TOURIST' +
                    '&numAdults=1' +
                    '&numChilds=0' +
                    '&numInfants=0' +
                    '&searchMainProductTypeName=FLIGHT' +
                    '&tripTypeName=ROUND_TRIP',
            url_tracking = '&utm_medium=social&utm_content=searchbox&utm_source=dreamguides&utm_campaign=dynamic_searchbox';
    }

    return url_base + url_parameters + url_tracking;
}

function get_date_format(flight_period, format, type) {
    var output;
    var today = new Date();
    var next_date = new Date(today);
    var start_day;
    var difference;

    if (type === "return") {
        difference = 7;
    }
    else {
        difference = 0;
    }

    switch (flight_period) {
        case "WITHIN_2_WEEKS":
            start_day = 7;
            break;
        case "BETWEEN_2_AND_4_WEEKS":
            start_day = 14;
            break;
        case "MORE_THAN_4_WEEKS":
        default:
            start_day = 28;
    }
    next_date.setDate(today.getDate() + start_day + difference);

    switch (format) {
        case "D":
            output = next_date.getDate();
            break;
        case "M":
            output = next_date.getMonth() + 1;
            break;
        case "Y":
        default:
            output = next_date.getFullYear();
    }
    return zeroPad(output, 2);
}

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

//http://www.travellink.com/presentation/external/searchRedirect.jsp?type=Flow&name=FGExternalFlightSearch&ClassOfService=E&D_Day=18&D_Month=20152&D_Time=TANY&D_City=BCN&R_Day=25&R_Month=20152&R_Time=TANY&A_City=STO&NR_OF_ADT=1&NR_OF_CHD=0&NR_OF_INF=0&D_DATERANGE=H1&R_DATERANGE=H1&PAGE_ORIGIN=EXTERNAL&TripType=2&SiteId=TLSE&utm_medium=&utm_content=&utm_source=&utm_campaign=

