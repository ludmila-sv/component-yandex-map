$(function(){

// выравнивание высот блоков
function route_heights() {
	var height = 0;
	$('.route').each(function(){
		if($(this).outerHeight()>height) height = $(this).outerHeight();
	});
	$('.route').css('height',height+'px');
}
route_heights();

$(window).resize(function(){
	route_heights();
});

// Страна - Китай
if($('.content__top h1').text().indexOf("Китая")!=-1) var china = true;

// рисуем карту
var myMap;
var arr_points = []; // массив объектов - городов
var arr_points_suez = [
	{latitude:-0.006159553957253636,longitude:105.29787424999995},
	{latitude:6.175495859542665,longitude:96.33303049999992},
	{latitude:13.40606259119913,longitude:51.42092112499993},
	{latitude:11.332528692004072,longitude:44.12599924999993},
	{latitude:33.382520759830356,longitude:30.76662424999992},
	{latitude:39.07437903531012,longitude:4.926780499999928},
	{latitude:35.70937579284977,longitude:-9.66306325000008},
	{latitude:47.585788943577654,longitude:-10.981422625000066},
	{latitude:54.64816195281117,longitude:7.9150617499999365},
	{latitude:54.90219972740121,longitude:15.034202374999921},
	]; // массив точек - маршрут через Суэцкий канал

var color_blue = '668be6ff'; // ff - opacity
var color_darkblue = '365296ff';
var color_brown = 'cc4609ff';
var color_green = '0e8043ff';

ymaps.ready(init);

function init() {
	var moscow_lat = 55.58446640485473;
	var moscow_lon = 37.385470500000004;
	var arr_coords = [];

	$('#map').css('visibility','hidden'); // прячем блок с картой и создаем карту с центром в Москве
    myMap = new ymaps.Map('map', {
            center: [moscow_lat,moscow_lon],
			controls:[],
            zoom: 3
        });
	myMap.behaviors.disable('scrollZoom');
	if($(document).width()<768) myMap.behaviors.disable('drag');

	// Наносим точки на карту и показываем блок с картой
	route_points();
	$('#map_text').remove();
	$('#map').css('visibility','visible');

	// Рисуем маршрут
	draw_route();

	// Вставляем текст про стоимость и продолжительность
	route_txt();
}



// Рисуем маршрут из сегментов
function draw_route() {
	var segments = $('.route.active').find('.route_transport').find('span');
	for (var i = 0; i < segments.length; i++) { 
		var transport = segments.eq(i).text();
		switch(transport) {
			case 'Авиа': 
				if(arr_points[i+1]) draw_curve([[arr_points[i].latitude, arr_points[i].longitude],[arr_points[i+1].latitude, arr_points[i+1].longitude]],color_blue);
			break;

			case 'Авто':  
				if(arr_points[i+1]) draw_line([[arr_points[i].latitude, arr_points[i].longitude],[arr_points[i+1].latitude, arr_points[i+1].longitude]],color_brown);
			break;

			case 'Ж/д':  
				if(arr_points[i+1]) draw_line([[arr_points[i].latitude, arr_points[i].longitude],[arr_points[i+1].latitude, arr_points[i+1].longitude]],color_green);
			break;

			case 'Море':  
				if(arr_points[i+1]) draw_line([[arr_points[i].latitude, arr_points[i].longitude],[arr_points[i+1].latitude, arr_points[i+1].longitude]],color_darkblue);
			break;

			case 'Море через Суэцкий канал':  
				if(china) {
					arr_points_suez.unshift({latitude:arr_points[i].latitude, longitude:arr_points[i].longitude});
					arr_points_suez.push({latitude:arr_points[i+1].latitude, longitude:arr_points[i+1].longitude});
					for (var k = 0; k < arr_points_suez.length-1; k++) {
						draw_line([[arr_points_suez[k].latitude, arr_points_suez[k].longitude],[arr_points_suez[k+1].latitude, arr_points_suez[k+1].longitude]],color_darkblue);
					}
				} else {
					if(arr_points[i+1]) draw_line([[arr_points[i].latitude, arr_points[i].longitude],[arr_points[i+1].latitude, arr_points[i+1].longitude]],color_darkblue);
				}
			break;

			default:
				if(arr_points[i+1]) draw_line([[arr_points[i].latitude, arr_points[i].longitude],[arr_points[i+1].latitude, arr_points[i+1].longitude]],color_blue);
				console.log(transport);
			break;
		}
	}

}



// Наносим города на карту
function route_points() {
	arr_points.length = 0;
	var arr_coords_txt, coords_lat, coords_lon, city_name;

// 1) Получаем массив объектов городов (название + координаты)
	var n_cities = $('.route.active').find('.city_coord').length;
	for (var i = 0; i < n_cities; i++) { 

		arr_coords_txt = $('.route.active').find('.city_coord').eq(i).text().split(',');
		coords_lat = Number(arr_coords_txt[0].slice(1));
		coords_lon = Number(arr_coords_txt[1].slice(0,-1));

		city_name = $('.route.active').find('.city_name').eq(i).text();

		var point = {
			name: city_name,
			latitude: coords_lat,
			longitude: coords_lon
		}; 

		arr_points[i] = point;
	}

// 2) Наносим точки на карту
	var all_cities = new ymaps.GeoObjectCollection(null, {preset: 'islands#darkBlueStretchyIcon'});
	for (var i = 0; i < arr_points.length; i++) { 
		if(arr_points[i].name) {
			all_cities.add(
				new ymaps.Placemark( [arr_points[i].latitude, arr_points[i].longitude], {iconContent: arr_points[i].name} )
				);
		} 
	}
    myMap.geoObjects.add(all_cities);

// 3) позиционируем карту правильно
	myMap.setBounds(all_cities.getBounds());
}



// рисуем прямую по 2-м точкам
function draw_line(arr_coords,color) {
    ymaps.modules.require(['geoObject.Arrow'], function (Arrow) {
        var route = new Arrow(arr_coords, null, {
            geodesic: false,
			strokeColor: color,
            strokeWidth: 4,
        });
        myMap.geoObjects.add(route);
    });
}



// рисуем кривую по 2-м точкам
function draw_curve(arr_coords,color) {
    ymaps.modules.require(['geoObject.Arrow'], function (Arrow) {
        var route = new Arrow(arr_coords, null, {
            geodesic: true,
			strokeColor: color,
            strokeWidth: 4,
        });
        myMap.geoObjects.add(route);
    });
}



// добавляем текст про стоимость и продолжительность
function route_txt() {
	var cities = $('.route.active').find('.city_name');
	var city_names = '';
	for (var i = 0; i < cities.length; i++) { 
		city_names += cities.eq(i).text()+' - ';
	}
	city_names = city_names.slice(0,-3);
	var desc = $('.route.active').find('.route_cost').html();
	$('#map_result').html('<div><span>'+city_names+'</span>: '+desc+' руб.</div>');
}



// строим маршрут по клику
$('.route').click(function(){
	$('.route').removeClass('active');
	$(this).addClass('active');

	myMap.geoObjects.removeAll();
	route_points();
	draw_route();
	route_txt();
});

});
