/**
 *  jQuery Formtag Plugin
 *  http://github.com/jeremymarc/jquery.formtag.js/
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
  $.fn.tagform = function (options) {
    //default options
    var defaults = {
      add_button_text: '+ Add Field',
      add_button_class: 'btn add-field',
      tag_label: '~'
    };

    var elements = [],
      $menu,
      $tags
    ;

    options = $.extend(defaults, options);

    return this.each(function() {
      var self = $(this),
        textInputs = self.find('input[type="text"]')
        selects = self.find('select');

      self.hide(); // hide form

      if (textInputs.length > 0) {
        textInputs.each(function(i, input) {
          addFormElement($(input));
        });
      }

      if (selects.length > 0) {
        selects.each(function(i, select) {
          addFormElement($(select));
        });
      }

      /**
       * Store new form element
       * element: jQuery Selector
       *
       * Support only Select
       */
      function addFormElement(element) {
        elements.push(element);
      }

      /**
       * Init element handlers. Has to be called only once
       */
      function init() {
        var $add = $('<a></a>');
        $add.html(options.add_button_text).addClass(options.add_button_class);
        $add.on('click', function() {
          updateMenuElementsVisibility();
          $menu.show();
        });

        $tags = $('<div></div>').addClass('tags');
        initTags();

        self.parent().append($tags);
        initMenu();
        self.parent().append($add);

        $(document).click(function(e) {
          var $target = $(e.target);
          if (0 === $target.parents('.values').length) {
            $('.values').hide();
          }
        });
      }

      /**
       * Build the menu with form labels. Has to be called once
       */
      function initMenu() {
        $menu = $('<ul></ul>').addClass('menu');
        $menu.hide();
        $(elements)
        .each(function(i, el) {
          var val = $(el).val();
          $li = $('<li></li>');
          $li.html(getLabel(el).html())
            .data(el)
            .addClass('label');

          $menu.append($li);
        });

        self.parent().append($menu);

        $menu.on('click', function(e) {
          var target = $(e.target);
          addTag(target.data());

          $('.tag:last-child ul').show();
          $menu.hide();

          return false;
        });
      }

      function updateMenuElementsVisibility() {
        var element, val;

        $menu.find('li')
        .each(function(i, li) {
          element = $(li).data();
          val = $(element).val();
          $(li).hide();

          if (!isTagShown(element)) {
            $(li).show();
          }
        });
      }

      function isTagShown(element) {
        return $(element).hasClass('tagged');
      }

      /**
       * Generate tag links from form
       */
      function initTags() {
        $('.tag').remove();

        $(elements)
        .each(function(i, element) {
          if (isFormElementValueValid(element.val())) {
            addTag(element);
          }
        });
      }

      function addTag(element) {
        var $div, $a, $close, $tagMenu, label, $e;
        $div = $('<div></div>').addClass('tag').data(element);
        $(element).addClass('tagged');

        $tagMenu = $('<ul></ul>').addClass('values').hide();
        $tagMenu.on('click', function(e) {
          var $target = $(e.target),
              data = $target.parents('.tag').data(),
              val = $target.data('value');


          if ($(data).is('select')) {
            if ($(data).attr('multiple')) {
              if ($target.is('li')) {
                $target.find('input').trigger('click');
                return;
              }

              val = [];
              $(this).find('input:checked').add($target)
              .each(function(i, e) {
                val.push($(e).parent().attr('data-value'));
              });
              $(data).val(val);
            } else {
              $(data).val(val);
              $(this).hide();
            }
          }

          if ($(data).is('input')) {
          }

          $(data).trigger('change');
        });


        if (element.is('select')) {
          var values = getSelectValues(element),
              multiple = ($(element).attr('multiple'));

          $(values)
          .each(function(i, el) {
            $e = $('<li></li>').html(el[0]);
            $e.attr('data-value', el[1]);

            if (multiple) {
              $checkbox = $('<input type="checkbox" />');
              if ($.inArray(el[1], $(element).val()) !== -1) {
                $checkbox.attr('checked', true);
              }
              $e.append($checkbox);
            }

            $tagMenu.append($e);
          });
        }

        if (element.is('input')) {
          $e = $('<li></li>');
          $e.append($(element).clone(true, true));
          $tagMenu.append($e);
        }

        $a = $('<a></a>').html(getElementTitle(element));
        $a.on('click', function(e) {
          $tagMenu.toggle();
          return false;
        });
        $close = $('<a></a>').addClass('close').html('x');
        $close.one('click', function(e) {
          var $target = $(e.target),
          data = $target.parent('.tag').data()
          ;

          $(element).val('').removeClass('tagged').trigger('change');
          $target.parent().remove();
        });

        //need to update the tag element
        element.change(function(e) {
          $a.html(getElementTitle($(this)));
        });


        $div.append($a);
        $div.append($close);
        $div.append($tagMenu);
        $tags.append($div);
      }


      function getElementTitle(formElement) {
        var label = getLabel(formElement).html() + ': ',
            val = $(formElement).val();

        if (isFormElementValueValid(val)) {
          label += $(formElement).val();
        } else {
          label += options.tag_label;
        }

        return label;
      }

      function isFormElementValueValid(value) {
        return value &&
          "undefined" !== typeof(value) &&
          value.length > 0 && "?" != value;
      }

      function getSelectValues(element) {
        var $val;
        var options =
        $(element)
        .find('option')
        .filter(function(i, opt) {
          $val = $(opt).val();
          return $val.trim().length > 0 && $val != "?";
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
