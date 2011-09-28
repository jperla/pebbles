module('open-close');

asyncTest('open', 6, function () {
    var button = $('.open-close .actionable');

    ok($('#long-comment').html() === '', '#long-comment div starts empty');

    button.click();

    ok(button.find('.when-open').is(':visible'), '.when-open was shown');
    ok(!button.find('.when-closed').is(':visible'), '.when-closed was hidden');

    ok($('#long-comment img').length === 1, 'spinner image was added to #long-comment');

    // Wait while it loads the contents for the div.
    pebbles.utils.wait(100, function () {
        ok($('#long-comment').children('img').length === 0, 'spinner was removed when comment loaded');
        ok($('#long-comment').children('p').length === 3, '#long-comment div loaded html <p>');

        start();
    });
});


module('submit-form');

asyncTest('submit', 3, function () {
    var button = $('.submit-form .actionable');
    
    ok($('#sethappy').children().length === 1, '#sethappy div only contains the button');

    button.click();

    pebbles.utils.wait(100, function () {
        ok($('#sethappy').children('.actionable').length === 0, '.actionable button was replaced');
        ok($('#sethappy').children('p').length === 1, '#sethappy div contents were replaced correctly');

        start();
    });
});


module('replace');

asyncTest('replace', 3, function () {
    var button = $('.replace .actionable');
    
    ok($('#money').children().length === 1, '#money div only contains the button');

    button.click();

    pebbles.utils.wait(100, function () {
        ok($('#money').children('.actionable').length === 0, '.actionable button was replaced');
        ok($('#money').children('pre').length === 1, '#money div contents were replaced correctly');

        start();
    });
});


