// Twitch helper functions
var twitch = window.Twitch.ext;
var token = "";
var api = '';

twitch.onAuthorized(function(auth) {
    token = auth.token;
});

// DOM caching
var $armoryButton = $('#armoryButton');
var $body = $('body');
var $message = $('#message');
var $armoryCharacter = $('#armory-character');
var $loader = $('#loader');
var $equipment = $('#equipment');
var $armoryHeader = $('#armory-header');
var $equipped = $('#equipped');
var $weaponSet = $('#weaponSet');
var $sweaponSet = $('#sweaponSet');
var $slotWeapon1 = $('#slot_weapon1');
var $slotWeapon2 = $('#slot_weapon2');
var $slotSweapon1 = $('#slot_sweapon1');
var $slotSweapon2 = $('#slot_sweapon2');

// GLOBALS
var CharArmory = new Armory();

// Amory class
function Armory() {
    this.data = {};
    this.headerHTML = '';
    this.equipmentHTML = '';
    this.lastFetchTime = 0 // in seconds;
    this.visibility = false;
    this.FETCH_TIMEOUT = 30 * 1000; // 30 seconds - 1 second
    this.isFetching = false;
    return this;
};

Armory.prototype.init = function(characterData) {
    this.data = characterData;
    return this;
};

Armory.prototype.fetchData = function() {

    if (this.isAllowedToFetch() == false) {

        if (this.data) {
            return;
        }

        $message.html('Please don\'t spam the network. <br> Retry in 30 seconds.').fadeIn();

        return;
    }

    this.isFetching = true;
    $loader.fadeIn();
    $message.hide();
    $armoryCharacter.hide();

    $.ajax({
            type: 'GET',
            cache: true,
            url: api + 'data',
            contentType: 'application/json; charset=UTF-8',
            headers: {
                'Authorization': 'podArmory_' + token
            },
            dataType: 'json'
        })
        .done(function(data) {

            // broadcaster has no char set
            if (data.status == 700) {
                $message.html('No character configured! <br>Remind your broadcaster to set a name (dashboard).').fadeIn();
                return;
            }

            // broadcaster provided non existing char name
            if (data.status == 300) {
                $message.html('Character doesn\'t exist. <br>Remind your broadcaster to set a valid name.').fadeIn();
                return;
            }

            CharArmory.init($.parseJSON(data.payload)).build();
        })
        .fail(function(xhr, status, error) {
            $message.html('Service currently unavailable. <br> Please contact the extension admin if this issue persists.').fadeIn();
        })
        .always(function() {
            CharArmory.lastFetchTime = Date.now();
            CharArmory.isFetching = false;
            $loader.hide();
        });;


};

Armory.prototype.isAllowedToFetch = function() {

    var currentTime = Date.now();
    var timeDiff = currentTime - this.lastFetchTime;

    if (timeDiff > this.FETCH_TIMEOUT && this.isFetching == false) {
        return true;
    }

    return false;

};

Armory.prototype.build = function() {
	var title = "";
	if (typeof this.data.Title === 'undefined') {
		title = "Normal";
	} else {
		title = this.data.Title;
	}
	
    // header html
    this.headerHTML = '<h2 id="header-name">' + this.data.Name + '</h2>' +
        '<span id="header-misc">' + this.data.Stats.Level + ' ' + this.data.Class + '</span>' +
        '<span id="header-title">&laquo; ' + title + ' &raquo;</span>';

    // softcore or hardcore char
    if (this.data.IsHardcore) {
        this.headerHTML += '<span id="header-league-hc">Hardcore</span>';
    } else {
        this.headerHTML += '<span id="header-league-sc">Softcore</span>';
    }

    $armoryHeader.html(this.headerHTML);

    // can't fetch equip from dead chars
    if (this.data.IsDead) {
        // display message
        $loader.hide();
        $armoryCharacter.fadeIn();
        $message.html('Character is dead!').fadeIn();
        return this;
    }


    // equipment html
    var itemCount = this.data.Equipped.length;
    var item = {};
    var itemHTML = '';
    this.euiqpmentHTML = '';

    for (var i = 0; i < itemCount; i++) {
        item = new ArmoryItem(this.data.Equipped[i]);
        itemHTML = item.generateHTML();
        //@NOTE sub-optimal dom querying, need to find a way to cache and use slot DOMs
        $equipped.find('#slot_' + item.slot).addClass(item.quality).html(itemHTML);
    }

    $loader.hide();
    $armoryCharacter.fadeIn();

    return this;
};


