
interface point2D{
    x:number
    y:number
}

class MindNode{
    public height:number
    public width:number
    public position:point2D
    public content:string
    public padding:number = 40
    public el:HTMLElement
    public children:MindNode[]
    public layoutHeight:number
    public mindMap:MindMap
    public parent:MindNode = null
    public templete:string = `<input type='text' placeholder='content'>`
    public standAlone:string = 'false'
    public lineEndPoint:point2D
    public relativePosition:point2D
    public expectPosition:point2D
    constructor(){
        this.height = 80
        this.width = 160
        this.content = 'TOP'
        this.children = []
        this.position = {x:0,y:0}
        this.lineEndPoint = {x:0,y:0}
        this.relativePosition = {x:0,y:0}
        this.expectPosition = {x:0,y:0}
    }

    public render(){
        if(!this.el){
            let wrap = document.createElement('div')
            wrap.innerHTML = this.templete.replace('content',this.content)
            this.el = wrap.children[0] as HTMLElement
            this.el.addEventListener('dblclick',(e)=>{
                e.stopImmediatePropagation()
                e.preventDefault()
                this.createChildNode()
            })
            this.elAddEventListener()
            if(this.parent !== null){
                this.position.x = this.parent.position.x
                this.position.y = this.parent.position.y
            }else{
                this.position.x = this.position.x
                this.position.y = this.position.y
            }

        }
        this.el.style.position = 'absolute'
        this.el.style.top = this.position.y - this.height/2 +'px'
        this.el.style.left = this.position.x - this.width/2 + 'px'
        this.el.style.width = this.width + 'px'
        this.el.style.height = this.height +'px'
        this.children.forEach((child)=>{
            child.render()
        })
        
        let container = document.querySelector('.container')
        container.appendChild(this.el)   
    }

    public calculatePosition(){
        if(this.parent == null){
            this.position.x = this.position.x
            this.position.y = this.position.y
            this.children.forEach((child)=>{
                child.calculatePosition()
            })
        }else{
            let heightNumber = this.expectPosition.y - this.position.y
            let widthNumber = this.expectPosition.x - this.position.x
            this.position.y += heightNumber/15
            this.position.x += widthNumber/15
            this.children.forEach((child)=>{
                child.calculatePosition()
            })
        }
    }


    public elAddEventListener(){
        let isMoving = false
        let mouseOffsetX = 0
        let mouseOffsetY = 0
        let mouseX = 0
        let mouseY = 0
        let moveX = 0
        let moveY = 0
        this.el.addEventListener('mousedown',(e)=>{
            e.stopImmediatePropagation()
            e.preventDefault()
            mouseOffsetX = e.clientX - this.position.x 
            mouseOffsetY = e.clientY - this.position.y 
            isMoving = true   
        })
        this.el.addEventListener('mousemove',(e)=>{
            e.stopImmediatePropagation()
            e.preventDefault()
            mouseX = e.clientX 
            mouseY = e.clientY
            if(isMoving){
                moveX = mouseX - mouseOffsetX
                moveY = mouseY - mouseOffsetY
                this.toStandAlone()
                this.relativePosition.x = moveX - this.parent.position.x
                this.relativePosition.y = moveY - this.parent.position.y
                this.mindMap.render()
            }
        })
        this.el.addEventListener('mouseup',(e)=>{
            e.stopImmediatePropagation()
            e.preventDefault()
            isMoving = false
        })
    }

    public toStandAlone(){
        this.standAlone = 'true'
    }

    public createChildNode(){
        let childNode = new MindNode()
        this.children.push(childNode)
        childNode.parent = this
        childNode.mindMap = this.mindMap
        this.mindMap.render()        
    }


    public calculateHeight(){
        this.layoutHeight = this.height
        let childHeight = 0
        this.children.forEach((child)=>{
            child.calculateHeight()
            if(child.standAlone == 'false'){
                childHeight += child.layoutHeight + child.padding
            }
        })
        childHeight -= this.padding
        if(this.layoutHeight < childHeight){
            this.layoutHeight = childHeight
        }
     }

