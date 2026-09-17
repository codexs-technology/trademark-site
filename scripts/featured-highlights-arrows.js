(function ($, Drupal, once) {
  /**
   * Keeps a single dot list in this carousel's nav (setPosition/rebuild can duplicate dots,
   * especially with appendDots targeting multiple `.featured-highlights__nav` nodes).
   *
   * @param {jQuery} $root - `.slick--optionset--uspto-featured-highlights`
   */
  function scopeFeaturedHighlightsDots($root) {
    const $slider = $root.children('.slick__slider');
    const $nav = $root.find('.featured-highlights__nav').first();
    if (!$nav.length || !$slider.length || !$slider.hasClass('slick-initialized')) {
      return;
    }
    try {
      const slick = $slider.slick('getSlick');
      if (!slick || !slick.$dots || !slick.$dots.length) {
        return;
      }
      const $primaryDots = slick.$dots.first();
      slick.$dots.not($primaryDots).remove();

      const primaryEl = $primaryDots.get(0);
      $nav.find('.carousel-indicators').each(function () {
        if (this !== primaryEl) {
          $(this).remove();
        }
      });

      $nav.append($primaryDots);
      $nav.find('.carousel-indicators').slice(1).remove();
    }
    catch (_err) {
      // No-op.
    }
  }

  Drupal.behaviors.usptoFeaturedHighlightsArrows = {
    attach(context) {
      const roots = once(
        'usptoFeaturedHighlightsArrows',
        '.slick--optionset--uspto-featured-highlights',
        context,
      );

      $(roots).each(function () {
        const $root = $(this);
        const $slider = $root.children('.slick__slider');
        const $nav = $root.find('.featured-highlights__nav').first();

        const setPosition = () => {
          if ($slider.length && $slider.hasClass('slick-initialized')) {
            try {
              $slider.slick('setPosition');
            }
            catch (_err) {
              // Slick unavailable or not ready.
            }
          }
          scopeFeaturedHighlightsDots($root);
        };

        // Slick can measure the grid before `min-width:0` constraints apply; recalc after paint.
        requestAnimationFrame(() => {
          requestAnimationFrame(setPosition);
        });

        // If Slick initializes after attach, move dots on init/reInit.
        $slider.on('init.usptoFeaturedHighlights reInit.usptoFeaturedHighlights', () => {
          scopeFeaturedHighlightsDots($root);
        });

        // If Slick was already initialized before this behavior ran, fix immediately.
        scopeFeaturedHighlightsDots($root);

        $root.on('click', '.slick__arrow .slick-prev, .slick__arrow .slick-next', function (e) {
          const $btn = $(this);
          const isPrev = $btn.hasClass('slick-prev');
          const isNext = $btn.hasClass('slick-next');
          if (!isPrev && !isNext) return;

          // Always resolve the slider within THIS featured-highlights instance.
          // Using a global selector (e.g. "#id") breaks when multiple sliders exist or IDs collide.
          const $instance = $btn.closest('.slick--optionset--uspto-featured-highlights');
          const $sliderClick = $instance.find('> .slick__slider').first();
          if (!$sliderClick.length) return;

          // Only intercept when Slick is actually initialized (avoid breaking default wiring).
          if (!$sliderClick.hasClass('slick-initialized')) return;

          e.preventDefault();
          e.stopPropagation();

          try {
            $sliderClick.slick(isPrev ? 'slickPrev' : 'slickNext');
          }
          catch (_err) {
            // No-op: if slick isn't available for some reason, don't break the page.
          }
        });
      });

      // One resize listener for all instances ( avoids stacking handlers per carousel ).
      if (roots.length && !Drupal.behaviors.usptoFeaturedHighlightsArrows._resizeBound) {
        Drupal.behaviors.usptoFeaturedHighlightsArrows._resizeBound = true;
        let resizeTimer;
        $(window).on('resize.usptoFeaturedHighlights', () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            $('.slick--optionset--uspto-featured-highlights > .slick__slider.slick-initialized').each(function () {
              const $sliderResize = $(this);
              const $rootResize = $sliderResize.closest('.slick--optionset--uspto-featured-highlights');
              try {
                $sliderResize.slick('setPosition');
              }
              catch (_err) {
                // No-op.
              }
              scopeFeaturedHighlightsDots($rootResize);
            });
          }, 150);
        });
      }
    },
  };
})(jQuery, Drupal, once);
