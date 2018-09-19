window.slate = window.slate || {};
window.theme = window.theme || {};

/*================ Slate ================*/
// =require slate/a11y.js
// =require slate/cart.js
// =require slate/utils.js
// =require slate/rte.js
// =require slate/sections.js
// =require slate/currency.js
// =require slate/images.js
// =require slate/variants.js
// =require venture.drawer.js


/*================ Sections ================*/
// =require sections/product.js

/*================ Templates ================*/
// =require templates/customers-addresses.js
// =require templates/customers-login.js



$(document).ready(function() {
  var sections = new slate.Sections();
  sections.register('product', theme.Product);

  // Common a11y fixes
  slate.a11y.pageLinkFocus($(window.location.hash));

  $('.in-page-link').on('click', function(evt) {
    slate.a11y.pageLinkFocus($(evt.currentTarget.hash));
  });
  
  $('.MainSlider .Slide').slick( {
        autoplay: true,
        autoplaySpeed: 5000,
        dots: true,
        infinite: true,
        speed: 400,
        arrows: true,
        slidesToShow:1,
        slidesToScroll: 1,
  });
  
  
  
  $('[data-g-variant-id]').click(function(evt) {
      evt.preventDefault(); // cancel default behavior
    
      var selection =  $(this).attr('data-g-variant-id');
      var selector = '[data-single-option-selector] [value="' + selection + '"]';
    console.log ($(selector));
      $(selector).attr("selected",true);
      $('[data-single-option-selector]').trigger('change');
      $('[data-product-select]').trigger('change');
    
    
  });
    
    $('[data-swatch-option]').click(function(evt) {
        evt.preventDefault(); // cancel default behavior
        
        var selection =  $(this).attr('data-swatch-option');
        var selector = '[data-single-option-selector] [value="' + selection + '"]';
        console.log ($(selector));
        $(selector).attr("selected",true);
    
        
        $('[data-single-option-selector]').trigger('change');
        
        //$('[data-product-select]').trigger('change');
        
    });
    
    $( "[data-single-option-selector]" ).change(function() {
        
        $('[data-swatch-option],[data-g-variant-id]').removeClass('--is-selected');
        var selector = '[data-swatch-option="' + $(this).val() + '"]';
        
        $(selector).addClass('--is-selected');
        console.log( "Handler for .change() called."+ selector );
    
        var selector = ' [data-g-variant-id="' + $(this).val() + '"]';
    
        $(selector).addClass('--is-selected');
    
        $('.Owool_Product__option-selected').text($(this).val());
        
    });
    
    
    
    
    $(document).on('cart.ready', function(event, cart) {
        // Event handling here.
        console.log('cart ready ');
    
    });
    
    $(document).on('cart.requestStarted', function(event, cart) {
        // Event handling here.
        console.log('cart request started ');
    });
    $(document).on('cart.requestComplete', function(event, cart) {
        // Event handling here.
        console.log(cart.item_count);
        //updateCartDesc(cart);
        
        updateItemCount( cart.item_count);
    
    });
    
    $('.Owool_Mobile-Header__nav-trigger').click(function(event)
    {
        //alert();
        event.preventDefault(); // cancel default behavior
      //  CartJS.addItem(myVariant.id, $('#Quantity').val());
        $('.Owool_Main-Menu-Mobile ').toggleClass('--is-active');
        //... rest of add logic
    });
    
   // Owool_Main-Menu-Mobile
    
    CartJS.init(myCart);
    
    
    slate.drawersInit = function() {
        slate.LeftDrawer = new slate.Drawers('NavDrawer', 'left');
       // if (theme.settings.cartType === 'drawer'){
           // timber.RightDrawer = new timber.Drawers('CartDrawer', 'right', {
              //  onDrawerOpen: ajaxCart.load
           // });
        //}
    };
    
    
    // Target tables to make them scrollable
  var tableSelectors = '.rte table';

  slate.rte.wrapTable({
    $tables: $(tableSelectors),
    tableWrapperClass: 'rte__table-wrapper',
  });

  // Target iframes to make them responsive
  var iframeSelectors =
    '.rte iframe[src*="youtube.com/embed"],' +
    '.rte iframe[src*="player.vimeo"]';

  slate.rte.wrapIframe({
    $iframes: $(iframeSelectors),
    iframeWrapperClass: 'rte__video-wrapper'
  });

  // Apply a specific class to the html element for browser support of cookies.
  if (slate.cart.cookiesEnabled()) {
    document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
  }
});

function updateItemCount(item_count){
    
    var cart_string= "Cart (" + item_count + " items)" ;
    $('.Owool_Header__cart-item-count > a ').text(cart_string);
}