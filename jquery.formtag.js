/**
 *  jQuery Formtag Plugin
 *  http://github.com/jeremymarc/jquery.formtag.js/
 *
 *  (c) 2014-2015 http://jeremymarc.github.com/jquery.formtag.js/
 *  MIT licensed
 */
;(function (factory) {
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
  var formElements = [],
      $wrapper,
      $addMenu,
      $addMenuWrapper,
      $addTagLink;

  var formTag = function() {
      var _ = this;

      //default options
      _.options =  {
        add_button_text: '+ Add Field',
        tag_label: '~',
        namespace: 'formTag-',
        delete_tag_delay: 0,
        add_tag_delay: 0,
      };

      /**
       * Init Tag Form
       */
      _.init = function($form, options) {
        if (!$form.is('form')) {
          throw new Error('The selected element is not a form');
        }

        //  Check whether we're passing any options
        _.options = $.extend( _.options , options);

        $wrapper = $('<div/>').addClass(_.options.namespace + 'wrapper');

        $form.hide();
        $form.find('input[type="text"], select').each(function(i, formElement) {
          formElements.push($(formElement));
        });

        // Add Tag Link
        $addTagLink = $('<a/>');
        $addTagLink.html(_.options.add_button_text).addClass(_.options.namespace + 'add_field');
        $addTagLink.click(function() {
          updateAddMenuElementsVisibility();
          return false;
        });

        $form.after($wrapper);
        _.initMenu($form);
        $addMenuWrapper.append($addTagLink);
        $wrapper.append($addMenuWrapper);

        // Generate tags for form elements set
        _.tag.init();

        // close tag menu on click
        $(document).click(function(e) {
          if (0 === $(e.target).parents('.' + _.options.namespace + 'values').length) {
            $('.' + _.options.namespace + 'values').hide();
          }
          $addMenu.addClass(_.options.namespace + 'hidden');
        });

        return _;
      };

      /**
       * Build the add element menu from form labels.
       */
      _.initMenu = function($form) {
        var val;

        $addMenu = $('<ul/>')
          .addClass(_.options.namespace + 'menu')
          .addClass(_.options.namespace + 'hidden');

        $addMenuWrapper = $('<div/>').addClass(_.options.namespace + 'menu-wrapper');

        $(formElements)
        .each(function(i, formElement) {
          val = $(formElement).val();
          $li = $('<li/>');
          $li.html(_.tag.label(formElement).html())
          .data(formElement)
          .addClass(_.options.namespace +'label');

          $addMenu.append($li);
        });
        $addMenuWrapper.append($addMenu);

        $addMenu.on('click', function(e) {
          var $last;

          _.tag.add($(e.target).data());
          $last = $wrapper.find('.' + _.options.namespace + 'tag:last');
          $last.find('ul').show();

          if ($last.find('input[type="text"]').length > 0) {
            $last.find('input[type="text"]').focus();
          }

          $addMenu.addClass(_.options.namespace + 'hidden')

          //all form elements are displayed
          if (formElements.length == $wrapper.find('.' + _.options.namespace + 'tag').length) {
            $addTagLink.hide();
            return false;
          }

          return false;
        });
      }

    _.tag = {
        /**
         * Generate tag links from form
         */
        init: function () {
          $(formElements)
          .each(function(i, element) {
            if (isFormElementValueValid(element.val())) {
              _.tag.add(element);
            }
          });
        },

        add: function($formElement) {
          var $div, $a, $close, $tagMenu, label, $e;
          $div = $('<div/>')
            .addClass(_.options.namespace + 'tag')
            .addClass(_.options.namespace + 'hidden')
            .data($formElement);
          $formElement.addClass(_.options.namespace + 'tagged');

          //need to update the tag element
          $formElement.unbind('change').change(function(e) {
            $a.html(_.tag.title($formElement));
          });

          $tagMenu = $('<ul/>').addClass(_.options.namespace + 'values').hide();

          if ($formElement.is('select')) {
            $tagMenu.on('click', function(e) {
              var $target = $(e.target),
                  $formElement = $target.parents('.' + _.options.namespace + 'tag').data(),
                  val = $target.data('value');

              if ($formElement.is('select')) {
                if ($formElement.attr('multiple')) {
                  if ($target.is('li')) {
                    $target.find('input').trigger('click');
                    return;
                  }

                  val = [];
                  $(this).find('input:checked').add($target)
                  .each(function(i, e) {
                    val.push($(e).parent().attr('data-value'));
                  });
                } else {
                  $(this).hide();
                }
              }

              $formElement.val(val).trigger('change');
            });

            var values = _.tag.selectValues($formElement),
                multiple = $formElement.attr('multiple');

            $(values)
            .each(function(i, el) {
              $e = $('<li/>').html(el[0]);
              $e.attr('data-value', el[1]);

              if (multiple) {
                $checkbox = $('<input type="checkbox" />');
                if ($.inArray(el[1], $formElement.val()) !== -1) {
                  $checkbox.attr('checked', true);
                }
                $e.append($checkbox);
              }

              $tagMenu.append($e);
            });
          }

          if ($formElement.is('input')) {
            $e = $('<li/>');
            $input = $formElement.clone(true, true).removeAttr('id');
            $input.keyup(function(e) {
              $formElement.val($input.val()).trigger('change');
            });
            $e.append($input);
            $tagMenu.append($e);
          }

          $a = $('<a/>').html(_.tag.title($formElement));
          $a.on('click', function(e) {
            $tagMenu.toggle();
            return false;
          });
          $close = $('<a/>').addClass(_.options.namespace + 'close').html('x');
          $close.one('click', function(e) {
            var $target = $(e.target),
                $formElement = $target.parent('.' + _.options.namespace + 'tag').data()
            ;

            $formElement
              .val('')
              .unbind('change')
              .removeClass(_.options.namespace + 'tagged')
              .trigger('change');

            $target.parent().addClass(_.options.namespace + 'hidden');
            setTimeout(function() {
              $target.parent().remove();
            }, _.options.delete_tag_delay);

            $addTagLink.show();
          });

          $div.append($a);
          $div.append($close);
          $div.append($tagMenu);
          $addMenuWrapper.before($div);
          setTimeout(function() {
            $div.removeClass(_.options.namespace + 'hidden');
          }, _.options.add_tag_delay);
        },

        /**
         * Return the form element title based on the label and selected values
         */
        title: function($formElement) {
          var label = _.tag.label($formElement).text().trim() + ': ',
              val = $formElement.val();

          if (isFormElementValueValid(val)) {
            label += $formElement.val();
          } else {
            label += _.options.tag_label;
          }

          return label;
        },

        /**
         * Return the label element from a form element
         */
        label: function ($formElement) {
          var label = $("label[for='"+ $formElement.attr('id') + "']");

          if(label.length <= 0) {
            var parentElem = $formElement.parent(),
            parentTagName = parentElem.get(0).tagName.toLowerCase();

            if(parentTagName == "label") {
              label = parentElem;
            }
          }

          return label;
        },

        /**
         * Return the form element values
         */
        selectValues: function ($formElement) {
          if ($formElement.is('input')) {
            return $formElement.val();
          }

          if ($formElement.is('select')) {
            var $val;
            var options = $formElement.find('option')
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

          throw new Error('Form element type not supported.');
        },
      }
  }

  function updateAddMenuElementsVisibility() {
    var $element, val, $li;

    $addMenu.find('li')
    .each(function(i, li) {
      $li = $(li);
      $formElement = $li.data();
      val = $formElement.val();
      $li.hide();

      if (!isTagShown($formElement)) {
        $li.show();
      }
    });

    $addMenu.toggleClass('formTag-hidden');
  };

  function isTagShown($element) {
    return $element.hasClass('formTag-tagged');
  }

  function isFormElementValueValid(value) {
    return null !== value &&
      "undefined" !== typeof(value) &&
      value.length > 0 &&
      "?" != value;
  };

  $.fn.formtag = function(options) {
    var len = this.length;

    return this.each(function(index) {
      // Cache a copy of $(this)
      var me = $(this),
        key = 'formTag' + (len > 1 ? '-' + ++index : ''),
        instance = (new formTag).init(me, options);

      // Invoke an formTag instance
      me.data(key, instance).data('key', key);
    });
  };
}));