    public getExpectPosition(){
        let startPoint = {
            x:this.position.x + this.width * 1.5,
            y:this.position.y - this.layoutHeight/2
        }
        this.children.forEach((child)=>{
            if(child.standAlone == 'false'){
                child.expectPosition.x = startPoint.x
                child.expectPosition.y = startPoint.y + child.layoutHeight/2
                startPoint.y += child.layoutHeight + child.padding
            }else if(child.standAlone == 'true'){
                child.expectPosition.x = child.relativePosition.x + this.position.x  
                child.expectPosition.y = child.relativePosition.y + this.position.y
            }
            child.getExpectPosition()
            console.log(child.expectPosition.x,child.expectPosition.y)
        })
    }

    public drawline(){
        let bgCanvas = <HTMLCanvasElement>document.getElementById('bgCanvas')
        let bgCt = bgCanvas.getContext('2d')
        let lineStartPoint = {
            x:this.position.x + this.width/2,
            y:this.position.y 
        }
        this.children.forEach((child)=>{
            let lineEndPointX = child.position.x - child.width/2
            let lineEndPointY = child.position.y
            bgCt.lineWidth = 3
            bgCt.beginPath()
            bgCt.moveTo(lineStartPoint.x,lineStartPoint.y)
            bgCt.quadraticCurveTo((lineEndPointX+lineStartPoint.x)/2.0,lineEndPointY,lineEndPointX,lineEndPointY)
            bgCt.stroke()
            child.drawline()
        })
    }

    public clearBgCanvas(){
        let bgCanvas = <HTMLCanvasElement>document.getElementById('bgCanvas')
        let bgCt = bgCanvas.getContext('2d')
        bgCt.clearRect(0,0,bgCanvas.width,bgCanvas.height)
    }
}

class MindMap{
    public node:MindNode
    constructor(){
        this.node = null
    }
    public render(){
        let render = setInterval(()=>{
            document.querySelector('.container').innerHTML=''
            this.node.calculateHeight()
            this.node.getExpectPosition()
            this.node.calculatePosition()
            this.node.render()
            this.node.clearBgCanvas()
            this.node.drawline()
        },16)
        setTimeout(()=>{
            clearInterval(render)
        },1500)

    }
    public setRoot(root:MindNode){
        this.node = root
        this.node.mindMap = this
        this.render()
        this.setCanvas()
        this.canvasAddEventListener()
        this.setCanvas()
    }

    public setCanvas(){
        let bgCanvas = <HTMLCanvasElement>document.getElementById('bgCanvas')
        bgCanvas.width = bgCanvas.offsetWidth
        bgCanvas.height = bgCanvas.offsetHeight        
    }

    public canvasAddEventListener(){
        let canvas = document.getElementById('bgCanvas')
        let isMoving = false
        let mouseOffsetX = 0
        let mouseOffsetY = 0
        canvas.addEventListener('mousedown',(e)=>{
            e.stopImmediatePropagation()
            e.preventDefault()
            mouseOffsetX = e.clientX - this.node.position.x
            mouseOffsetY = e.clientY - this.node.position.y
            isMoving = true
        },false)
        canvas.addEventListener('mousemove',(e)=>{
            e.stopImmediatePropagation()
            e.preventDefault()
            let mouseX = e.clientX
            let mouseY = e.clientY
            let moveX = 0
            let moveY = 0
            if(isMoving){
                moveX = mouseX - mouseOffsetX
                moveY = mouseY - mouseOffsetY
                this.node.position.x = moveX
                this.node.position.y = moveY
                this.render()
            }
        })
        canvas.addEventListener('mouseup',(e)=>{
            e.stopImmediatePropagation()
            e.preventDefault()
            isMoving = false
        },false)
    }
}

window.onload = ()=>{
    let root = new MindNode()
    root.position.x = window.innerWidth/3
    root.position.y = window.innerHeight/2
    let mindMap = new MindMap()
    mindMap.setRoot(root)
}



