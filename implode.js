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
    var defaults = {
    };
    var elements = [];

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

      build();

      function addFormElement(element, label, values, multiple) {
        if ("undefined" === typeof(multiple)) {
          multiple = false;
        }

        console.log('Adding Form Element ' + label);
        elements.push({label: label, values: values, multiple: multiple});
      }

      function removeFormElement(label) {
      }

      function getElement(index) {
        return elements[index];
      }

      function buildHtmlFromElementIndex(index) {
        var element = getElement(index),
          html = '',
          $li;

        $(element.values).each(function(i, el) {
          $li = $('<li></li>').html(el[0]);
          $li.attr('data-value', el[1]);
          html += $li.wrap('<p/>').parent().html();
        });

        return html;
      }


      function build() {
        var $add = $('<a></a>');
        var $menu = $('<ul></ul>');

        $add.html('+ Add field')
            .addClass('btn add_field')
        ;

        $add.on('click', function() {
          $menu.show();
        });
        $menu.hide();

        $(elements).each(function(i, el) {
          $li = $('<li></li>');
          $li.html(el.label);
          $li.attr('data-index', i)
            .addClass('label');

          $menu.append($li);
        });

        $menu.on('click', function(e) {
          var target = $(e.target);

          if (target.hasClass('label')) {
            index = $(target).data('index'),
            html = buildHtmlFromElementIndex(index)
            ;

            $menu.html(html);
            $menu.attr('data-index', index);
          } else {
            var value = target.data('value');
            //update form
          }
        });

        self.parent().append($add);
        self.parent().append($menu);
      }

      //private
      function parseSelect(element) {
        var $label = getLabel(element),
          $options = element.find('option'),
          values = []
          ;

          $options.each(function(i, option) {
            values.push([option.innerHTML, option.value]);
          });

          addFormElement(element, $label.text(), values, false);
      }

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
    });
  };
}));
