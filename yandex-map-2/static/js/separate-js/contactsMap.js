ymaps.ready(init);
    var myMap,
        myPlacemark;

    function init(){
        myMap = new ymaps.Map("contactsMap", {
            center: [55.789075,37.729348],
            zoom: 13
        });

        myPlacemark = new ymaps.Placemark([55.789075,37.729348], {});
        myMap.geoObjects.add(myPlacemark);
        myMap.behaviors.disable('scrollZoom');

        $(window).resize(function(){
            if ($(window).width() <= 800){
                myMap.behaviors.disable('drag');
            }
        });
    }
