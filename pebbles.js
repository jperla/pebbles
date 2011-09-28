pebbles = {};

pebbles.utils = function() {
  var wait = function(time, f) {
    setTimeout(f, time);
  };

  var assert = function(bool, message) {
    if(!bool) {
        if(message) {
            throw message;
        } else {
            throw 'Assertion failed';
        }
    }
  };

  return {
    wait : wait,
    assert : assert,
    flush : function(f) { wait(1, f); }
  };
}();


/* 
Docs at http://www.jperla.com/blog/write-bug-free-javascript-with-pebbles

*/


pebbles.ajax = function(spinner) {
  // Put the spinner url in the pebbles object so we can get it in our handlers
  pebbles.spinner = spinner;

  var kwargs_of_action = function(button) {
    inputs = button.children('.kwargs').children('input');
    var kwargs = {};
    for(var i=0;i<inputs.length;i++) {
      var name = inputs.eq(i).attr('name');
      var val = inputs.eq(i).val();
      kwargs[name] = val;
    }
    return kwargs;
  };

  var target_from_kwargs = function(button, kwargs) {
    var target = null;
    if(!kwargs['target-type']) {
        kwargs['target-type'] = 'absolute';
    }
    if(kwargs['target-type'] == 'absolute') {
        target = jQuery(kwargs['target']);
    } else if(kwargs['target-type'] == 'parents') {
        target = button.parents(kwargs['target']);
    } else if(kwargs['target-type'] == 'child-of') {
        var closest = button.closest(kwargs['closest']);
        target = closest.find(kwargs['target']);
    } else if(kwargs['target-type'] == 'closest') {
        target = button.closest(kwargs['target']);
    } else if(kwargs['target-type'] == 'siblings') {
        target = button.siblings(kwargs['target']);
    } else {
        throw 'No known target type: ' + kwargs['target-type'];
    }

    if(target.length == 0) {
        throw 'No target found for selector: ' + kwargs['target-type'] + kwargs['target'];
    } else if(target.length > 1) {
        throw 'Too many targets found for selector: ' + kwargs['target-type'] + kwargs['target'];
    } else {
        return target;
    }
  };

  var action = function(e) {
    var button = jQuery(this);
    var kwargs = kwargs_of_action(button);

    if(pebbles.handlers.hasOwnProperty(kwargs['type'])) {
        return pebbles.handlers[kwargs['type']](button, kwargs);
    } else {
        throw 'No known kwargs type';
    }
  };

  return {
    action: action,
    target_from_kwargs: target_from_kwargs
  };
}();

pebbles.handlers = function () {
  var generate_replace_and_show = function(target) {
    var replace_and_show = function(response) {
      target.html(response);
      target.show();
    };
    return replace_and_show;
  };

  var act_on_opener_closer = function(button, kwargs) {
    var target = pebbles.ajax.target_from_kwargs(button, kwargs);
    if(target.css('display') != 'none') {
        button.children('.when-closed').show();
        button.children('.when-open').hide();
        target.hide();
    } else {
        var url = kwargs['url'];
        button.children('.when-closed').hide();
        button.children('.when-open').show();
        if(target.html() != "" || !url) {
            target.show();
        } else {
            target.html('<img src="' + pebbles.spinner + '" />');
            target.show();
            pebbles.utils.flush(function() {
                jQuery.ajax({url: url,
                    success: generate_replace_and_show(target) });
            });
        }
    }
    return false;
  };

  var act_on_form_submitter = function(button, kwargs) {
    var target = pebbles.ajax.target_from_kwargs(button, kwargs);
    if(kwargs['form']) {
        var form = jQuery(kwargs['form']);
    } else {
        var form = button.find('form');
    }
    pebbles.utils.assert(form.length == 1, 'No form found in button');
    var method = form.attr('method');
    var url = form.attr('action');
    pebbles.utils.assert(url !== '', 'Form submit URL is not blank');
    var data = form.serialize();
    pebbles.utils.assert(data !== '', 'Form should send some data');
    button.html('<img src="' + pebbles.spinner + '" />');
    jQuery.ajax({url: url,
                 method: method,
                 data: data,
                 success: generate_replace_and_show(target) });
    return false;
  };

  var always_replace_target_with_url = function(button, kwargs) {
    var target = pebbles.ajax.target_from_kwargs(button, kwargs);

    target.hide();
    pebbles.utils.flush(function() {
        jQuery.ajax({url: kwargs['url'],
            success: generate_replace_and_show(target) });
    });
    return false;
  };

  return {
    'open-close': act_on_opener_closer,
    'submit-form': act_on_form_submitter,
    'replace': always_replace_target_with_url
  };
}();


jQuery(function() {
  jQuery('.actionable').live('click', pebbles.ajax.action);
});

 
