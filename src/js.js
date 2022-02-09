// Extends javascript build-in Objects:
// Number, String, Array, Canvas, Element
//
// Number:
//   (180).toRadian() = 3.14
//   (3.14).toAngle() = 180
// String:
//   "brown fox".capitalized()  = Brown fox
//   "brown fox".first()        = b
//   "brown fox".first(5)       = brown
//   "brown fox".last()         =         x
//   "brown fox".last(3)        =       fox
//   "brown fox".removeFirst()  =  rown fox
//   "brown fox".removeFirst(6) =       fox
//   "brown fox".removeLast()   = brown fo
//   "brown fox".removeLast(4)  = brown
// Array:
//   [1,2,3,4,5].randomChild = 1 or 2 or 3 or 4 or 5
//   [1,2,3,4,5].removeChild(3) = [1,2,4,5]
//   [1,2,3,4,5].firstChild = 1
//   [1,2,3,4,5].lastChild = 5
// Math:
//   Math.between(0, 100)       = 0 ~ 100
//   Math.between(0, 100, true) = 0 ~ 100 (round digit) 
// Canvas:
// context.roundRect(x, y, w, h, r) => draw round rectangle
// Element
//   Element.show => 
//   Element.hide => modify element style for css animations
//   Element.exit =>

Object.defineProperties(Number.prototype, {
    toRadian: {
        value: function() {
            return this / 180 * Math.PI;
        }
    },
    toAngle: {
        value: function() {
            return this * 180 / Math.PI;
        }
    },
})

// String
Object.defineProperties(String.prototype, {

    capitalized: {
        // "brown fox".capitalized() => "Brown fox" 
        value: function() {
            return this.first().toUpperCase() + this.removeFirst();
        }
    },
    first: {
        // "brown fox".first() =>  "b"
        // "brown fox".first(5) => "brown"
        value: function(n) {
            return this.slice(0,n||1);
        }
    },
    last: {
        // "brown fox".last()  =>   "x"
        // "brown fox".last(3) => "fox"
        value: function(n) {
            return this.slice(-n||-1);
        }
    },
    removeFirst: {
        // "brown fox".removeFirst()  => "rown fox"
        // "brown fox".removeFirst(6) =>      "fox"
        value: function(n) {
            return this.slice(n||1);
        }
    },
    removeLast: {
        // "brown fox".removeLast()  => "brown fo"
        // "brown fox".removeLast(4) => "brown"
        value: function(n) {
            return this.slice(0,-n||-1);
        }
    }

})

Object.defineProperties(Array.prototype, {
    randomChild: {
        get: function() {
            let n = Math.floor(Math.random() * this.length);
            return this[n]
        }
    },
    removeChild: {
        value: function(child) {
            let index = this.indexOf(child)
            if (index > -1) this.splice(index, 1);
            return this;
        }
    },
    firstChild: {
        get: function() {
            return this[0];
        }
    },
    lastChild: {
        get: function() {
            return this[this.length-1];
        }
    }
})

Math.between = function(min, max, round) {

    let n = min + Math.random() * (max - min)
    if (round) n = Math.round(n);
    return n;

}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y)
    this.lineTo(x+w-r, y);
    this.quadraticCurveTo(x+w, y, x+w, y+r);
    this.lineTo(x+w, y+h-r);
    this.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    this.lineTo(x+r, y+h);
    this.quadraticCurveTo(x, y+h, x, y+h-r);
    this.lineTo(x, y+r);
    this.quadraticCurveTo(x, y, x+r, y)
    this.closePath();
    return this;

}

