function getSteamSessionID(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function (cookie) {
        if (callback) {
            callback(cookie.value);
        }
    });
}
//usage:
function addSide() {
    $.ajax({
        url  : "sidemenu.html",
        cache: false
    }).done(function (html) {
            $(".replaceSide").replaceWith(html);
        });
}

function sellItem(appid, contextid, assetid, amount, price, steamsession) {
    $.ajax({
        url        : 'https://steamcommunity.com/market/sellitem/',
        type       : 'POST',
        data       : {
            sessionid: steamsession,
            appid    : appid,
            contextid: contextid,
            assetid  : assetid,
            amount   : amount,
            price    : price
        },
        crossDomain: true,
        xhrFields  : { withCredentials: true }
    }).done(function (data) {
            console.log(data);
        }).fail(function (jqxhr) {
            // jquery doesn't parse json on fail
            var data = $.parseJSON(jqxhr.responseText);
            console.log(data);
        });
}
function getPrices(appid) {
    $('.itemRow').each(function () {
        var itemurl = "http://steamcommunity.com/market/listings/" + appid + "/" + $(this).find('.itemname').text();
        var xhr = new XMLHttpRequest();
        xhr.open("GET", itemurl, true);
        xhr.withCredentials = true;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var item_price = xhr.responseText.match(/<span class="market_listing_price market_listing_price_with_fee">\r\n(.+)<\/span>/g);
                if (item_price) {
                    $(item_price).each(function (index, value) {
                        if (!(value.match(/\!/))) {
                            item_to_get = value.match(/<span class="market_listing_price market_listing_price_with_fee">\r\n(.+)<\/span>/);
                            return false;
                        }
                    });
                    lowest_price = item_to_get[1].trim();
                    $(this).find('.price').html(lowest_price);
                    console.log(lowest_price);
                } else {
                    $(this).find('.price').html('Not Found');
                    console.log('not found');
                }
            }
        };
        xhr.send();
    });
}
function getInventory(appid, contextid, callback) {
    var closedData;
    var profileurlid = "";
    chrome.storage.local.get("profileID", function (fetchedData) {
        profileurlid = fetchedData.profileID
        var url = "http://steamcommunity.com/id/" + profileurlid + "/inventory/json/" + appid + "/" + contextid;
        $.getJSON(url, function (data) {
            closedData = data;
        })
            .done(function (parsedResponse, statusText, jqXhr) {
                //                $('#statusCode').text(jqXhr.status); //200
                //                $('#statusText').text(jqXhr.statusText); //success
                //this should not be undefined
                //                $('#get-csgo').text(jqXhr.responseText);
                var tbody = $('#inventoryTbody');
                var nonmarketable =  $('#inventoryTbody-nonmarket');
                var crates =  $('#inventoryTbody-containers');
                console.log(parsedResponse);
                tbody.empty();
                for (index in parsedResponse['rgDescriptions']) {
                    var otherstyles = '';
                    var Item = parsedResponse['rgDescriptions'][index];
                    if (Item.background_color != '') {
                        otherstyles = otherstyles + 'background-color:#' + Item.background_color + ';'
                    }
                    itemRendered = "<tr style=\"" + otherstyles + "\" class=\"itemRow\" data-preview-image=\"" + Item.icon_url + "\">" +
                        "<td class=\"classid\">" + Item.classid + "</td>" +
                        "<td  class=\"itemname\" style=\"background-image: url('http://cdn.steamcommunity.com/economy/image/" + Item.icon_url + "/28fx42f');  border-left: 5px solid #" + Item.name_color + "\">" + Item.market_hash_name + "</td>" +
                        "<td class=\"itemtype\">" + Item.type + "</td>" +
                        "<td class=\"\" style=\"border-left: 5px solid #" + Item['tags'][1].color + "\">" + Item['tags'][1].name + "</td>" +
                        "<td class=\"\">" + Item.type + "</td>" +
                        "<td class=\"price\"><a class=\"btn btn-default btn-xs\" data-lowest-price=\"250\" data-assetid=\"" + Item.classid + "\" >Sell Item</a></td>" +
                        "</tr>"
                    if (Item.type == 'Base Grade Container'){
                        crates.append(itemRendered);
                    } else if (Item.marketable == 0) {
                        nonmarketable.append(itemRendered);
                    } else {
                        tbody.append(itemRendered);
                    }

                    //                    console.log(Item.market_hash_name)
                }
                callback(closedData);
            });
    });
}
$('#get-csgo').click(function () {
    var btn = $(this);
    btn.button('loading');
    getInventory('730', '2', function () {
        btn.button('reset')
    });
});
$('#get-prices').click(function () {
    var btn = $(this);
    btn.button('loading');
    getPrices('730', function () {
        btn.button('reset')
    });
});
$(document.body).on('click', '.price>a', function () {
    var assetid = $(this).attr('data-assetid');
    getSteamSessionID("http://steamcommunity.com", "sessionid", function (sessionid) {
        //        alert(sessionid);
        sellItem(730, 2, assetid, 1, 20, sessionid);
    });
});
$(document.body).on('hover', '.itemRow', function () {
    alert('asd');
    var imgurl = $(this).attr('data-preview-image');
    $('.previewimage').attr('src', 'http://cdn.steamcommunity.com/economy/image/' + imgurl);
}, function () {
    $('.previewimage').attr('src', '');
});
$(document).ready(function () {
    addSide();
});
