// Inspired by jquery.fittext (https://github.com/davatron5000/FitText.js)
(function($) {
  $.fn.fitButtons = function(buttonSelector) {
    return this.each(function() {
      var $this = $(this);

      var resizer = function() {
        var containerWidth = $this.width();
        if (containerWidth) {
          var fontSizeInRem = Math.max(0.5, containerWidth * 0.0053 - 0.1265);
          var paddingLeftRightInRem = fontSizeInRem / 2;

          var buttons = $this.find(buttonSelector);
          buttons.css('font-size', fontSizeInRem + 'rem');
          buttons.css('padding', `0.375rem ${paddingLeftRightInRem}rem`);
        }
      };

      resizer();

      $(window).on('resize.fitbuttons orientationchange.fitbuttons', resizer);
    });
  };
})(jQuery);