// el.show, el.hide, el.exit css animations
{
    let animateid = 0;
    Object.defineProperties(Element.prototype, {
        show: {
            get: function() {
                return this._show;
            },
            set: function(show) {
    
                if (typeof show == 'number') {
                    show = {
                        start: show
                    }
                }
                if (typeof show == 'string') {
    
                    let splited = show.match(/([a-zA-Z]+)([\d.]*)/);
                    show = {
                        direction: splited[1],
                        start: Number(splited[2])
                    }
    
                }
                if (Array.isArray(show)) {
                    show = {
                        direction: show[0],
                        start: show[1],
                        duration: hide[2],
                    }
    
                }
                if (show === true) show = {}
    
                show.direction ??= '';
                show.start ??= 0;
                show.duration ??= 0.5;
    
                this._show = show;
    
                let rulename = `animate${animateid++}`;
    
                let x = this.style.left.replace(/[^.\d]/g, '') || 0;
                let y = this.style.top.replace(/[^.\d]/g, '') || 0;
                let xi = x + 0;
                let yi = y + 0;
                let xf = x + 0;
                let yf = y + 0;
    
                let l = 50;
                let l2 = 35;
    
                switch (show.direction) {
                    case 'left':    xi -= l; break;
                    case 'right':   xi += l; break;
                    case 'up':      yi -= l; break;
                    case 'down':    yi += l; break;
                    case 'leftup':
                    case 'upleft':  xi -= l2; yi -= l2; break;
                    case 'rightup':
                    case 'upright': xi += l2; yi -= l2; break;
                    case 'downleft':
                    case 'leftdown': xi -= l2; yi += l2; break;
                    case 'rightdown':
                    case 'downright':  xi += l2; yi += l2; break;
                }
    
                document.styleSheets[0].insertRule(
                    `@keyframes ${rulename} {
                        from { opacity: 0; left: ${xi}px; top: ${yi}px}
                        to { opacity: 1; left: ${xf}px; top: ${yf}px}
                    }`
                );
    
                this.style.position = 'relative';
                this.style.right = `${xi}px`;
                this.style.top = `${yi}px`;
                this.style.opacity = 0;
                this.style.animationName = rulename;
                this.style.animationDuration = show.duration + 's';
                this.style.animationDelay = show.start + 's';
                this.style.animationFillMode = 'forwards'
    
                this.addEventListener('animationend', () => {
    
                    if (this.onshow) {
                        if (typeof this.onshow == 'function') this.onshow = [this.onshow];
                        this.onshow.forEach(onshow => {
                            if (typeof onshow == 'function') onshow();
                        })
                    }
    
                }, {once: true})
    
            }
        },
        hide: {
            get: function() {
                return this._hide;
            },
            set: function(hide) {
    
                if (typeof hide == 'number') {
                    hide = {
                        start: hide
                    }
                }
                if (typeof hide == 'string') {
    
                    let splited = hide.match(/([a-zA-Z]+)([\d.]*)/);
                    hide = {
                        direction: splited[1],
                        start: Number(splited[2])
                    }
    
                }
                if (Array.isArray(hide)) {
                    hide = {
                        direction: hide[0],
                        start: hide[1],
                        duration: hide[2],
                    }
    
                }
                if (hide === true) hide = {}
    
                hide.direction ??= '';
                hide.start ??= 0;
                hide.duration ??= 0.5;
    
                this._hide = hide;
    
                let rulename = `animate${animateid++}`;
    
                let x = this.style.left.replace(/[^.\d]/g, '') || 0;
                let y = this.style.top.replace(/[^.\d]/g, '') || 0;
                let xi = x + 0;
                let yi = y + 0;
                let xf = x + 0;
                let yf = y + 0;
    
                let l = 50;
                let l2 = 35;
    
                switch (hide.direction) {
                    case 'left':    xf -= l; break;
                    case 'right':   xf += l; break;
                    case 'up':      yf -= l; break;
                    case 'down':    yf += l; break;
                    case 'leftup':
                    case 'upleft':  xf -= l2; yf -= l2; break;
                    case 'rightup':
                    case 'upright': xf += l2; yf -= l2; break;
                    case 'downleft':
                    case 'leftdown': xf -= l2; yf += l2; break;
                    case 'rightdown':
                    case 'downright':  xf += l2; yf += l2; break;
                }
    
                document.styleSheets[0].insertRule(
                    `@keyframes ${rulename} {
                        from { opacity: 1; left: ${xi}px; top: ${yi}px}
                        to { opacity: 0; left: ${xf}px; top: ${yf}px}
                    }`
                );
    
                this.style.position = 'relative';
                this.style.right = `${xi}px`;
                this.style.top = `${yi}px`;
                this.style.opacity = 1;
                this.style.animationName = rulename;
                this.style.animationDuration = hide.duration + 's';
                this.style.animationDelay = hide.start + 's';
                this.style.animationFillMode = 'forwards'
    
                this.addEventListener('animationend', () => {
    
                    if (this.onhide) {
                        if (typeof this.onhide == 'function') this.onhide = [this.onhide];
                        this.onhide.forEach(onhide => {
                            if (typeof onhide == 'function') onhide();
                        })
                    }
    
                }, {once: true})
    
            }
        },
        exit: {
            get: function() {
                return this._exit;
            },
            set: function(exit) {
    
                if (typeof exit == 'number') {
                    exit = {
                        start: exit
                    }
                }
                if (typeof exit == 'string') {
    
                    let splited = exit.match(/([a-zA-Z]+)([\d.]*)/);
                    exit = {
                        direction: splited[1],
                        start: Number(splited[2])
                    }
    
                }
                if (Array.isArray(exit)) {
                    exit = {
                        direction: exit[0],
                        start: exit[1],
                        duration: exit[2],
                    }
    
                }
                if (exit === true) exit = {}
    
                exit.direction ??= '';
                exit.start ??= 0;
                exit.duration ??= 0.5;
    
                this._exit = exit;
    
                let rulename = `animate${animateid++}`;
    
                let x = this.style.left.replace(/[^.\d]/g, '') || 0;
                let y = this.style.top.replace(/[^.\d]/g, '') || 0;
                let xi = x + 0;
                let yi = y + 0;
                let xf = x + 0;
                let yf = y + 0;
    
                let l = 50;
                let l2 = 35;
    
                switch (exit.direction) {
                    case 'left':    xf -= l; break;
                    case 'right':   xf += l; break;
                    case 'up':      yf -= l; break;
                    case 'down':    yf += l; break;
                    case 'leftup':
                    case 'upleft':  xf -= l2; yf -= l2; break;
                    case 'rightup':
                    case 'upright': xf += l2; yf -= l2; break;
                    case 'downleft':
                    case 'leftdown': xf -= l2; yf += l2; break;
                    case 'rightdown':
                    case 'downright':  xf += l2; yf += l2; break;
                }
    
                document.styleSheets[0].insertRule(
                    `@keyframes ${rulename} {
                        from { opacity: 1; left: ${xi}px; top: ${yi}px}
                        to { opacity: 0; left: ${xf}px; top: ${yf}px}
                    }`
                );
    
                this.style.position = 'relative';
                this.style.right = `${xi}px`;
                this.style.top = `${yi}px`;
                this.style.opacity = 1;
                this.style.animationName = rulename;
                this.style.animationDuration = exit.duration + 's';
                this.style.animationDelay = exit.start + 's';
                this.style.animationFillMode = 'forwards'
    
                this.addEventListener('animationend', () => {
    
                    let box = this.parentNode;
                    box.waitingExitCount = (box.waitingExitCount||0) + 1;
                    if (box.waitingExitCount == box.childElementCount) box.remove();
    
                    if (this.onexit) {
                        if (typeof this.onexit == 'function') this.onexit = [this.onexit];
                        this.onexit.forEach(onexit => {
                            if (typeof onexit == 'function') onexit();
                        })
                    }
    
                }, {once: true})
    
            }
        },
    })
}