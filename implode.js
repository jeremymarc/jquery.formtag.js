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
  var elements = [],
    $menu,
    $tags
  ;

  var tagForm = function() {
      var _ = this;

      //default options
      _.options =  {
          add_button_text: '+ Add Field',
          add_button_class: 'btn add-field',
          tag_label: '~'
      };

      _.init = function(el, options) {
        //  Check whether we're passing any options
        _.options = $.extend( _.options , options);

        _.el = el;
        _.textInputs = el.find('input[type="text"]');
        _.selects = el.find('select');

        el.hide(); // hide form

        if (_.textInputs.length > 0) {
          _.textInputs.each(function(i, input) {
            _.element.add($(input));
          });
        }

        if (_.selects.length > 0) {
          _.selects.each(function(i, select) {
            _.element.add($(select));
          });
        }

      /**
       * Init element handlers. Has to be called only once
       */
        var $add = $('<a></a>');
        $add.html(_.options.add_button_text).addClass(options.add_button_class);
        $add.on('click', function() {
          updateMenuElementsVisibility();
          $menu.show();
        });

        $tags = $('<div></div>').addClass('tags');
        _.tag.init();

        el.parent().append($tags);
        _.initMenu(el);
        el.parent().append($add);

        $(document).click(function(e) {
          var $target = $(e.target);
          if (0 === $target.parents('.values').length) {
            $('.values').hide();
          }
        });

        return _;
      };

      /**
       * Build the menu with form labels. Has to be called once
       */
      _.initMenu = function(el) {
        $menu = $('<ul></ul>').addClass('menu');
        $menu.hide();
        $(elements)
          .each(function(i, el) {
            var val = $(el).val();
            $li = $('<li></li>');
            $li.html(_.element.label(el).html())
              .data(el)
              .addClass('label');

            $menu.append($li);
          });

        el.parent().append($menu);

        $menu.on('click', function(e) {
          var target = $(e.target);
          _.tag.add(target.data());

          $('.tag:last-child ul').show();
          $menu.hide();

          return false;
        });
      }

    _.tag =  {
          /**
           * Generate tag links from form
           */

          // TODO replace .tag
          init: function () {
            $('.tag').remove();

            $(elements)
            .each(function(i, element) {
              if (isFormElementValueValid(element.val())) {
                _.tag.add(element);
              }
            });
          },

          add: function(element) {

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
              var values = _.element.selectValues(element),
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

            $a = $('<a></a>').html(_.element.title(element));
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
              $a.html(_.element.title($(this)));
            });


            $div.append($a);
            $div.append($close);
            $div.append($tagMenu);
            $tags.append($div);
          }
      }

    _.element =  {

        /**
         * Store new form element
         * element: jQuery Selector
         *
         * Support only Select
         */
        add: function(element) {
          elements.push(element);
        },

        title: function(formElement) {
          var label = _.element.label(formElement).html() + ': ',
              val = $(formElement).val();

          console.log(val)
          if (isFormElementValueValid(val)) {
            label += $(formElement).val();
          } else {
            label += _.options.tag_label;
          }

          return label;
        },

        selectValues: function (element) {
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
        },

        /**
         * Return the label element from a form element
         */
        label: function (element) {
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
      }
  }

  function updateMenuElementsVisibility() {
        var element, val;

        console.log($menu)
        $menu.find('li')
          .each(function(i, li) {
            element = $(li).data();
            val = $(element).val();
            $(li).hide();

            if (!isTagShown(element)) {
              $(li).show();
            }
          });
  };

  function isTagShown(element) {
    return $(element).hasClass('tagged');
  }

  function isFormElementValueValid(value){
        return value &&
          "undefined" !== typeof(value) &&
          value.length > 0 && "?" != value;
  };

  $.fn.tagform = function (options) {
    var len = this.length;

    return this.each(function(index) {
      //  Cache a copy of $(this)
      var me = $(this),
        key = 'tagForm' + (len > 1 ? '-' + ++index : ''),
        instance = (new tagForm).init(me, options);

      //  Invoke an tagForm instance
      me.data(key, instance).data('key', key);
    });
  };

}));