Armory.prototype.generateSlotTooltip = function(item, itemHtml) {

    return '<div id="slot_' + item.slot + '" ' +
        'class="slot tooltip ' + item.slot + ' ' + item.quality + '">' +
        itemHtml +
        '</div>';

};


Armory.prototype.toggleVisibility = function() {

    this.visibility = !this.visibility;

    return this;

};


Armory.prototype.isHardcore = function() {

    if (this.data.hasOwnProperty("hardcore")) {
        return true;
    }

    return false;

};

// only relevant for hardcore league
Armory.prototype.isDead = function() {

    if (this.data.has_died._text == "yes" && this.isHardcore()) {
        return true;
    }

    return false;

};

Armory.prototype.showWeaponsPrimary = function() {

    var $ele = $(this);
    
    //  if not active swap, otherwise do nothing
    if (!$ele.hasClass('weaponSwitcher-active')) {

        $ele.toggleClass('weaponSwitcher-active');
        $sweaponSet.toggleClass('weaponSwitcher-active');

        $slotSweapon1.hide();
        $slotSweapon2.hide();

        $slotWeapon1.show();
        $slotWeapon2.show();

        return;
    }

};

Armory.prototype.showWeaponsSecondary = function() {

    var $ele = $(this);

    //  if not active swap, otherwise do nothing
    if (!$ele.hasClass('weaponSwitcher-active')) {

        $ele.toggleClass('weaponSwitcher-active');
        $weaponSet.toggleClass('weaponSwitcher-active');

        $slotWeapon1.hide();
        $slotWeapon2.hide();

        $slotSweapon1.show();
        $slotSweapon2.show();

        return;
    }
};



function ArmoryItem(item) {
    this.item = item;
    this.type = this.getType();
    this.properties = this.item.PropertyList;
    this.slot = item.Worn;
    this.quality = this.item.QualityCode;
    this.assetPath = 'https://pathofdiablo.com/p/armory/img/items/';
    this.assetDefaultPath = 'img/default/';
    return this;
}

ArmoryItem.prototype.generateHTML = function() {

    var imageSrc = this.getImageURL();
    var title = this.getTitle();
    // var html = '<img src="' + imageSrc + '"><span class="tip">' +
    //     '<span class="itemname ' + this.type + '">' + title + '</span><br>';
	var html = '<span class="tip">';
	
	if (this.item.SocketCount > 0 && (this.quality == "q_normal" || this.quality == "q_high")) {
		html += '<span class="itemname ÿc6">' + title + '</span><br>';
	} else {
		html +='<span class="itemname ' + this.type + '">' + title + '</span><br>';
	}

    $('<img id="img' + this.slot + '">')
        .on('error', this.onErrorImg)
        .on('load', this.onLoadImg)
        .attr('src', imageSrc);

    if (this.isRuneword()) {
        html += '<span class="' + this.type + '">' + this.item.RuneTag + '</span><br>';
    } else {
		html += '<span class="' + this.type + '">' + this.item.Tag + '</span><br>';
    }

    //@TODO check whether defense or dmg is enhanced and adjust color accordingly
    if (this.hasDefense()) {
        html += 'Defense:  <span class="">' + this.item.Defense + '</span><br>';
    }

    if (this.hasDurability()) {
        html += 'Durability: ' + this.item.Durability + '<br>';
    }

    html += 'Item Level: ' + this.item.ItemLevel + '<br>';
	var propertiesCount = 0;
	if (typeof this.properties !== 'undefined') {
		propertiesCount = this.properties.length;
	} 

    // yes > append all properties
    for (var k = 0; k < propertiesCount; k++) {

        if (this.isCorrupted(this.properties[k])) {

            html += '<span class="ÿc1 bold">Corrupted</span><br>';
            continue;
        }

        if (this.isEnchanted(this.properties[k])) {
            html += '<span class="ÿcG bold">Enchanted</span><br>';
            continue;
        }

        html += '<span class="affix">' + this.properties[k] + '</span><br>';

    }
    
    return html + '</span>';

};

