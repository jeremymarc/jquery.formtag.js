/**
 *  jQuery Implode Plugin
 *  http://github.com/jeremymarc/jquery.implode.js/
 *
 *  (c) 2014-2015 http://jeremymarc.github.com
 *  MIT licensed
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory;
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  $.fn.implode = function (options) {
    //default options
    var defaults = {
    };

    var elements = [],
      selectedElement,
      $menu;

    options = $.extend(defaults, options);

    return this.each(function() {
      var self = $(this),
        selects = self.find('select');

      self.hide(); // hide form

      if (selects.length > 0) {
        selects.each(function(i, select) {
          parseSelect($(select));
        });
      }

      /**
       * Store new form element
       * element: jQuery Selector
       * label: the display name of the form element
       *
       * Support only Select
       */
      function addFormElement(element, label) {
        if ("undefined" === typeof(multiple)) {
          multiple = false;
        }

        console.log('Adding Form Element ' + label);
        elements.push({element: element, label: label});
      }

      function getFormElement(index) {
        return elements[index];
      }

      /**
       * Generate html from a form element values used in the menu
       */
      function htmlValuesFromFormElement(index) {
        var element = getFormElement(index),
          html = '',
          $li;

        //todo: handle other form elements
        var values = getSelectValues(element);
        $(values).each(function(i, el) {
          $li = $('<li></li>').html(el[0]);
          $li.attr('data-value', el[1]);

          html += $li.wrap('<p/>').parent().html();
        });

        return html;
      }

      /**
       * Init element handlers. Has to be called only once
       */
      function init() {
        var $add = $('<a></a>');
        $menu = $('<ul></ul>');
        $tags = $('<div></div>').addClass('tags');
        $add.html('+ Add field').addClass('btn add-field');

        $add.on('click', function() {
          $menu.show();
        });
        $menu.hide();
        initMenu();
        initTags();

        $menu.on('click', function(e) {
          var target = $(e.target);
          if (target.hasClass('label')) {
            var index = $(target).data('index'),
            html = htmlValuesFromFormElement(index)
            ;
            selectedElement = getFormElement(index);

            $menu.html(html);
            $menu.attr('data-index', index);
          } else {
            // update form element
            $(selectedElement.element).val(target.data('value'));

            initMenu();
            initTags();
          }
        });

        self.parent().append($tags);
        self.parent().append($add);
        self.parent().append($menu);
      }

      /**
       * Generate tag links from form
       */
      function initTags() {
        var $div, $a, $close;

        $('.tag').remove();
        $(elements).each(function(i, element) {
          if ($(element.element).val() && "?" != $(element.element).val()) {
            $div = $('<div></div>').addClass('tag');
            $a = $('<a></a>').html(element.label + ': ' + $(element.element).val());
            $close = $('<a></a>').addClass('close').data(element).html('x');
            $close.one('click', function(e) {
              var $target = $(e.target),
                  data = $target.data()
                ;

              $(data.element).val('');
              $target.parent().remove();
            });

            $div.append($a);
            $div.append($close);
            $tags.append($div);
          }
        });
      }

      /**
       * Rebuid the menu with form labels
       */
      function initMenu() {
        $menu.empty();
        $menu.hide();

        $(elements).each(function(i, el) {
          var $val = $(el.element).val();
          if ($val.trim().length == 0 || $val == "?") {
            $li = $('<li></li>');
            $li.html(el.label);
            $li.attr('data-index', i)
            .addClass('label');

            $menu.append($li);
          }
        });
      }

      function parseSelect(element) {
        var $label = getLabel(element);

        addFormElement($(element), $label.text());
      }

      function getSelectValues(element) {
        var options = $(element.element).find('option').filter(function(i, opt) {
          var $val = $(opt).val();
          return ($val.trim().length > 0 && $val != "?");
        });

        var values = [];
        options.each(function(i, option) {
          values.push([option.innerHTML, option.value]);
        });

        return values;
      }


      /**
       * Return the label element from a form element
       */
      function getLabel(element) {
        var label = $("label[for='"+ $(element).attr('id') + "']");

        if(label.length <= 0) {
          var parentElem = $(element).parent(),
          parentTagName = parentElem.get(0).tagName.toLowerCase();

          if(parentTagName == "label") {
            label = parentElem;
          }
        }

        return label;
      }

      init();
    });
  };
}));
