'use strict';

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

  var FormTag = function() {
      var _ = this;
      formElements = [];

      //default options
      _.options =  {
        add_button_text: '+ Add Field',
        tag_label: '~',
        namespace: 'formTag-',
        delete_tag_delay: 0,
        add_tag_delay: 0,
        value_to_text: true,
        max_1_opened_dropdown: true,
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
          $('.' + _.options.namespace + 'values').hide(); //hide dropdown menu from other tags

          _.updateAddMenuElementsVisibility();
          return false;
        });

        $form.after($wrapper);
        _.initMenu();
        $addMenuWrapper.append($addTagLink);
        $wrapper.append($addMenuWrapper);

        // Generate tags for form elements set
        _.tag.init();

        // close tag menu on click
        $(document).unbind('click').click(function(e) {
          var $target = $(e.target);
          if (0 === $target.parents('.' + _.options.namespace + 'values').length) {
            $('.' + _.options.namespace + 'tag').each(function() {
              _.updateFormElementValueFromTag($(this));
              $(this).find('.' + _.options.namespace + 'values').each(function() {
                $(this).hide();
              });
            });
          } else {
            if ($target.hasClass(_.options.namespace + 'radio')) {
              $target.parent().find('li.selected').removeClass('selected');
            }

            $target.toggleClass('selected');
          }

          $addMenu.addClass(_.options.namespace + 'hidden');
        });


        $(document).unbind('keypress').keypress(function(e) {
          var $target = $(e.target),
              $tagParent = $target.parents('.' + _.options.namespace + 'tag');

          if ($tagParent.length > 0 && 13 == e.keyCode) { //ENTER
            $target.parents('.' + _.options.namespace + 'values').hide();
            _.updateFormElementValueFromTag($tagParent);
          }
        });

        return _;
      };

      _.updateFormElementValueFromTag = function($tag) {
        var $formElement = $tag.data(), val = '';

        if ($formElement.is('select')) {
          val = [];
          $tag.find('.selected')
          .each(function(i, e) {
            val.push($(e).attr('data-value'));
          });
        }

        if ($formElement.is('input')) {
          val = $tag.find('input[type="text"]').val();
        }

        if (val != $formElement.val()) {
          $formElement.val(val).trigger('change');
        }
      };


      /**
       * Build the add element menu from form labels.
       */
      _.initMenu = function() {
        var val, $li;

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

          $addMenu.addClass(_.options.namespace + 'hidden');

          //all form elements are displayed
          if (formElements.length == $wrapper.find('.' + _.options.namespace + 'tag').length) {
            $addTagLink.hide();
            return false;
          }

          return false;
        });
      };

      _.updateAddMenuElementsVisibility = function() {
        var val, $li, $formElement;

        $addMenu.find('li')
        .each(function(i, li) {
          $li = $(li);
          $formElement = $li.data();
          val = $formElement.val();
          $li.hide();

          if (!$formElement.hasClass(_.options.namespace + 'tagged')) {
            $li.show();
          }
        });

        $addMenu.toggleClass(_.options.namespace + 'hidden');
      };

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
            var $div, $a, $close, $tagMenu, $e, $input;

            if ($formElement.hasClass(_.options.namespace + 'tagged')) {
              if($formElement.val() === '') {
                $formElement.removeClass(_.options.namespace + 'tagged');
                return;
              }
            }

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
              $tagMenu.addClass(_.options.namespace + 'list');
              var values = _.tag.selectValues($formElement),
                  multiple = $formElement.attr('multiple'),
                  formElementName = $formElement.attr('name');

              $(values)
              .each(function(i, el) {
                $e = $('<li/>');
                $e.attr('data-value', el[1]),
                $e.html(el[0]);

                if (multiple) {
                  $e.addClass(_.options.namespace + 'checkbox');

                  if ($.inArray(el[1], $formElement.val()) !== -1) {
                    $e.addClass('selected');
                  }
                } else {
                  $e.addClass(_.options.namespace + 'radio');
                  if (el[1] == $formElement.val()) {
                    $e.addClass('selected');
                  }
                }

                $tagMenu.append($e);
              });
            }

            if ($formElement.is('input')) {
              var $input = $formElement.clone(true, true).removeAttr('id');

              $e = $('<li/>');
              $e.append($input);
              $tagMenu.append($e);
            }

            $a = $('<a/>').html(_.tag.title($formElement));
            $a.on('click', function(e) {
              var $tagMenu = $(this).parent().find('.' + _.options.namespace + 'values');

              if (_.options.max_1_opened_dropdown) {
                $('.' + _.options.namespace + 'values').not($tagMenu).hide(); //hide others tag menu
              }

              if ($tagMenu.is(':hidden')) {
                $tagMenu.show();
                _.updateFormElementValueFromTag($(this).parents('.' + _.options.namespace + 'tag'));
              } else {
                $tagMenu.hide();
              }

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

              return false;
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
                $span = $('<span/>'),
                $div = $('<div />'),
                val = $formElement.val();

            if (isFormElementValueValid(val)) {
              if($formElement.find("option").length > 0 && _.options.value_to_text) {
                var $formElementArray = $formElement.find(":selected");

                if($formElementArray.length < 2) {
                  $span.html($formElementArray.text());
                } else {
                  for(var i = 0; i < $formElementArray.length; i++) {
                    if(i !== 0) {
                      $span.html($span.html() + ', ');
                    }

                    $span.html($span.html() + $formElementArray[i].innerHTML);
                  }
                }
              } else {
                $span.html($formElement.val());
              }
            } else {
              $span.html(_.options.tag_label);
            }

            $div.append($span);

            return label + $div.html();
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

              if($formElement.is(":checkbox")) {

                var searchIDs = $( $formElement + ":checkbox").map(function(a, e){
                  return this.value;
                }).toArray();

              }

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
        };
    };

  function isFormElementValueValid(value) {
    return null !== value &&
      "undefined" !== typeof(value) &&
      value.length > 0 &&
      "?" != value &&
      'default' != value &&
      '' !== value;
  }

  $.fn.formtag = function(options) {
    var len = this.length;

    return this.each(function(index) {
      // Cache a copy of $(this)
      var me = $(this),
        key = 'formTag' + (len > 1 ? '-' + ++index : ''),
        instance = (new FormTag()).init(me, options);

      // Invoke an formTag instance
      me.data(key, instance).data('key', key);
    });
  };
}));
