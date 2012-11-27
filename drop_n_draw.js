// constructor
var DropAndDraw = function(canvas) {
  var dnd = this;

  // init canvas
  this.initCanvas = function() {
    this.ctx.fillStyle = this.graph_margin_color;
    this.ctx.fillRect(0, 0, this.cvs_w, this.cvs_h)
    this.ctx.fillStyle = this.graph_body_color;
    this.ctx.fillRect(this.margin_l, this.margin_t,
                      this.cvs_w - this.margin_l - this.margin_r,
                      this.cvs_h - this.margin_t - this.margin_b)
  };

  // assign preset color 
  this.getPresetColor = function() {
    var color = this.color_list[this.color_idx];
    if (++this.color_idx == this.color_list.length)
      this.color_idx = 0;
    return color;
  };

  this.calcRange = function(x, y) {
    for (var i = 0; i < x.length; i++) {
      if (x[i] != null) {
        if ((this.x_min == null) || (x[i] < this.x_min))
          this.x_min = x[i];
        if ((this.x_max == null) || (x[i] > this.x_max))
          this.x_max = x[i];
      }
      if (y[i] != null) {
        if ((this.y_min == null) || (y[i] < this.y_min))
          this.y_min = y[i];
        if ((this.y_max == null) || (y[i] > this.y_max))
          this.y_max = y[i];
      }
    }

    // update x_rate/y_rate
    this.x_rate = (this.cvs_w - this.margin_l - this.margin_r) /
                  (this.x_max - this.x_min);
    this.y_rate = (this.cvs_h - this.margin_t - this.margin_b) /
                  (this.y_max - this.y_min);
  };

  this.x2cvs = function(x) {
    return (x - this.x_min) * this.x_rate + this.margin_l;
  };
  this.y2cvs = function(y) {
    return (this.y_max - y) * this.y_rate + this.margin_t;
  };

  this.drawGraph = function(x, y, color) {
    this.ctx.save();
    this.ctx.lineWidth = this.graph_line_width;
    if (color)
      this.ctx.strokeStyle = color;
    this.ctx.shadowBlur = 5;
    this.ctx.shadowColor = 'black';
    this.ctx.shadowOffsetX = 5;
    this.ctx.shadowOffsetY = 5;
    this.ctx.beginPath();

    var split = 1;
    for (var i = 0; i < x.length; i++) {
      if ((x[i] == null) || (y[i] == null)) {
        split = 1;
      } else {
        if (split)
          this.ctx.moveTo(this.x2cvs(x[i]), this.y2cvs(y[i]));
        else
          this.ctx.lineTo(this.x2cvs(x[i]), this.y2cvs(y[i]));
        split = 0;
      }
    }
    this.ctx.stroke();
    this.ctx.restore();
  };

  this.drawXScale = function(step, level, en_label) {
    var scale_start_unit = Math.ceil(this.x_min / step);
    var scale_end_unit = Math.floor(this.x_max / step);

    this.ctx.save();

    this.ctx.strokeStyle = this.scale_color[level];
    this.ctx.lineWidth = 0;
    this.ctx.font = "100 12px 'Arial'";
    this.ctx.fillStyle = this.scale_text_color;
    this.ctx.textAlign = 'center';

    for (var i = scale_start_unit; i <= scale_end_unit; i++) {
      var x = step * i;

      this.ctx.beginPath();
      this.ctx.moveTo(this.x2cvs(x), this.margin_t);
      this.ctx.lineTo(this.x2cvs(x), this.cvs_h - this.margin_b);
      this.ctx.stroke();
      var txt = (step < 1.0) ?
        x.toFixed(Math.ceil(-Math.log(step) / Math.LN10)) : x;
      if (en_label)
        this.ctx.fillText(txt, this.x2cvs(x), this.cvs_h - this.margin_b + 12);
    }
    this.ctx.restore();
  };

  this.drawYScale = function(step, level, en_label) {
    var scale_start_unit = Math.ceil(this.y_min / step);
    var scale_end_unit = Math.floor(this.y_max / step);

    this.ctx.save();

    this.ctx.strokeStyle = this.scale_color[level];
    this.ctx.lineWidth = 0;
    this.ctx.font = "100 12px 'Arial'";
    this.ctx.fillStyle = this.scale_text_color;
    this.ctx.textAlign = 'right';

    for (var i = scale_start_unit; i <= scale_end_unit; i++) {
      var y = step * i;

      this.ctx.beginPath();
      this.ctx.moveTo(this.margin_l, this.y2cvs(y));
      this.ctx.lineTo(this.cvs_w - this.margin_r, this.y2cvs(y));
      this.ctx.stroke();
      var txt = (step < 1.0) ?
        y.toFixed(Math.ceil(-Math.log(step) / Math.LN10)) : y;
      if (en_label)
        this.ctx.fillText(txt, this.margin_l, this.y2cvs(y) + 6);
    }
    this.ctx.restore();
  };

  this.drawScale = function() {
    var x_order = Math.floor(Math.log(this.x_max - this.x_min) / Math.LN10);
    var x_step = Math.pow(10, x_order);
    var y_order = Math.floor(Math.log(this.y_max - this.y_min) / Math.LN10);
    var y_step = Math.pow(10, y_order);

    this.drawXScale(x_step / 10, 2, false);
    this.drawYScale(y_step / 10, 2, false);
    this.drawXScale(x_step / 2, 1, true);
    this.drawYScale(y_step / 2, 1, true);
    this.drawXScale(x_step, 0, false);
    this.drawYScale(y_step, 0, false);
  };

  this.drawLegend = function(idx, label, color) {
    this.ctx.save();

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = this.graph_line_width;
    this.ctx.font = "100 12px 'Arial'";
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = "left";

    var y_base = this.margin_t + 36 * idx;
    this.ctx.beginPath();
    this.ctx.moveTo(this.cvs_w - this.margin_r + 5, y_base + 6);
    this.ctx.lineTo(this.cvs_w - this.margin_r + 25, y_base + 6);
    this.ctx.stroke();
    this.ctx.fillText(label, this.cvs_w - this.margin_r + 5, y_base + 24);

    this.ctx.restore();
  };

  // draw graph
  this.draw = function() {
    // clear canvas
    this.initCanvas();

    // draw scale
    this.drawScale();

    for (var i = 0; i < this.dobj_list.length; i++) {
      var dobj = this.dobj_list[i];
      // draw graph
      this.drawGraph(dobj.x, dobj.y, dobj.color);
      // draw legend
      this.drawLegend(i, dobj.label, dobj.color);
    }
  };

  // parse file data
  this.parseData = function(filename, fimg) {
    var obj = eval('([' + fimg + '])');
    var data_set = {};

    // construct new data object
    // if the whole data is an object, take is as a data_set which contains
    // label[], color[](opt), and data[].
    // otherwise, take it as a data array.
    if (typeof obj[0] == 'object') {
      nr_items = obj[0].label.length + 1;
      data_set = obj[0];
    } else {
      // detect how many data series it contains
      var line = fimg.substring(0, fimg.indexOf('\n'));
      var items = line.split(',');
      nr_items = items.length - 1; // assuming a line like "1, 3.5, 2.2,"
      data_set.data = obj;
    }

    var series = new Array(nr_items);
    for (var j = 0; j < nr_items; j++)
      series[j] = [];
    for (var i = 0; i < data_set.data.length; i += nr_items)
      for (var j = 0; j < nr_items; j++)
        series[j].push(data_set.data[i + j]);

    for (var i = 0; i < nr_items - 1; i++) {
      var dobj = {
        "x": series[0],
        "y": series[i + 1]
      };

      // if the label is not specified, use the file name
      if (typeof data_set.label != 'undefined')
        dobj.label = data_set.label[i];
      else if (nr_items == 2)
        dobj.label = filename;
      else
        dobj.label = filename + '-' + (i + 1);

      // if the color is not specified, assign arbitrary
      if (typeof data_set.color != 'undefined')
        dobj.color = data_set.color[i];
      else
        dobj.color = this.getPresetColor();

      // push new data to the list
      this.dobj_list.push(dobj);

      // update data range
      this.calcRange(dobj.x, dobj.y);
    }
  };

  // read file
  this.readFile = function(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      dnd.parseData(file.name, e.target.result);
      dnd.draw();
    };
    reader.readAsText(file, "utf-8");
  };

  // drop handler
  this.onDropFile = function(e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    dnd.readFile(file);
  };

  // dragover handler
  this.onDragOver = function(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    return false;
  };

  // dragenter handler
  this.onDragEnter = function(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    return false;
  };

  //
  // initialization
  //

  // graphics configurations
  this.color_list = [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#00ffff",
    "#ff00ff"
  ];
  this.graph_body_color = "#000000";
  this.graph_margin_color = "#404040";
  this.scale_color = ["#808080", "#404040", "#202020"];
  this.scale_text_color = "#ffffff";
  this.graph_line_width = 2;

  // canvas 2D context
  this.ctx = canvas.getContext("2d");

  this.dobj_list = [];

  this.cvs_w = canvas.width;
  this.cvs_h = canvas.height;
  this.margin_l = 50;
  this.margin_r = 150;
  this.margin_t = 30;
  this.margin_b = 30;

  this.x_min = null;
  this.x_max = null;
  this.y_min = null;
  this.y_max = null;
  this.x_rate = 0;
  this.y_rate = 0;

  this.color_idx = 0;

  // set up handlers
  canvas.addEventListener("dragover", this.onDragOver, false);
  canvas.addEventListener("dragenter", this.onDragEnter, false);
  canvas.addEventListener("drop", this.onDropFile, false);

  this.initCanvas();
};
