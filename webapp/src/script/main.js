var MindNode = (function () {
    function MindNode() {
        this.padding = 40;
        this.parent = null;
        this.templete = "<input type='text' placeholder='content'>";
        this.standAlone = 'false';
        this.height = 80;
        this.width = 160;
        this.content = 'TOP';
        this.children = [];
        this.position = { x: 0, y: 0 };
        this.lineEndPoint = { x: 0, y: 0 };
        this.relativePosition = { x: 0, y: 0 };
        this.expectPosition = { x: 0, y: 0 };
    }
    MindNode.prototype.render = function () {
        var _this = this;
        if (!this.el) {
            var wrap = document.createElement('div');
            wrap.innerHTML = this.templete.replace('content', this.content);
            this.el = wrap.children[0];
            this.el.addEventListener('dblclick', function (e) {
                e.stopImmediatePropagation();
                e.preventDefault();
                _this.createChildNode();
            });
            this.elAddEventListener();
            if (this.parent !== null) {
                this.position.x = this.parent.position.x;
                this.position.y = this.parent.position.y;
            }
            else {
                this.position.x = this.position.x;
                this.position.y = this.position.y;
            }
        }
        this.el.style.position = 'absolute';
        this.el.style.top = this.position.y - this.height / 2 + 'px';
        this.el.style.left = this.position.x - this.width / 2 + 'px';
        this.el.style.width = this.width + 'px';
        this.el.style.height = this.height + 'px';
        this.children.forEach(function (child) {
            child.render();
        });
        var container = document.querySelector('.container');
        container.appendChild(this.el);
    };
    MindNode.prototype.calculatePosition = function () {
        if (this.parent == null) {
            this.position.x = this.position.x;
            this.position.y = this.position.y;
            this.children.forEach(function (child) {
                child.calculatePosition();
            });
        }
        else {
            var heightNumber = this.expectPosition.y - this.position.y;
            var widthNumber = this.expectPosition.x - this.position.x;
            this.position.y += heightNumber / 15;
            this.position.x += widthNumber / 15;
            this.children.forEach(function (child) {
                child.calculatePosition();
            });
        }
    };
    MindNode.prototype.elAddEventListener = function () {
        var _this = this;
        var isMoving = false;
        var mouseOffsetX = 0;
        var mouseOffsetY = 0;
        var mouseX = 0;
        var mouseY = 0;
        var moveX = 0;
        var moveY = 0;
        this.el.addEventListener('mousedown', function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            mouseOffsetX = e.clientX - _this.position.x;
            mouseOffsetY = e.clientY - _this.position.y;
            isMoving = true;
        });
        this.el.addEventListener('mousemove', function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (isMoving) {
                moveX = mouseX - mouseOffsetX;
                moveY = mouseY - mouseOffsetY;
                _this.toStandAlone();
                _this.relativePosition.x = moveX - _this.parent.position.x;
                _this.relativePosition.y = moveY - _this.parent.position.y;
                _this.mindMap.render();
            }
        });
        this.el.addEventListener('mouseup', function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            isMoving = false;
        });
    };
    MindNode.prototype.toStandAlone = function () {
        this.standAlone = 'true';
    };
    MindNode.prototype.createChildNode = function () {
        var childNode = new MindNode();
        this.children.push(childNode);
        childNode.parent = this;
        childNode.mindMap = this.mindMap;
        this.mindMap.render();
    };
    MindNode.prototype.calculateHeight = function () {
        this.layoutHeight = this.height;
        var childHeight = 0;
        this.children.forEach(function (child) {
            child.calculateHeight();
            if (child.standAlone == 'false') {
                childHeight += child.layoutHeight + child.padding;
            }
        });
        childHeight -= this.padding;
        if (this.layoutHeight < childHeight) {
            this.layoutHeight = childHeight;
        }
    };
    MindNode.prototype.getExpectPosition = function () {
        var _this = this;
        var startPoint = {
            x: this.position.x + this.width * 1.5,
            y: this.position.y - this.layoutHeight / 2
        };
        this.children.forEach(function (child) {
            if (child.standAlone == 'false') {
                child.expectPosition.x = startPoint.x;
                child.expectPosition.y = startPoint.y + child.layoutHeight / 2;
                startPoint.y += child.layoutHeight + child.padding;
            }
            else if (child.standAlone == 'true') {
                child.expectPosition.x = child.relativePosition.x + _this.position.x;
                child.expectPosition.y = child.relativePosition.y + _this.position.y;
            }
            child.getExpectPosition();
            console.log(child.expectPosition.x, child.expectPosition.y);
        });
    };
    MindNode.prototype.drawline = function () {
        var bgCanvas = document.getElementById('bgCanvas');
        var bgCt = bgCanvas.getContext('2d');
        var lineStartPoint = {
            x: this.position.x + this.width / 2,
            y: this.position.y
        };
        this.children.forEach(function (child) {
            var lineEndPointX = child.position.x - child.width / 2;
            var lineEndPointY = child.position.y;
            bgCt.lineWidth = 3;
            bgCt.beginPath();
            bgCt.moveTo(lineStartPoint.x, lineStartPoint.y);
            bgCt.quadraticCurveTo((lineEndPointX + lineStartPoint.x) / 2.0, lineEndPointY, lineEndPointX, lineEndPointY);
            bgCt.stroke();
            child.drawline();
        });
    };
    MindNode.prototype.clearBgCanvas = function () {
        var bgCanvas = document.getElementById('bgCanvas');
        var bgCt = bgCanvas.getContext('2d');
        bgCt.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    };
    return MindNode;
}());
var MindMap = (function () {
    function MindMap() {
        this.node = null;
    }
    MindMap.prototype.render = function () {
        var _this = this;
        var render = setInterval(function () {
            document.querySelector('.container').innerHTML = '';
            _this.node.calculateHeight();
            _this.node.getExpectPosition();
            _this.node.calculatePosition();
            _this.node.render();
            _this.node.clearBgCanvas();
            _this.node.drawline();
        }, 16);
        setTimeout(function () {
            clearInterval(render);
        }, 1500);
    };
    MindMap.prototype.setRoot = function (root) {
        this.node = root;
        this.node.mindMap = this;
        this.render();
        this.setCanvas();
        this.canvasAddEventListener();
        this.setCanvas();
    };
    MindMap.prototype.setCanvas = function () {
        var bgCanvas = document.getElementById('bgCanvas');
        bgCanvas.width = bgCanvas.offsetWidth;
        bgCanvas.height = bgCanvas.offsetHeight;
    };
    MindMap.prototype.canvasAddEventListener = function () {
        var _this = this;
        var canvas = document.getElementById('bgCanvas');
        var isMoving = false;
        var mouseOffsetX = 0;
        var mouseOffsetY = 0;
        canvas.addEventListener('mousedown', function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            mouseOffsetX = e.clientX - _this.node.position.x;
            mouseOffsetY = e.clientY - _this.node.position.y;
            isMoving = true;
        }, false);
        canvas.addEventListener('mousemove', function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            var mouseX = e.clientX;
            var mouseY = e.clientY;
            var moveX = 0;
            var moveY = 0;
            if (isMoving) {
                moveX = mouseX - mouseOffsetX;
                moveY = mouseY - mouseOffsetY;
                _this.node.position.x = moveX;
                _this.node.position.y = moveY;
                _this.render();
            }
        });
        canvas.addEventListener('mouseup', function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            isMoving = false;
        }, false);
    };
    return MindMap;
}());
window.onload = function () {
    var root = new MindNode();
    root.position.x = window.innerWidth / 3;
    root.position.y = window.innerHeight / 2;
    var mindMap = new MindMap();
    mindMap.setRoot(root);
};
//# sourceMappingURL=main.js.map