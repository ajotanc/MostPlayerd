(($) => {
  /**
   * Creates a new TreeMap object with the specified container element and options.
   *
   * @param {Element} container - The container element for the TreeMap.
   * @param {Object} options - The options for configuring the TreeMap.
   */
  function TreeMap(container, options) {
    this.container = container;

    this.rectangle = new Rectangle(
      container.offset().left,
      container.offset().top,
      container.width(),
      container.height()
    );

    const defaults = {
      baseColor: "#00447c",
      color: "#ffffff",
      scrollColor: "#00223e",
      borderColor: "#4c7ca3",
      modal: {
        show: true,
        color: "#ffffff",
        background: "#0160af",
        image: true,
        tags: {
          show: true,
          color: "#00447c",
          background: "#ffffff",
          amount: 5,
        },
      },
    };


    $.extend(true, this, defaults, options);

    $(':root').css('--treemap-scrollbar-color', this.scrollColor);
    $(':root').css('--treemap-base-color', this.baseColor);
    $(':root').css('--treemap-border-color', this.borderColor);
    $(':root').css('--treemap-color', this.color);
    $(':root').css('--treemap-modal-color', this.modal.color);
    $(':root').css('--treemap-modal-background', this.modal.background);
    $(':root').css('--treemap-tags-color', this.modal.tags.color);
    $(':root').css('--treemap-tags-background', this.modal.tags.background);

    $(window).on("resize", () => this.resize());
  }

  /** Creates a new Rectangle object with the specified coordinates, width, height, and margin.
   *
   * Parameters:
   * x: The x-coordinate of the top-left corner of the rectangle.
   * y: The y-coordinate of the top-left corner of the rectangle.
   * width: The width of the rectangle.
   * height: The height of the rectangle.
   * margin: The margin around the rectangle.
   *
   * Returns: None.
   */
  function Rectangle(x, y, width, height, margin) {
    this.x = x;
    this.y = y;
    this.width = Math.floor(width);
    this.height = Math.floor(height);
  }

  /**
   * Returns an object containing the CSS style properties for the rectangle.
   *
   * @return {Object} An object with the following properties:
   * top: The top position of the rectangle in pixels.
   * left: The left position of the rectangle in pixels.
   * width: The width of the rectangle in pixels.
   * height: The height of the rectangle in pixels.
   */
  Rectangle.prototype.style = function () {
    const { x: left, y: top, width, height } = this;

    return {
      top,
      left,
      width: width,
      height: height,
    };
  };

  /**
   * Creates a treemap visualization based on the given nodes.
   *
   * @param {Array} nodes - An array of nodes representing the data for the treemap.
   * @return {void} This function does not return a value.
   */
  TreeMap.prototype.init = function (nodes) {
    this.nodes = nodes; // Save the nodes for future use
    this.draw();
  };

  TreeMap.prototype.draw = function () {
    const nodes = this.squarify(this.nodes, this.rectangle);
    const colors = this.backgroundColor(nodes);

    nodes.forEach((node, index) => {
      const { label, value, url, summary, bounds } = node;

      const [fontSizeFirst, fontSizeSecond] =
        bounds.width <= 120
          ? ["0.9rem", "0.8rem"]
          : bounds.width <= 200
            ? ["1.0rem", "0.9rem"]
            : bounds.width <= 400
              ? ["1.2rem", "1.0rem"]
              : ["1.4rem", "1.2rem"];

      const padding =
        bounds.width <= 120
          ? "0.4rem"
          : bounds.width <= 200
            ? "0.6rem"
            : bounds.width <= 400
              ? "0.8rem"
              : "1.0rem";

      const box = $("<div>").addClass("treemap-box").css(bounds.style());

      const content = $("<div>")
        .addClass("treemap-content")
        .css({
          backgroundColor: colors[index],
          padding,
          cursor: this.modal.show ? "pointer" : "auto",
        })
        .appendTo(box);

      const header = $("<div>").addClass("treemap-header");

      const titleHeader = $("<p>")
        .addClass("treemap-title")
        .css({
          fontSize: fontSizeFirst,
        })
        .text(label);

      header.append(titleHeader);

      const footer = $("<div>").addClass("treemap-footer");

      const titleFooter = $("<p>")
        .addClass("treemap-title")
        .css({
          fontSize: fontSizeSecond,
        })
        .text(`${value} jogadores simultâneos`);

      footer.append(titleFooter);

      const button = $("<a>")
        .addClass("treemap-anchor")
        .attr("href", url)
        .attr("target", "_blank")
        .append($("<i>").addClass("fa fa-link"));

      content.append(header, footer, button);

      box.appendTo(this.container);

      // Events
      box.bind("click", node, (e) => {
        const { label } = e.data;
        const modal = $(`[data-game="${label}"]`);

        if (this.modal.show) {
          if (!modal.length) {
            this.createModal(e);
          }

          modal.remove();
        }
      });

      box.bind("mousemove", node, (e) => {
        this.moveModal(e);
      });

      box.bind("mouseleave", node, (e) => {
        const { label } = e.data;

        $(`[data-game="${label}"]`).remove();
      });
    });
  };

  /**
   * Moves the modal element to the specified coordinates on the page, taking into account the size of the modal and the window.
   *
   * @param {Object} options - An object containing the following properties:
   *   - data: {Object} - An object containing the following properties:
   *     - label: {string} - The label of the modal element.
   *   - pageX: {number} - The x-coordinate of the mouse pointer.
   *   - pageY: {number} - The y-coordinate of the mouse pointer.
   * @return {void} This function does not return anything.
   */
  TreeMap.prototype.moveModal = function ({ data: { label }, pageX, pageY }) {
    const modal = $(`[data-game="${label}"]`);

    if (modal.is(":visible")) {
      const modalDimensions = modal.get(0).getBoundingClientRect();
      const windowDimensions = {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      };
      const offset = 16;

      const windowCenterX = windowDimensions.width / 2;
      const windowCenterY = windowDimensions.height / 2;

      let left = Math.min(
        Math.max(pageX - modalDimensions.width / 2, 0),
        windowDimensions.width - modalDimensions.width
      );

      let top = Math.min(
        Math.max(pageY - modalDimensions.height / 2, 0),
        windowDimensions.height - modalDimensions.height
      );

      if (pageX < windowCenterX) {
        left = Math.min(pageX + offset, windowDimensions.width - modalDimensions.width);
      } else {
        left = Math.max(pageX - modalDimensions.width - offset, 0);
      }

      if (pageY < windowCenterY) {
        top = Math.min(pageY + offset, windowDimensions.height - modalDimensions.height);
      } else {
        top = Math.max(pageY - modalDimensions.height - offset, 0);
      }

      modal.css({ top, left });
    }
  };

  /**
   * Creates a modal dialog with the given   data and appends it to the body of the document.
   *
   * @param {Event} e - The event object containing the data for the modal.
   * @return {void} This function does not return a value.
   */
  TreeMap.prototype.createModal = function (e) {
    const { label, summary } = e.data;
    const { description, tags, image, developers, distributors, releaseDate } =
      summary;

    const modal = $("<div>")
      .addClass("treemap-modal")
      .attr("data-game", label)

    const body = $("<div>").addClass("treemap-modal-body").appendTo(modal);

    if (this.modal.image) {
      $("<img>")
        .addClass("treemap-modal-image")
        .attr("src", image)
        .appendTo(body);
    }

    $("<p>").addClass("treemap-modal-title").text(label).appendTo(body);
    $("<p>")
      .addClass("treemap-modal-description")
      .text(description)
      .appendTo(body);

    if (developers.length > 0) {
      const textDeveloperss = developers.join(", ");
      $("<p>")
        .addClass("treemap-modal-developers")
        .text(`Desenvolvedor: ${textDeveloperss}`)
        .appendTo(body);
    }

    if (distributors.length > 0) {
      const textDistributors = distributors.join(", ");
      $("<p>")
        .addClass("treemap-modal-distributors")
        .text(`Distribuidora: ${textDistributors}`)
        .appendTo(body);
    }

    if (releaseDate) {
      const date = new Date(releaseDate).toLocaleDateString("pt-BR");
      $("<p>")
        .addClass("treemap-modal-release-date")
        .text(`Data de Lançamento: ${date}`)
        .appendTo(body);
    }

    if (this.modal.tags?.show) {
      if (tags.length > 0) {
        const tagsContainer = $("<div>").addClass("treemap-tags");
        const tagsAmount =
          this.modal.tags.amount === "all"
            ? tags.length
            : this.modal.tags.amount;

        // biome-ignore lint/complexity/noForEach: <explanation>
        tags.slice(0, tagsAmount).forEach((tag) => {
          tagsContainer.append(
            $("<span>")
              .addClass("treemap-tag")
              .text(tag)
          );
        });

        body.append(tagsContainer);
      }
    }

    $("body").append(modal);

    this.moveModal(e);
  };

  /**
   * Generates an array of RGBA color strings based on the given nodes and base color.
   *
   * @param {Array} nodes - An array of objects containing a 'value' property.
   * @param {number} [alpha=1] - The alpha value for the generated colors.
   * @return {Array} An array of RGBA color strings.
   */
  TreeMap.prototype.backgroundColor = function (nodes, alpha = 1) {
    const min = Math.min(...nodes.map((node) => node.value));
    const max = Math.max(...nodes.map((node) => node.value));

    const baseRGB = hexToRgb(this.baseColor);

    return nodes.map((node) => {
      const normalizedValue = node.value / (max - min);
      const r = Math.floor(normalizedValue * baseRGB.r);
      const g = Math.floor(normalizedValue * baseRGB.g);
      const b = Math.floor(normalizedValue * baseRGB.b);

      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    });

    function hexToRgb(hex) {
      const bigint = Number.parseInt(hex.substring(1), 16);

      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      };
    }
  };

  /**
   * Sorts the given nodes in descending order based on their value and divides the given rectangle
   * into smaller rectangles to represent the nodes.
   *
   * @param {Array} nodes - The array of nodes to be sorted and divided into rectangles.
   * @param {Object} rectangle - The rectangle object representing the area to be divided.
   * @return {Array} The sorted array of nodes.
   */
  TreeMap.prototype.squarify = function (nodes, rectangle) {
    nodes.sort((a, b) => b.value - a.value);

    this.layout(nodes, rectangle);

    return nodes;
  };

  /**
   * Divides the given rectangle into smaller rectangles to represent the nodes.
   *
   * @param {Array} nodes - The array of nodes to be divided into rectangles.
   * @param {Object} rectangle - The rectangle object representing the area to be divided.
   * @return {void}
   */
  TreeMap.prototype.layout = function (nodes, rectangle) {
    if (nodes.length === 1) {
      nodes[0].bounds = rectangle;
      return;
    }

    const { x, y, width, height } = rectangle;
    const {
      leftSide,
      totalLeftSide,
      rightSide,
      totalRightSide,
      totalSumSides,
    } = this.split(nodes);

    if (width > height) {
      const newCalculatedWidth = Math.floor(
        (totalLeftSide * width) / totalSumSides
      );

      this.layout(leftSide, new Rectangle(x, y, newCalculatedWidth, height));
      this.layout(
        rightSide,
        new Rectangle(
          x + newCalculatedWidth,
          y,
          width - newCalculatedWidth,
          height
        )
      );
    } else {
      const newCalculatedWidth = Math.floor(
        (totalLeftSide * height) / totalSumSides
      );

      this.layout(leftSide, new Rectangle(x, y, width, newCalculatedWidth));
      this.layout(
        rightSide,
        new Rectangle(
          x,
          y + newCalculatedWidth,
          width,
          height - newCalculatedWidth
        )
      );
    }
  };

  /**
   * Splits an array of nodes into two arrays based on their values.
   *
   * @param {Array} nodes - The array of nodes to be split.
   * @returns {Object} - An object with two arrays: 'leftSide', 'rightSide' and values 'generalSum', 'totalSum'.
   */
  TreeMap.prototype.split = function (nodes) {
    const totalSumSides = this.sum(nodes);
    const halfValue = totalSumSides / 2;

    let accumulator = 0;

    const leftSide = [];
    const rightSide = [];

    nodes.forEach((node, index) => {
      if (index > 0 && accumulator + node.value > halfValue) {
        rightSide.push(node);
      } else {
        leftSide.push(node);
      }

      accumulator += node.value;
    });

    return {
      leftSide,
      totalLeftSide: this.sum(leftSide),
      rightSide,
      totalRightSide: this.sum(rightSide),
      totalSumSides,
    };
  };

  /**
   * Calculates the sum of the values of an array of nodes.
   *
   * @param {Array} nodes - The array of nodes to calculate the sum of.
   * @return {number} The sum of the values of the nodes.
   */
  TreeMap.prototype.sum = (nodes) =>
    nodes.reduce((accumulator, node) => accumulator + node.value, 0);

  TreeMap.prototype.resize = function () {
    this.rectangle.width = this.container.width();
    this.rectangle.height = this.container.height();
    this.draw();
  };

  /**
   * Initializes a treemap on the selected jQuery element using the provided data and options.
   *
   * @param {Array} data - The data to be displayed in the treemap.
   * @param {Object} options - The options for configuring the treemap.
   * @return {jQuery} - The jQuery object representing the selected element.
   */
  $.fn.treemap = function (data, options) {
    new TreeMap(this, options).init(data);
  };
})(jQuery);