ArmoryItem.prototype.getImageURL = function() {
    var imageName = this.item.Tag.toLowerCase().split(' ').join('_');
	if (this.quality == "q_set" || this.quality == "q_unique") {
		imageName = this.item.Title.toLowerCase().split(' ').join('_');
	}
	if (this.slot == "amulet" || this.slot.substring(0, this.slot.length - 1) == "ring") {
		imageName = this.item.Tag.toLowerCase() + (parseInt(this.item.AlternateGraphics) + 1);
	}
    return this.assetPath + imageName + '.gif';
};

ArmoryItem.prototype.isCorrupted = function(property) {

    return property.includes('Corrupted');

};


ArmoryItem.prototype.isEnchanted = function(property) {
	
	return property.includes('Enchanted');

};


ArmoryItem.prototype.isRuneword = function() {

    if (this.item.QualityCode == 'q_runeword') {
        return true;
    }

    return false;

};

ArmoryItem.prototype.hasSockets = function() {

    if (this.item.SocketCount > 0) {
        return true;
    }

    return false;

}

ArmoryItem.prototype.hasDefense = function() {

    if (this.item.hasOwnProperty("Defense")) {
        return true;
    }

    return false;

}

ArmoryItem.prototype.hasDurability = function() {

    if (this.item.hasOwnProperty("Durability")) {
        return true;
    }

    return false;

}

ArmoryItem.prototype.getType = function() {

    return this.item.QualityCode;

}

ArmoryItem.prototype.getTitle = function() {

    var title = '';
    // main item title
	title += this.item.Title;

    // affix
	// Sockets is in prop list now
    //if (this.hasSockets()) {
    //    title += ' (' + this.item.sockets._text + ')';
    //}

    return title;

}

ArmoryItem.prototype.onLoadImg = function(event) {

    var slot = this.id.replace('img', '');
    $('#slot_' + slot).prepend(this);
    $(this).off('load').fadeIn();

    return true;
}

ArmoryItem.prototype.onErrorImg = function(event) {

    var slot = this.id.replace('img', '');
    $(this).attr('src', 'img/default/' + slot + '.png')
    $(this).off('error');

    return true;
}



$(function() {

    $weaponSet.on('click', CharArmory.showWeaponsPrimary);
    $sweaponSet.on('click', CharArmory.showWeaponsSecondary);

    $body.on('mouseenter', function() {
        $armoryButton.stop().fadeToggle(200);
    });

    $body.on('mouseleave', function() {

        $armoryButton.stop().fadeToggle(200);

        if ($armoryButton.hasClass('active')) {
            $armoryButton.removeClass('active')
            CharArmory.toggleVisibility();
            $equipment.hide();

        }
    });

    // tooltips
    $equipped.on('mouseenter mouseleave', '.tooltip', function() {
        $(this).find('span.tip').stop().fadeToggle();
    });

    $armoryButton.on('click', function() {
        $armoryButton.toggleClass('active');
        $equipment.stop().fadeToggle();

        CharArmory.toggleVisibility();
        if (CharArmory.visibility) {
            CharArmory.fetchData();
            $weaponSet.trigger('click');
        }
    });

});