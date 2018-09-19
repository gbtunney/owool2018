/*============================================================================
  Drawer modules
  - Docs http://shopify.github.io/slate/#drawers
==============================================================================*/
slate.Drawers = (function() {
    var Drawer = function(id, position, options) {
        var defaults = {
            close: '.js-drawer-close',
            open: '.js-drawer-open-button-' + position,
            openButtonLeftClass: 'js-drawer-open-button-left',
            drawerLeftClass: 'drawer--left',
            drawerRightClass: 'drawer--right',
            openClass: 'js-drawer-open',
            dirOpenClass: 'js-drawer-open-' + position
        };
        
        this.nodes = {
            $parent: $('body, html'),
            $page: $('#PageContainer'),
            $moved: $('.page-container')
        };
        
        this.config = $.extend(defaults, options);
        this.position = position;
        
        this.$drawer = $('#' + id);
        
        if (!this.$drawer.length){
            return false;
        }
        
        this.drawerIsOpen = false;
        this.init();
    };
    
    Drawer.prototype.init = function() {
        var $openBtn = $(this.config.open);
        
        // Add aria controls
        $openBtn.attr('aria-expanded', 'false');
        
        $openBtn.on('click', $.proxy(this.open, this));
        this.$drawer.find(this.config.close).on('click', $.proxy(this.close, this));
    };
    
    Drawer.prototype.open = function(evt) {
        // Keep track if drawer was opened from a click, or called by another function
        var externalCall = false;
        
        // Other drawers that might be open (will be closed later)
        var $otherDrawers = $('.drawer').not(this.$drawer);
        
        // don't open an opened drawer
        if (this.drawerIsOpen){
            if (evt){
                evt.preventDefault();
            }
            return;
        }
        
        // Close other drawers if they are open
        var self = this;
        $otherDrawers.each(function() {
            if (!$(this).hasClass(self.config.openClass)){
                return;
            }
            
            if ($(this).hasClass(self.config.drawerLeftClass)){
                slate.LeftDrawer.close();
            }
            
            if ($(this).hasClass(self.config.drawerRightClass)){
                slate.RightDrawer.close();
            }
        });
        
        // Prevent following href if link is clicked
        if (evt){
            evt.preventDefault();
        } else {
            externalCall = true;
        }
        
        // Without this, the drawer opens, the click event bubbles up to $nodes.page
        // which closes the drawer.
        if (evt && evt.stopPropagation){
            evt.stopPropagation();
            // save the source of the click, we'll focus to this on close
            this.$activeSource = $(evt.currentTarget);
        }
        
        if (this.drawerIsOpen && !externalCall){
            return this.close();
        }
        
        // Add is-transitioning class to moved elements on open so drawer can have
        // transition for close animation
        this.nodes.$moved.addClass('is-transitioning');
        this.$drawer.prepareTransition();
        
        this.nodes.$parent.addClass(
            this.config.openClass + ' ' + this.config.dirOpenClass
        );
        this.$drawer.addClass(this.config.openClass);
        
        this.drawerIsOpen = true;
        
        // Set focus on drawer
        Drawer.prototype.trapFocus({
            $container: this.$drawer,
            namespace: 'drawer_focus'
        });
        
        // Run function when drawer opens if set
        if (
            this.config.onDrawerOpen &&
            typeof this.config.onDrawerOpen === 'function'
        ){
            if (!externalCall){
                this.config.onDrawerOpen();
            }
        }
        
        if (this.$activeSource && this.$activeSource.attr('aria-expanded')){
            this.$activeSource.attr('aria-expanded', 'true');
        }
        
        this.bindEvents();
    };
    
    Drawer.prototype.close = function(evt) {
        // don't close a closed drawer
        if (!this.drawerIsOpen){
            return;
        }
        
        evt.preventDefault();
        
        // deselect any focused form elements
        $(document.activeElement).trigger('blur');
        
        // Ensure closing transition is applied to moved elements, like the nav
        this.nodes.$moved.prepareTransition({disableExisting: true});
        this.$drawer.prepareTransition({disableExisting: true});
        
        this.nodes.$parent.removeClass(
            this.config.dirOpenClass + ' ' + this.config.openClass
        );
        this.$drawer.removeClass(this.config.openClass);
        
        // Remove focus on drawer
        Drawer.prototype.removeTrapFocus({
            $container: this.$drawer,
            namespace: 'drawer_focus'
        });
        
        if (this.$activeSource && this.$activeSource.attr('aria-expanded')){
            this.$activeSource.attr('aria-expanded', 'false');
        }
        
        this.drawerIsOpen = false;
        
        this.unbindEvents();
    };
    
    /**
     * Traps the focus in a particular container
     *
     * @param {object} options - Options to be used
     * @param {jQuery} options.$container - Container to trap focus within
     * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
     * @param {string} options.namespace - Namespace used for new focus event handler
     */
    Drawer.prototype.trapFocus = function(options) {
        var eventName = options.namespace
            ? 'focusin.' + options.namespace
            : 'focusin';
        
        if (!options.$elementToFocus){
            options.$elementToFocus = options.$container;
            options.$container.attr('tabindex', '-1');
        }
        
        options.$elementToFocus.focus();
        
        $(document).on(eventName, function(evt) {
            if (
                options.$container[0] !== evt.target &&
                !options.$container.has(evt.target).length
            ){
                options.$container.focus();
            }
        });
    };
    
    /**
     * Removes the trap of focus in a particular container
     *
     * @param {object} options - Options to be used
     * @param {jQuery} options.$container - Container to trap focus within
     * @param {string} options.namespace - Namespace used for new focus event handler
     */
    Drawer.prototype.removeTrapFocus = function(options) {
        var eventName = options.namespace
            ? 'focusin.' + options.namespace
            : 'focusin';
        
        if (options.$container && options.$container.length){
            options.$container.removeAttr('tabindex');
        }
        
        $(document).off(eventName);
    };
    
    Drawer.prototype.bindEvents = function() {
        // Lock scrolling on mobile
        this.nodes.$page.on('touchmove.drawer', function() {
            return false;
        });
        
        this.$drawer.on('click.drawer', function(event) {
            event.stopPropagation();
        });
        
        $('.page-container').on('click.drawer', this.close.bind(this));
        // Pressing escape closes drawer
        this.nodes.$parent.on(
            'keyup.drawer',
            $.proxy(function(evt) {
                // The hamburger 'open' button changes to a 'close' button when the drawer
                // is open. Clicking on it will close the drawer.
                if (this.$activeSource !== undefined){
                    this.$activeSource.on(
                        'click.drawer',
                        $.proxy(function() {
                            if (
                                !this.$activeSource.hasClass(this.config.openButtonLeftClass)
                            ){
                                return;
                            }
                            
                            this.close();
                        }, this)
                    );
                }
                if (evt.keyCode === 27){
                    this.close();
                }
            }, this)
        );
    };
    
    Drawer.prototype.unbindEvents = function() {
        if (this.$activeSource !== undefined){
            this.$activeSource.off('.drawer');
        }
        this.nodes.$page.off('.drawer');
        this.nodes.$parent.off('.drawer');
    };
    
    return Drawer;
})();
