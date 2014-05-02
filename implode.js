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
       * values: values displayed once the element is selected
       *
       * Support only Select
       */
      function addFormElement(element, label, values) {
        if ("undefined" === typeof(multiple)) {
          multiple = false;
        }

        console.log('Adding Form Element ' + label);
        elements.push({element: element, label: label, values: values});
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

        $(element.values).each(function(i, el) {
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

        $add.html('+ Add field')
            .addClass('btn add_field')
        ;

        $add.on('click', function() {
          $menu.show();
        });
        $menu.hide();
        initMenu();

        $menu.on('click', function(e) {
          var target = $(e.target);
          ;

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
          }
        });

        self.parent().append($add);
        self.parent().append($menu);
      }

      /**
       * Rebuid the menu with form labels
       */
      function initMenu() {
        $menu.empty();
        $menu.hide();

        $(elements).each(function(i, el) {
          $li = $('<li></li>');
          $li.html(el.label);
          $li.attr('data-index', i)
            .addClass('label');

          $menu.append($li);
        });
      }

      function parseSelect(element) {
        var $label = getLabel(element),
          $options = element.find('option'),
          values = []
          ;

          $options.each(function(i, option) {
            values.push([option.innerHTML, option.value]);
          });

          addFormElement($(element), $label.text(), values);
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
