// Create an immediately invoked functional expression to wrap our code
(function(){
  var privateVar = "You cann't access me in the console";

  // Define our constructor
  this.Modal = function(){

    // Create global element references
    this.closeButton = null;
    this.modal = null;
    this.overlay = null;

    // Define option defaults
    var defaults = {
      className: "fade-and-drop",
      closeButton: true,
      maxWidth: 600,
      minWidth: 280,
      overlay: true,
      content: ""
    };

    // Create options by extending defaults with the passed in arguments
    if(arguments[0] && typeof arguments[0] === "object"){
      this.options = extendDefaults(defaults, arguments[0]);
    }

    // Public methods
    Modal.prototype.open = function(){
      // Build our modal
      buildOut.call(this);

      // Initialize our listeners
      initializeEvents.call(this);

      /*
       * After adding elements to the DOM, use getComputedStyle
       * to force browser to recalculate and recognize the elements
       * that we just added. This is so that CSS animation has a
       * start point.
       */

      window.getComputedStyle(this.modal).height;

      /*
       * Add our open class and check if the modal is taller than the window.
       * If so, our anchored class is also applied
       */
      this.modal.className = this.modal.className +
        (this.modal.offsetHeight > window.innerHeight ?
         " scotch-open scotch-anchored" : " scotch-open");
      this.overlay.className = this.overlay.className + " scotch-open";
    };

    Modal.prototype.close = function(){
      // Store the value of this
      var _ = this;

      // Remove the open class name
      this.modal.className = this.modal.className.replace(" scotch-open", "");
      this.overlay.className = this.overlay.className.replace(" scotch-open", "");

      /* Listen for CSS transitioned event and then
       * remove the nodes from the DOM
       */
      // Determine proper prefix
      this.transitionEnd = transitionSelect();
      this.modal.addEventListener(this.transitionEnd, function(){
        _.modal.parentNode.removeChild(_.modal);
      });
      this.overlay.addEventListener(this.transitionEnd, function(){
        if(_.overlay.parentNode)
          _.overlay.parentNode.removeChild(_.overlay);
      });
    };

  };


  // Private methods
  
  // Utility method to extend defaults with user options
  function extendDefaults(source, properties){
    var property;
    for(property in properties){
      if(properties.hasOwnProperty(property)){
        source[property] = properties[property];
      }
    }
    return source;
  }

  // Utility method to determine which transitionend event is supported
  function transitionSelect(){
    var el = document.createElement("div");
    if(el.style.webkitTransitionEnd) return "webkitTransitionEnd";
    if(el.style.oTransitionEnd) return "oTransitionEnd";
    return "transitionend";
  }

  // Build out the modal
  function buildOut(){
    var content, contentHolder, docFrag;

    // If content is an html string, append the HTML string.
    // If content is a domNode, append its content
    if(typeof this.options.content === "string"){
      content = this.options.content;
    }else{
      content = this.options.content.innerHTML;
    }

    // Create a documentFragment to build with
    docFrag = document.createDocumentFragment();

    // Create a modal element
    this.modal = document.createElement("div");
    this.modal.className = "scotch-modal " + this.options.className;
    this.modal.style.maxWidth = this.options.maxWidth + "px";
    this.modal.style.minWidth = this.options.minWidth + "px";

    // If this.options.closeButton is true, create a close button
    if(this.options.closeButton === true){
      this.closeButton = document.createElement("button");
      this.closeButton.className = "scotch-close close-button";
      this.closeButton.innerHTML = "知道了？点我";
      this.modal.appendChild(this.closeButton);
    }

    // If overlay is true, add one
    if(this.options.overlay === true){
      this.overlay = document.createElement("div");
      this.overlay.className = "scotch-overlay " + this.options.className;
      docFrag.appendChild(this.overlay);
    }

    // Create an content area and append it to modal
    contentHolder = document.createElement("div");
    contentHolder.className = "scotch-content";
    contentHolder.innerHTML = content;
    this.modal.appendChild(contentHolder);

    // Append modal to documentFragment
    docFrag.appendChild(this.modal);

    // Append documentFragment to body
    document.body.appendChild(docFrag);
  }

  function initializeEvents(){
    if(this.closeButton){
      this.closeButton.addEventListener("click", this.close.bind(this));
    }

    if(this.overlay){
      this.overlay.addEventListener("click", this.close.bind(this));
    }
  }

}());

function test(){
  var content = "<p>左右方向键，跑动；上方向键，跳动</p>" +
    "<p>触摸屏：触摸跳动</p>"
  var modal = new Modal({
    content: content,
    maxWidth: 600
  });
  modal.open();
}
test();
