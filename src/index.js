import './reset.css';
import './style.css';
import * as PIXI from 'pixi.js'
require('./js')


let r = {
  w: window.innerWidth,
  h: window.innerHeight,
  bgc: 0xffffcc,
  t: 0,
  dt: 1,
  get fadingSpeed() {return 0.05 * r.dt},
  gap: 120,
  gameState: 'title',
  score: 0,
  bgs: [],
  development: true,
  mobile: /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  sounds: {},
  icons: [
    'birthday',
    'birthday_cake',
    'confetti',
    'gift',
    'gift_card',
    'heart_balloon',
    'party_balloon',
    'party_balloons',
    'party_hat',
    'bomb',
    'poo',
  ],
  icon: function() {
    let {icons, stage} = r;
    let icon = icons[Math.floor(Math.random()*icons.length)]
    let exx = Boolean(['poo', 'bomb'].includes(icon))
    icon = PIXI.Sprite.from(`../img/${icon}.png`);
    icon.exx = exx;
    stage.addChild(icon)
    return icon;
  },
  between: function(min, max, round) {

    let n = min + Math.random() * (max - min)
    if (round) n = Math.round(n);
    return n;

  },
  initiliaze: function() {

    r.app = new PIXI.Application({
      width: r.w,
      height: r.h,
      backgroundColor: r.bgc,
      antialias: true,
    });
    r.stage = r.app.stage;
    document.body.appendChild(r.app.view);

    //audio
    let context = new AudioContext();
    let sounds = ['gan', 'ntmd', 'woc', 'bday', 'exx'];
    sounds.forEach(sound => {
    
        let url = `../sound/${sound}.mp3`
    
        window.fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          r.sounds[sound] = audioBuffer;
        });
    })
    r.context = context;

    // animation
    r.app.ticker.add(dt => {

      r.dt = dt
      r.t += dt / 60;

      r.stage.children.forEach(child => {
        
        let updates = child.update;
        if (typeof updates == 'function') child.update = [updates];
        if (!Array.isArray(updates)) return;

        updates.forEach(update => {

          if (typeof update != 'function') return;

          let {t} = r;

          update.f ??= 0;                             // loop update after n second (default 0 second, immediately next frame)
          update.start ??= 0;                         // first updating time (default 0 second)
          update.count ??= 0;                         // update counts (default 0) 
          update.repeat ??= 'infinity';               // update will repeat n times (default infinity)
          update.t0 ??= t;                            // update last frame (default this.t)
      
          let {t0, start, f, count, repeat} = update;
      
          if (repeat == 'infinity' || repeat > count) {
      
              if (t - t0 - start > f) {
                  update.count++;
                  update.t0 = t;
                  update();
              }
      
          }

        });
        
      })

    })

  },
  play: function(sound) {
    let source = r.context.createBufferSource();
    source.buffer = r.sounds[sound];
      let gainNode = r.context.createGain()
      let value;
      switch(sound) {

        default:
          value = 1; break;


        case 'gan':
          value = 0.5; break;

        case 'ntmd':
        case 'woc':
          value = 0.2; break;

      }
      gainNode.gain.value = value;
      source.connect(gainNode);
      gainNode.connect(r.context.destination)
    
    source.start();
  },
  debug: function() {
    let debug = new PIXI.Text();
    debug.anchor.set(0, 1);
    debug.x = 0;
    debug.y = r.h;
    debug.update = () => {
    }
    debug.update.f = 0.5;
    r.stage.addChild(debug)
    r.debug = debug;
  },
  bg: function() {

    let {w, h, gap, bgs} = r;

    let colorMatrix = new PIXI.filters.ColorMatrixFilter();
    colorMatrix.blackAndWhite(true)
    colorMatrix.alpha = 0.75
    let x = Math.ceil(w / gap) + 2;
    let y = Math.ceil(h / gap) + 2;
    for (let i = 0; i < x; i++) {

      for (let j=0; j < y; j++) {

        let bg = r.icon();
        
        bgs.push(bg)

        bg.anchor.set(0.5);
        bg.girdX = i;
        bg.girdY = j;
        bg.x = i*gap+40;
        bg.y = j*gap+40;
        bg.alpha = 0.2;
        bg.rotation = Math.PI * -0.1;
        bg.filters = [colorMatrix]

        bg.update = () => {

          let speed = 0.2;
          let {dt} = r;

          bg.x -= speed * dt;
          if (bg.x < -40) {
            let right = 0;
            bgs.forEach(check => {
              if (bg.girdY == check.girdY && check.x > right) {
                right = check.x;
              }
            })
            bg.x = right + gap;
          }

          bg.y -= speed * dt;
          if (bg.y < -40) {
            let bottom = 0;
            bgs.forEach(check => {
              if (bg.girdX == check.girdX && check.y > bottom) bottom = check.y;
            })
            bg.y = bottom + gap;
          }

        }
        
      }

    }

  },
  title: function() {
    let {w, h, app, t, stage} = r;
    let title = new PIXI.Text('陈姜姜生日啦～！', {
      fill: 0x66d9ff,
      dropShadow: true,
      dropShadowBlur: 5,
      dropShadowDistance: 0,
      fontWeight: 900,
      fontSize: 30,
      align: 'center',
    })
    title.anchor.set(0.5)
    title.x = w * 0.5;
    title.y = h * 0.25;
    title.rotation = 0.15;
    let update1 = () => {
      title.rotation *= -1;
    }
    update1.f = 1;
    let update2 = () => {

      let {dt, gameState, fadingSpeed} = r;
    
      switch(gameState) {
        case 'title':
          title.alpha += fadingSpeed;
          info.alpha += fadingSpeed
          if (title.alpha > 1) {
            title.alpha = 1
            info.alpha = 1
          }
          break;
        case 'gameStart':
        case 'game':
          title.alpha -= fadingSpeed;
          info.alpha -= fadingSpeed
          if (title.alpha < 0) {
            title.alpha = 0
            info.alpha = 0
          }
          break;
        case 'lose':
          title.text = `陈姜姜又老一岁\n【${r.score}岁】啦！`
          info.text = r.mobile ? '触摸屏幕再次庆生' : '任意键再次庆生'
          title.alpha += fadingSpeed;
          info.alpha += fadingSpeed
          if (title.alpha > 1) {
            title.alpha = 1
            info.alpha = 1
          }
      }
    
    }
    title.update = [update1, update2]
    stage.addChild(title)

    let info = new PIXI.Text(r.mobile ? '触摸屏幕过生日' : '任意键过生日', {
      align: 'center',
      fontSize: 20,
      // fill: 0xffffa8,
    });
    info.anchor.set(0.5)
    info.x = w * 0.5;
    info.y = h * 0.75;
    stage.addChild(info);

  },
  input: function() {


    let action = ev => {
      if (['title', 'lose'].includes(r.gameState)) r.gameState = 'gameStart';
    } 
    
    let touch;
    document.onmousedown = ev => {
      if (!touch) action(ev);
      touch = false;
    }
    document.ontouchstart = ev => {
      touch = true;
      action(ev);
    }
    document.onkeydown = function(ev) {

      let {key} = ev;

      action(ev);

        let keymap = [
          ['w', 'a', 's', 'd'],
          ['i', 'j', 'k', 'l'],
          ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'],
          ['8', '4,', '6', '2']
        ]
  
        let up = [];
        let left = [];
        let down = [];
        let right = [];
  
        keymap.forEach(set => {
          up.push(set[0]);
          left.push(set[1])
          down.push(set[2])
          right.push(set[3])
        })

        if (r.gameState == 'game') {
          if (up.includes(key) && r.direction != 'down') r.direction = 'up';
          if (left.includes(key) && r.direction != 'right') r.direction = 'left';
          if (down.includes(key) && r.direction != 'up') r.direction = 'down';
          if (right.includes(key) && r.direction != 'left') r.direction = 'right';
        } else if (r.gameState == 'lose' || r.gameState == 'gameStart') {
          if (up.includes(key)) r.direction = 'up';
          if (left.includes(key)) r.direction = 'left';
          if (down.includes(key)) r.direction = 'down';
          if (right.includes(key)) r.direction = 'right';
        }


        

    }

    if (r.mobile) {

      let {w,h} = r;

      let key;
      let checkKey = (key) => {
        let dir = r.direction;
        if (r.gameState == 'game') {
          switch(key) {
            case 'up': if (dir != 'down') r.direction = key; break;
            case 'left': if (dir != 'right') r.direction = key; break;
            case 'down': if (dir != 'up') r.direction = key; break;
            case 'right': if (dir != 'left') r.direction = key; break;
          }
        } else if (r.gameState == 'lose' || r.gameState == 'gameStart') {
          r.direction = key;
        }
      }

      let dirs = ['↑', '←', '→', '↓']
      dirs.forEach(dir => {
          let button = document.createElement('a');
          button.innerText = dir;
          document.body.append(button);
          let base = Math.round(w / 4);
          button.style.width = base + 'px'
          button.style.height = base + 'px'
          button.style.borderRadius = Math.round(base/4) + 'px'
          button.style.fontSize = '150%';
          button.className = 'hide';
          switch(dir) {
            case '↑':
              button.style.left = (w*0.5-base*0.5).toFixed(0) + 'px'
              button.style.top = (h-base*2.5).toFixed(0) + 'px'
              button.onclick = () => checkKey('up')
              break;
            case '↓':
              button.style.left = (w*0.5-base*0.5).toFixed(0) + 'px'
              button.style.top = (h-base*1.25).toFixed(0) + 'px'
              button.onclick = () => checkKey('down')
              break;
            case '←':
              button.style.left = (w*0.5-base*1.75).toFixed(0) + 'px'
              button.style.top = (h-base*1.25).toFixed(0) + 'px'
              button.onclick = () => checkKey('left')
              break;
            case '→':
              button.style.left = (w*0.5+base*0.75).toFixed(0) + 'px'
              button.style.top = (h-base*1.25).toFixed(0) + 'px'
              button.onclick = () => checkKey('right')
          }
          
      })

    }





      
  },
  game: function() {

    let {stage, w, h, icon, between} = r;

    let snakes = [];

    let x = Math.floor(w / 40) - (r.mobile ? 0 : 2);
    let y = Math.floor(h / 40) - (r.mobile ? 0 : 2);
    if (x%2 == 0) x--;
    if (y%2 == 0) y--;
    let width = w / (x+(r.mobile ? 0 : 2));
    let height = h / (y+(r.mobile ? 0 : 2));

    let cjj = PIXI.Sprite.from(`../img/cjj.png`);
    cjj.anchor.set(0.5)

    let setPos = (sprite) => {
      let {girdX, girdY} = sprite;
      sprite.x = (girdX + (r.mobile ? 0.5 : 1.5)) * width;
      sprite.y = (girdY + (r.mobile ? 0.5 : 1.5)) * height;
    }
    cjj.girdX = Math.floor(x/2)
    cjj.girdY = Math.floor(y/2)
    setPos(cjj);

    let reset = function() {
      cjj.girdX = Math.floor(x/2)
      cjj.girdY = Math.floor(y/2)
      setPos(cjj);
      body.clear();
      cjj.alpha = 0;
      delete r.direction;
    }
    

    snakes.push(cjj);

    let newGift = function() {
      let gift = icon();
      gift.anchor.set(0.5)
      gift.width = width;
      gift.height = height;
      let girds = {};
      for (let i=0; i < x; i++) {
        girds[i] = {};
          for (let j=0; j < y; j++) {
            girds[i][j] = 'empty';
          }
      }
      snakes.forEach(snake => {
        let sX = snake.girdX;
        let sY = snake.girdY;
        if (girds[sX]) {
          delete girds[sX][sY];
          if (!Object.keys(girds[sX]).length) delete girds[sX];
        }
        
      })
      let rndX = Number(Object.keys(girds).randomChild);
      let rndY = Number(Object.keys(girds[rndX]).randomChild);
      gift.girdX = rndX
      gift.girdY = rndY;
      setPos(gift);
      gift.update = () => {
        if (gift.state == 'body') {
          gift.alpha -= r.fadingSpeed;
          if (gift.alpha < 0) stage.removeChild(gift);
        }
      }
      snakes.push(gift);
      return gift
    }

    let body = new PIXI.Graphics();

    let score = new PIXI.Text(`陈姜姜 ${r.score} 岁啦！`, {
      fontSize: 25,
      fill: 0xffccff,
      dropShadowColor: 0x000000,
      dropShadow: true,
      dropShadowBlur: 3,
      dropShadowDistance: 0,
    })
    score.update = () => {
      score.text = `陈姜姜 ${r.score} 岁啦！`;
    }
    score.x = 10;
    score.y = 10;

    let start = new PIXI.Graphics()
    let n = new PIXI.Text(3, {
      fontSize: 100,
      fontWeight: 'bolder',
      fill: 0xffffff,
      strokeThickness: 3,
    });

    n.anchor.set(0.5)
    // start.anchor.set(0.5)
    n.x = w/2;
    n.y = h/2;

    start.x = w/2;
    start.y = h/2;

    start.lineStyle(1.5, 0x000000, 0.2);
    start.beginFill(0xDE3249, 0.5);
    let avg = Math.sqrt(width * width + height * height)

    let count = 16;
    for (let i = 0; i < count; i++) {
      let rotation = Math.PI * i / (count/2)
      let x = Math.sin(rotation) * avg * 2
      let y = Math.cos(rotation) * avg * 2
      start.drawCircle(x, y, 20)
    }
    start.endFill();
    start.update = () => start.rotation += 0.005 * this.dt;

    let up1 = () => {
      if (this.gameState == 'gameStart') {
        if (!up1.once) {
          n.text = 3;
          document.querySelectorAll('a').forEach(a => a.className = '')
          up1.once = true;
        }
        switch(n.text) {
          default:
            let value = Number(n.text);
            n.text = value - 1;
            break;
          case '0': 
            r.gameState = 'game';
            up1.once = false;
            newGift();
        }
      }

    }
    up1.f = 0.75;
    let up2 = () => {
      
      if (n.text === '0') {
        n.alpha -= this.fadingSpeed * this.dt;
        start.alpha -= this.fadingSpeed * this.dt;
      }
      switch(r.gameState) {
        case 'title':
          n.alpha = start.alpha = 0;
          break;
        case 'gameStart':
          n.alpha = start.alpha = 1;
          break;
        case 'game':
          n.alpha -= this.fadingSpeed * 5 * this.dt;
          start.alpha -= this.fadingSpeed * 5 * this.dt;
          if (n.alpha < 0) {
            n.alpha = start.alpha = 0;
          }
          break;
        case 'lose':
          n.text = 3;
      }
      if (r.gameState == 'title') {
        n.alpha = 0;
        start.alpha = 0;
      }
    }
    n.update = [up1, up2]
    up1();up2();
    
    
    let c1 = () => {

      switch(r.gameState) {
        case 'title':
          cjj.alpha = 0;
          break;
        case 'gameStart':
          break;
        case 'game':
          cjj.alpha += r.fadingSpeed * r.dt
          if (cjj.alpha > 1) cjj.alpha = 1;
        case 'lose':
      }
    }

    let c2 = () => {

      let {direction, gameState} = r;

      // update frequency
        // score ratio    f(desktop) f(mobile)
        // 0     0        0.3        0.5
        // 33    1        0.15       0.25
        // 66    2        0.075      0.125
        // 100   3        0.0375     0.0625
      c2.f = (0.3) / (2 ** (r.score/30))

      if (gameState == 'gameStart') {

        reset();

        snakes.forEach(snake => {
          if (snake == cjj) return;
          r.stage.removeChild(snake);
        })

        snakes = [cjj];
        r.score = 0;
        c2.f = (0.3) / (2 ** (r.score/30))

      }
      if (gameState == 'game') {

        switch(direction) {
          case 'up':    cjj.girdY--; break;
          case 'down':  cjj.girdY++; break;
          case 'left':  cjj.girdX--; break;
          case 'right': cjj.girdX++; break;
        }

        if (cjj.girdX == x || cjj.girdX < 0 ||
          cjj.girdY == y || cjj.girdY < 0) {
          r.gameState = 'lose';
          if (cjj.girdX == x) cjj.girdX = x-1;
          if (cjj.girdX < 0) cjj.girdX = 0;
          if (cjj.girdY == y) cjj.girdY = y-1;
          if (cjj.girdY < 0) cjj.girdY = 0;
          document.querySelectorAll('a').forEach(a => a.className = 'hide')
          r.play('bday');
          return;
        } 
        
        // draw
        body.clear();
        for (let i = 1; i < snakes.length - 1; i++) {
          let snake = snakes[i];
          let {girdX, girdY} = snake;
          let x = (girdX + (r.mobile ? 0 : 1)) * width;
          let y = (girdY + (r.mobile ? 0 : 1)) * height;
          
          let pos = snakes.length - 1 - i;
          let alpha = 0.5 + 0.5 * (pos)/(snakes.length-2);


          
          body.beginFill(0xDE3249, alpha);
          body.drawRoundedRect(x+2, y+2, width-4, height-4, 10);
          body.endFill();
        }
        snakes.forEach(snake => {

        })

        body.lineStyle(1, 0x000000, 0.5);
        if (!r.mobile) body.drawRoundedRect(width, height, width*(x), height*(y));
          
        

        // check collision with new gift
        let last = snakes.lastChild
        if (cjj.girdX == last.girdX && cjj.girdY == last.girdY) {
          last.state = 'body';
          newGift();
          r.score++
          
          let sound = ['woc','ntmd', 'gan'].randomChild
          if (last.exx) sound = 'exx';
          r.play(sound)
          
        }

        // update body's gird pos
        for (let i = snakes.length - 1; i > 0; i--) {
          
          let tail = snakes[i];
          let next = snakes[i-1];
          if (tail == snakes.lastChild) continue;
          if (tail == snakes.firstChild) continue;
          
          tail.girdX = next.girdX + 0;
          tail.girdY = next.girdY + 0;

        }

        // check collision with body
        let count = 0;
        snakes.forEach(snake => {
          let tail = snakes[snakes.length -1]
          let gift = snakes.lastChild;
          if ([cjj, tail, gift].includes(snake)) return;
          if (cjj.girdX == snake.girdX && cjj.girdY == snake.girdY) {
            count++;
          }
          if (count > 1) {
            r.gameState = 'lose';
            document.querySelectorAll('a').forEach(a => a.className = 'hide')
            r.play('bday');
          }
        })

        setPos(cjj);

      }

    }
    c2.f = 0.3;

    cjj.update = [c1, c2];

    stage.addChild(body);
    stage.addChild(cjj);
    stage.addChild(start)
    stage.addChild(n)
    stage.addChild(score);

    

  }

};

r.initiliaze();
r.debug();
r.bg();
r.game();
r.title();
r.input();


























