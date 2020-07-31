var canvas = new Canvas();
var draw = false;
var dragged = null;

var rectSelected = null;
debugOnDocument("status", "selecionando");

function Canvas() {
  this.drawingNewRect =  false;
  this.firstPoint =  [];
  this.secondPoint = [];
  this.element = document.getElementById('mycanvas');
  this.element.width = 800;
  this.element.height = 400;
  this.context = this.element.getContext('2d');

  //Essa função desenha no canvas
  this.draw = function() {
    var rectangles = repoRectangles.getRectangles();
      for(rect in rectangles) {
      rectangles[rect].drawRect();
    }
  };

  //Essa função redesenha o Canvas
  this.redraw = function() {
    this.clear();
    this.draw();
  };

  //Essa função apaga o Canvas
  this.clear = function() {
    this.context.clearRect(0, 0, this.element.width, this.element.height);
  };

  //Essa função reinicia toda a operação de desenho no canvas
  this.reset = function() {
    repoRectangles.removeAll();
    this.clear();
  };

  this.onOffDrawingNewRect = function() {
    if(!this.drawingNewRect) {
      this.drawingNewRect = true;
    } else {
      this.drawingNewRect = false;
    }
  };
}

/*###################################### RECTANGLE ######################################*/
//Essa função cria um objeto do tipo 'rectangle' a partir da cordenadas top-left e bottom-down
function Rectangle(topLeftX, topLeftY, bottomRightX, bottomRightY, newId) {
  this.id = newId;
  this.topLeft = [topLeftX, topLeftY];
  this.bottomRight = [bottomRightX, bottomRightY];
  this.container = null;
  this.lineWidth = 1;
  this.primaryColor = "gray";
  this.highlightColor = "blue";
  this.selectedColor = "green";
  this.color = this.primaryColor;
  this.isSelected = false;
  //this.draggrable = false;
  this.startDrag = null;

  this.containPoint = function(x, y) {
    return (x >= this.topLeft[0] && x <= this.bottomRight[0]) && (y >= this.topLeft[1] && y <= this.bottomRight[1]);
  };

  this.containRect = function(rect){
    return ((rect.topLeft[0] > this.topLeft[0] && rect.bottomRight[0] < this.bottomRight[0]) && (rect.topLeft[1] > this.topLeft[1] && rect.bottomRight[1] < this.bottomRight[1]));
  };

  this.drawRect = function() {
    this.container.context.beginPath();
    this.container.context.lineWidth = this.lineWidth;
    this.container.context.strokeStyle = this.color;
    this.container.context.rect(this.topLeft[0], this.topLeft[1], (this.bottomRight[0] - this.topLeft[0]), (this.bottomRight[1] - this.topLeft[1]));

    if (this.isSelected) {
      this.container.context.strokeStyle = this.selectedColor;
      this.container.context.rect(this.topLeft[0] - 2.5, this.topLeft[1] - 2.5, 5, 5);
      this.container.context.rect(this.bottomRight[0] - 2.5, this.topLeft[1] - 2.5, 5, 5);
      this.container.context.rect(this.bottomRight[0] - 2.5, this.bottomRight[1] - 2.5, 5, 5);
      this.container.context.rect(this.topLeft[0] - 2.5, this.bottomRight[1] - 2.5, 5, 5);
    }
    this.container.context.stroke();
  };

  this.highlight = function() {
    this.color = this.highlightColor;
    this.container.redraw();
    this.color = this.primaryColor;
  };

  this.draggedTo = function(point) {
      let varX = point[0] - this.startDrag[0];
      let varY = point[1] - this.startDrag[1];
      this.topLeft[0] += varX;
      this.topLeft[1] += varY;
      this.bottomRight[0] += varX;
      this.bottomRight[1] += varY;
      this.startDrag = point;
      this.container.redraw();
      console.log("variação em x "+varX+" ,variação em y "+varY);
  };

  this.selected = function() {
    this.isSelected = !this.isSelected;
    this.container.redraw();
  };

  this.setDaggrable = function() {
    this.draggrable = !draggrable;
  };

  this.setLineWidth = function(width) {
    this.lineWidth = width;
  };

}

/*###################################### REPOSITORIO DE  RECTANGLES ######################################*/
//Repositorio de retangulos
var repoRectangles = {
  rectangles: [],

  add: function(rectangle) {
    this.rectangles[this.rectangles.length] = rectangle;
    this.fixPositionRects();
  },

  getRectangles: function() {
    return this.rectangles;
  },

  removeAll: function() {
    this.rectangles = [];
  },

  size: function() {
    return this.rectangles.length;
  },

  fixPositionRects: function() {
    for (var i = this.rectangles.length; i > 1; i--) {
      if(this.rectangles[i - 2].containRect(this.rectangles[i - 1])) {
        var temp = this.rectangles[i - 2];
        this.rectangles[i - 2] = this.rectangles[i - 1];
        this.rectangles[i - 1] = temp;
      }
    }
  },

  //Essa função retorna o retangulo mais profundo sobre o qual o mouse esta em cima
  getRectContainPoint: function (x, y) {
    var rectMostDeep = null;
    for (var i = this.rectangles.length; i > 0; i--) {
      if(this.rectangles[i - 1].containPoint(x, y)) {
        rectMostDeep = this.rectangles[i - 1];
      }
    }
    return rectMostDeep;
  }

};

