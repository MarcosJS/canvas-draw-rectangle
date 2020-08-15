/*O modulo de mapeamento se divide em modos e submodos
**MODO DE DELIMITAÇÃO[feito]:
    Modo de Criação[feito];
    Modo de Edição[feito];
**MODO DE DEFINIÇÃO[em construcao];
*/

var canvas = new Canvas();
var create = false;
var dragged = null;
var resized = null;
var rectSelected = null;
var cursorModo = null;
var nextId = 0;
var cMenu = false;

debugOnDocument("status", "selecionando");

function Canvas() {
  this.drawingNewRect =  false;
  this.firstPoint =  [];
  this.secondPoint = [];
  this.element = document.getElementById('mycanvas');
  this.element.width = 600;
  this.element.height = 400;
  this.context = this.element.getContext('2d');

  //Essa função desenha no canvas
  this.draw = function() {
    var rectangles = repoRectangles.getAll();
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

  this.onOffDrawingNewRect = function() {
    if(!this.drawingNewRect) {
      this.drawingNewRect = true;
    } else {
      this.drawingNewRect = false;
    }
  };
}

/*#####################################################################################################
  ############################################# RECTANGLE #############################################
  #####################################################################################################*/
//Essa função cria um objeto do tipo 'rectangle' a partir da cordenadas top-left e bottom-down
function Rectangle(topLeftX, topLeftY, bottomRightX, bottomRightY, newId, margin = 0) {
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
  this.startDrag = null;
  this.startResize = null;
  this.marinPosition = null;
  this.margin = margin;

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
      this.container.context.rect(this.topLeft[0], this.topLeft[1], margin, margin);
      this.container.context.rect(this.bottomRight[0] - margin, this.topLeft[1], margin, margin);
      this.container.context.rect(this.bottomRight[0] - margin, this.bottomRight[1] - margin, margin, margin);
      this.container.context.rect(this.topLeft[0], this.bottomRight[1] - margin, margin, margin);
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
    if((this.topLeft[0]+varX >= 0) && (this.topLeft[1]+varY >= 0) && (this.bottomRight[0]+varX <= canvas.element.width) && (this.bottomRight[1]+varY <= canvas.element.height)) {
      this.topLeft[0] += varX;
      this.topLeft[1] += varY;
      this.bottomRight[0] += varX;
      this.bottomRight[1] += varY;
    }
    this.startDrag = point;
    repoRectangles.fixPrioritRects();
    updateList();
    this.container.redraw();
    //console.log("[DRAGGED] variação em x "+varX+" ,variação em y "+varY);
  };

  this.resize = function(point) {
    let varX = point[0] - this.startResize[0];
    let varY = point[1] - this.startResize[1];
    switch (marginPoint) {
      case 0:
        if((this.topLeft[0] + 2*margin + varX) < this.bottomRight[0]) {
          this.topLeft[0] += varX;
        }
        if((this.topLeft[1] + 2*margin + varY) < this.bottomRight[1]) {
          this.topLeft[1] += varY;
        }
        break;
      case 1:
        if((this.bottomRight[0] + varX) > this.topLeft[0] + 2*margin) {
          this.bottomRight[0] += varX;
        }
        if((this.topLeft[1] + 2*margin + varY) < this.bottomRight[1]) {
          this.topLeft[1] += varY;
        }
        break;
      case 2:
        if((this.bottomRight[0] + varX) > this.topLeft[0] + 2*margin) {
          this.bottomRight[0] += varX;
        }
        if((this.bottomRight[1] + varY) > this.topLeft[1] + 2*margin) {
          this.bottomRight[1] += varY;
        }
        break;
      case 3:
        if((this.topLeft[0] + 2*margin + varX) < this.bottomRight[0]) {
          this.topLeft[0] += varX;
        }
        if((this.bottomRight[1] + varY) > this.topLeft[1] + 2*margin) {
          this.bottomRight[1] += varY;
        }
        break;
      case 4:
        if((this.topLeft[1] + 2*margin + varY) < this.bottomRight[1]) {
          this.topLeft[1] += varY;
        }
        break;
      case 5:
        if((this.bottomRight[0] + varX) > this.topLeft[0] + 2*margin) {
          this.bottomRight[0] += varX;
        }
        break;
      case 6:
        if((this.bottomRight[1] + varY) > this.topLeft[1] + 2*margin) {
          this.bottomRight[1] += varY;
        }
        break;
      case 7:
        if((this.topLeft[0] + 2*margin + varX) < this.bottomRight[0]) {
          this.topLeft[0] += varX;
        }
        break;
    }
    this.startResize = point;
    repoRectangles.fixPrioritRects();
    updateList();
    this.container.redraw();
  };

  this.isReadyToResize = function(x, y) {
    result = -1;
    if((x >= this.topLeft[0] && x <= this.topLeft[0]+margin) && (y >= this.topLeft[1] && y <= this.topLeft[1]+margin)) {
      result = 0;//canto superior esquerdo
    } else if ((x >= this.bottomRight[0]-margin && x <= this.bottomRight[0]) && (y >= this.topLeft[1] && y <= this.topLeft[1]+margin)) {
      result = 1;//canto superior direito
    } else if ((x >= this.bottomRight[0]-margin && x <= this.bottomRight[0]) && (y >= this.bottomRight[1]-margin && y <= this.bottomRight[1])) {
      result = 2;//canto inferior direito
    } else if ((x >= this.topLeft[0] && x <= this.topLeft[0]+margin) && (y >= this.bottomRight[1]-margin && y <= this.bottomRight[1])) {
      result = 3;//canto inferio esquerdo
    } else if ((x > this.topLeft[0]+margin && x < this.bottomRight[0]-margin) && (y >= this.topLeft[1] && y < this.topLeft[1]+margin)) {
      result = 4;//lado superior
    } else if ((x >= this.bottomRight[0]-margin && x <= this.bottomRight[0]) && (y > this.topLeft[1]+margin && y < this.bottomRight[1]-margin)) {
      result = 5;//lado direito
    } else if ((x > this.topLeft[0]+margin && x < this.bottomRight[0]-margin) && (y >= this.bottomRight[1]-margin && y <= this.bottomRight[1])) {
      result = 6;//lado inferior
    } else if ((x >= this.topLeft[0] && x <= this.topLeft[0]+margin) && (y > this.topLeft[1]+margin && y < this.bottomRight[1]-margin)) {
      result = 7;//lado esquerdo
    }
    return result;
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

/*########################################################################################################
  ###################################### REPOSITORIO DE  RECTANGLES ######################################
  ########################################################################################################*/
var edition = {
  frames: [],

  frame: null,

  it: 0;

  init: function() {
    this.frames[it] = repoRectangles;
    this.frame = frames[it];
    this.new();
  },

  new: function() {
    this.frames[++it] = repoRectangles;
  },

  previous: function() {
    if(it > 0) {
      this.frame = this.frames[it - 1];
    }
  },

  next: function() {
    if(it < this.frames.length) {
      this.frame = this.frames[it + 1];
    }
  }
};

//Repositorio de retangulos
var repoRectangles = {
  rectangles: [],

  add: function(rectangle) {
    this.rectangles[this.rectangles.length] = rectangle;
    this.fixPrioritRects();
  },

  remove: function(id) {
    for(i = 0; i < this.rectangles.length; i++) {
      if(this.rectangles[i].id == id) {
        this.rectangles.splice(i,1);
        break;
      }
    }
  },

  get: function(id) {
    for(i = 0; i < this.rectangles.length; i++) {
      if(this.rectangles[i].id == id) {
        return this.rectangles[i];
      }
    }
  },

  getAll: function() {
    return this.rectangles;
  },

  removeAll: function() {
    this.rectangles = [];
  },

  fixPrioritRects: function() {
    for(var i = this.rectangles.length - 1; i > 0; i--) {
      for(var j = i; j > 0; j--) {//com j = i garante-se que a comparação vai ser feita somente com o anterior
        if(this.rectangles[j - 1].containRect(this.rectangles[i])) {//verificando se retangulo esta contigo no anterior
          var temp = this.rectangles[j - 1];
          this.rectangles[j - 1] = this.rectangles[i];
          this.rectangles[i] = temp;
        }
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

/*########################################################################################################
  ########################################## FUNÇÕES AUXILIARES ##########################################
  ########################################################################################################*/

function updateId() {
  var cookies = document.cookie;
  cookies = cookies.split("; ");
  for(i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].split("=");
    if(Number(cookie[0]) > nextId) {
      nextId = Number(cookie[0]);
    }
  }
  nextId++;
  console.log(nextId);
}

function save() {
  console.log("salvando canvas");
  var rects = repoRectangles.getAll();
  for(i = 0; i < rects.length; i++) {
    document.cookie = rects[i].id+"="+rects[i].topLeft+","+rects[i].bottomRight;
  }
}

function load() {
  var cookies = document.cookie;

  if(cookies != "") {
    repoRectangles.removeAll();
    cookies = cookies.split("; ");
    for(i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].split("=");
      var idC = cookie[0];
      if(idC > nextId) {
        nextId = idC;
      }
      var coords = cookie[1].split(",");
      console.log(idC,coords);
      var rect = new Rectangle(Number(coords[0]), Number(coords[1]), Number(coords[2]), Number(coords[3]), Number(idC), 5);
      rect.container = canvas;
      console.log(rect);
      repoRectangles.add(rect);
    }
    updateList();
    canvas.redraw();
  }
}

function debugOnDocument(element, value) {
  document.getElementById(element).value = value;
}

function updateList() {
  let table = document.getElementById("list");
  table.innerHTML = "";
  let rectangles = repoRectangles.getAll();
  for (var i = 0; i < rectangles.length; i++) {
    let line = document.createElement("tr");
    let columId = document.createElement("td");
    let columSelect = document.createElement("td");
    let columDelete = document.createElement("td");
    let button1 = document.createElement("button");
    let button2 = document.createElement("button");

    columId.id = rectangles[i].id;
    columId.innerHTML = rectangles[i].id;

    //Criando o botão de selecionar
    button1.type = "button";
    button1.innerHTML = "Selecionar";
    button1.addEventListener("click", function() {
      if(!create) {
        if(rectSelected != null) {
          rectSelected.selected();//Aqui eu removo a seleção do ultimo retangulo selecionado
        }
        rectSelected = repoRectangles.get(columId.id);//Armazeno o novo retangulo selecionado
        canvas.element.style.cursor = "move";
        rectSelected.selected();
      }
    });

    //Criando o botão de deletar
    button2.type = "button";
    button2.innerHTML = "Deletar";
    button2.addEventListener("click", function() {
      repoRectangles.remove(columId.id);
      updateList();
      canvas.redraw();
    });

    columSelect.appendChild(button1);
    columDelete.appendChild(button2);
    line.appendChild(columId);
    line.appendChild(columSelect);
    line.appendChild(columDelete);
    table.appendChild(line);
  }
}

function removeRect(id) {
  repoRectangles.remove(id);
  updateList();
  canvas.redraw();
}

function displayContextMenu(display, rect = null, e = null) {
  cMenu = display;
  let contextMenu = document.getElementById("contextmenu");
  contextMenu.style.display = display ? 'block' : 'none';
  if(display) {
    contextMenu.innerHTML = "";

    let div = document.createElement("div");
    div.className = "context-menu-item";
    div.addEventListener("click", function() {console.log("remove from contextmenu");removeRect(rect.id)});

    let label = document.createElement("label");
    label.innerHTML = "Excluir retangulo ["+rect.id+"]";

    div.appendChild(label);
    contextMenu.appendChild(div);
    e.preventDefault();
    contextMenu.style.top = e.y+'px';
    contextMenu.style.left = e.x+'px';
    e.stopPropagation()
  }
}

function editOn() {
  canvas.element.style.cursor = cursorModo = "auto";
  create = false;
  debugOnDocument("status", "selecionando");
}

function createOn() {
  canvas.element.style.cursor = cursorModo = "crosshair";
  create = true;
  debugOnDocument("status", "posicionando");
  if(rectSelected != null) {
    rectSelected.selected(canvas);
    rectSelected = null;
  }
}

function reset() {
  repoRectangles.removeAll();
  canvas.clear();
  updateList();
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
  return new Rectangle(topLeft[0], topLeft[1], bottomRight[0], bottomRight[1], 0, 5);
}

/*################################################################################################
  ########################################## CONTROLERS ##########################################
  ################################################################################################*/

canvas.element.addEventListener("mousedown", function(event) {
  var eventX = event.offsetX;
  var eventY = event.offsetY
  if(!create && (event.buttons == 1)) {
    let rectSelected = repoRectangles.getRectContainPoint(eventX, eventY);
    if(rectSelected && rectSelected.isSelected) {//retangulo sobre o qual esta o mouse é selecionado e o menu de contexto nao foi ativado
      marginPoint = rectSelected.isReadyToResize(eventX, eventY);
      if(marginPoint >= 0) {
        resized = rectSelected;
        resized.startResize = ([eventX, eventY]);
        resized.marinPosition = marginPoint;
      } else {
        dragged = rectSelected;
        dragged.startDrag = ([eventX, eventY]);
        console.log("rect: "+dragged.id+" é arrastavel");
      }
    }
  }
});

canvas.element.addEventListener("mouseup", function(event) {
  if(!create) {
    if(resized != null) {
      resized = null;
    } else if(dragged != null) {
        console.log("rect: "+dragged.id+" não é arrastavel");
        dragged = null;
      }
    }
});

canvas.element.addEventListener("mousemove", function(event) {
  var eventX = event.offsetX;
  var eventY = event.offsetY;

  //caso 1
  if (canvas.drawingNewRect) {//Se estiver desenhando um retangulo
    debugOnDocument("status", "desenhando");
    canvas.redraw();
    let rect = newRectangleFromMouse(canvas.firstPoint, [eventX, eventY]);
    rect.container = canvas;
    rect.drawRect();

  //caso 2
  }else if(resized != null) {
    debugOnDocument("status", "redimensionando");
    resized.resize([eventX, eventY]);
  //caso 3
  } else if(dragged != null) {//Se estiver movendo algum retangulo
    debugOnDocument("status", "movendo");
    dragged.draggedTo([eventX, eventY]);

  } else {
    //Recuperando o retangulo sobre o qual esta o mouse
    var rectSelected = repoRectangles.getRectContainPoint(eventX, eventY);
    if(rectSelected != null) {
      if(rectSelected.isSelected) {//Se o retangulo recuperado estiver selecionado
        //caso 4 - o cursor esta sobre um retangulo selecionado
        let margin = rectSelected.isReadyToResize(eventX, eventY);
        if(margin == 0 || margin == 2) {
          canvas.element.style.cursor = "nw-resize";
        } else if(margin == 1 || margin == 3) {
          canvas.element.style.cursor = "ne-resize";
        } else if(margin == 4 || margin == 6) {
          canvas.element.style.cursor = "n-resize";
        } else if(margin == 5 || margin == 7) {
          canvas.element.style.cursor = "e-resize";
        } else {
          canvas.element.style.cursor = "move";
        }
      } else {
        //caso 4 - o cursor esta sobre um retangulo não selecionado
        canvas.element.style.cursor = cursorModo;
      }
      rectSelected.highlight();
    } else {
      canvas.redraw();
      //caso 5 - o cursor não esta sobre nenhum triangulo
      canvas.element.style.cursor = cursorModo;
    }
  }
  debugOnDocument("x", eventX);
  debugOnDocument("y", eventY);
});

canvas.element.addEventListener("click", function(event) {
  //console.log("event click canvas");
  var eventX = event.offsetX;
  var eventY = event.offsetY;
  if(create) {
    if(!canvas.drawingNewRect) {
      canvas.onOffDrawingNewRect();
      canvas.firstPoint = [eventX, eventY];
      debugOnDocument("first-click", "X: "+eventX+"; Y: "+eventY);
    } else {
      canvas.onOffDrawingNewRect();
      canvas.secondPoint = [eventX, eventY];
      let rect = newRectangleFromMouse(canvas.firstPoint, canvas.secondPoint);
      rect.container = canvas;
      rect.id = nextId++;
      repoRectangles.add(rect);
      updateList();
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

canvas.element.addEventListener("contextmenu", function(event) {
  if(!create) {
    var rectSel = repoRectangles.getRectContainPoint(event.offsetX, event.offsetY);
    if(rectSel != null) {
      if(rectSel.isSelected) {
        console.log("show menu");
        displayContextMenu(true, rectSel, event);
      } else {
        if(rectSelected != null) {
          rectSelected.selected();
        }
        rectSelected = rectSel;//Armazeno o novo retangulo selecionado
        canvas.element.style.cursor = "move";
        rectSelected.selected();
        console.log("show menu");
        displayContextMenu(true, rectSel, event);
      }
    }
  }
});

document.addEventListener('click', function(event) {
  console.log("hide menu by click");
  displayContextMenu(false);
});

document.addEventListener('contextmenu', function(event) {
  console.log("hide menu by contextmenu");
  displayContextMenu(false);
});

document.addEventListener('load', updateId());