function debugOnDocument(element, value) {
  document.getElementById(element).value = value;
}

//Essa função manipula as coordenadas dos cliques do mouse para desenhar um retangulo
function newRectangleFromMouse(firstCoord, secondCoord) {
  var topLeft = [];
  var bottomRight = [];
  //Analisanda a primeira coordenada
  if(secondCoord[0] < firstCoord[0]) {
    topLeft[0] = secondCoord[0];
    bottomRight[0] = firstCoord[0];
  } else {
    topLeft[0] = firstCoord[0];
    bottomRight[0] = secondCoord[0];
  }
  //Analisanda a segunda coordenada
  if(secondCoord[1] < firstCoord[1]) {
    topLeft[1] = secondCoord[1];
    bottomRight[1] = firstCoord[1];
  } else {
    topLeft[1] = firstCoord[1];
    bottomRight[1] = secondCoord[1]
  }
  return new Rectangle(topLeft[0], topLeft[1], bottomRight[0], bottomRight[1], repoRectangles.size() + 1);
}

/*------------------------------------------------------------------------------------------------
  ------------------------------------------ CONTROLERS ------------------------------------------
  ------------------------------------------------------------------------------------------------*/

canvas.element.addEventListener("mousedown", function(event) {
  console.log("mousedown");
  if(!draw) {
    let rectSelected = repoRectangles.getRectContainPoint(event.offsetX, event.offsetY);
    if(rectSelected && rectSelected.isSelected) {
      dragged = rectSelected;
      dragged.startDrag = ([event.offsetX, event.offsetY]);
      console.log("rect: "+dragged.id+" é arrastavel");
    }
  }
});

canvas.element.addEventListener("mouseup", function(event) {
  console.log("mouseup");
  if(!draw) {
    if(dragged != null) {
        console.log("rect: "+dragged.id+" não é arrastavel");
        dragged = null;
      }
    }
});

canvas.element.addEventListener("mousemove", function(event) {
  var eventX = event.offsetX;
  var eventY = event.offsetY;
  if (canvas.drawingNewRect) {
    debugOnDocument("status", "desenhando");
    canvas.redraw();
    let rect = newRectangleFromMouse(canvas.firstPoint, [eventX, eventY]);
    rect.container = canvas;
    rect.drawRect();
  } else {
    debugOnDocument("status", "destacando");
    if(dragged != null) {
      dragged.draggedTo([eventX, eventY]);
    } else {
      var rectSelected = repoRectangles.getRectContainPoint(eventX, eventY);
      if(rectSelected != null) {
        if(rectSelected.isSelected) {
          canvas.element.style.cursor = "move";
        }
        rectSelected.highlight();
      } else {
        if(!draw){
          canvas.element.style.cursor = "auto";
        }
        canvas.redraw();
      }
    }

  }
  debugOnDocument("x", eventX);
  debugOnDocument("y", eventY);
});

canvas.element.addEventListener("click", function(event) {
  var eventX = event.offsetX;
  var eventY = event.offsetY;
  if(draw) {
    if(!canvas.drawingNewRect) {
      canvas.onOffDrawingNewRect();
      canvas.firstPoint = [eventX, eventY];
      debugOnDocument("first-click", "X: "+eventX+"; Y: "+eventY);
    } else {
      canvas.onOffDrawingNewRect();
      canvas.secondPoint = [eventX, eventY];
      let rect = newRectangleFromMouse(canvas.firstPoint, canvas.secondPoint);
      rect.container = canvas;
      repoRectangles.add(rect);
      canvas.redraw();
      debugOnDocument("second-click", "X: "+eventX+"; Y: "+eventY);
    }
  } else {
    debugOnDocument("status", "selecionando");
    var rectSel = repoRectangles.getRectContainPoint(eventX, eventY);
    if(rectSel != null) {
      if(rectSelected != null) {
        rectSelected.selected();//Aqui eu removo a seleção do ultimo retangulo selecionado
      }
      rectSelected = rectSel;//Armazeno o novo retangulo selecionado
      canvas.element.style.cursor = "move";
      rectSelected.selected();
    } else {
      //Se não foi clicado em nenhum retangulo
      if(rectSelected != null) {
        rectSelected.selected();//Removo a seleção do ultimo retangulo selecionado
      }
      rectSelected = rectSel;//Selecionado é igual a nulo
    }
  }
});

function selectOn() {
  canvas.element.style.cursor = "auto";
  draw = false;
}

function drawOn() {
  draw = true;
  canvas.element.style.cursor = "crosshair";
  if(rectSelected != null) {
    rectSelected.selected(canvas);
    rectSelected = null;
  }
}

function reset() {
  canvas.reset();
}
