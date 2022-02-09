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
  ],
  icon: function() {
    let {icons, stage} = r;
    let icon = icons[Math.floor(Math.random()*icons.length)]
    icon = PIXI.Sprite.from(`../img/${icon}.png`);
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
      backgroundColor: r.bgc
    });
    r.stage = r.app.stage;
    document.body.appendChild(r.app.view);

    //audio
    let context = new AudioContext();
    let sounds = ['gan', 'ntmd', 'woc', 'bday'];
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
      switch(sound) {
        case 'ntmd': gainNode.gain.value = 0.5; break;
        case 'woc': gainNode.gain.value = 0.2; break;
        case 'gan': gainNode.gain.value = 0.5; break;
        case 'bday': gainNode.gain.value = 1; break;
      }
      
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
          title.text = `陈姜姜又老一岁～！\n【${r.score}岁】啦！`
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
        if (r.gameState) {
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
          let button = document.createElement('button');
          button.innerText = dir;
          document.body.append(button);
          let base = Math.round(w / 5);
          button.style.width = base + 'px'
          button.style.height = base + 'px'
          button.style.borderRadius = base + 'px'
          button.style.fontSize = '150%';
          switch(dir) {
            case '↑':
              button.style.left = (w*0.5-base*0.5).toFixed(0) + 'px'
              button.style.top = (h*0.75-base * 1.5).toFixed(0) + 'px'
              button.onclick = () => checkKey('up')
              break;
            case '↓':
              button.style.left = (w*0.5-base*0.5).toFixed(0) + 'px'
              button.style.top = (h*0.75+base*0.5).toFixed(0) + 'px'
              button.onclick = () => checkKey('down')
              break;
            case '←':
              button.style.left = (w*0.5-base*1.5).toFixed(0) + 'px'
              button.style.top = (h*0.75-base*0.5).toFixed(0) + 'px'
              button.onclick = () => checkKey('left')
              break;
            case '→':
              button.style.left = (w*0.5+base*0.5).toFixed(0) + 'px'
              button.style.top = (h*0.75-base*0.5).toFixed(0) + 'px'
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
    }
    
    cjj.update = () => {

      let {direction, gameState} = r;

      // update frequency
      cjj.update.f = (0.3) / (2 ** (r.score/30))

      if (gameState == 'gameStart') {

        reset();
        snakes.forEach(snake => {
          if (snake == cjj) return;
          r.stage.removeChild(snake);
        })
        snakes = [cjj];
        newGift();
        r.score = 0;
        cjj.update.f = (0.3) / (2 ** (r.score/30))
        gameState = r.gameState = 'game';

        // score ratio    f(desktop) f(mobile)
        // 0     0        0.3        0.5
        // 33    1        0.15       0.25
        // 66    2        0.075      0.125
        // 100   3        0.0375     0.0625
        

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
          reset();
          r.play('bday');
        } 
        
        if (cjj.girdX == x) cjj.girdX = x-1;
        if (cjj.girdX < 0) cjj.girdX = 0;
        if (cjj.girdY == y) cjj.girdY = y-1;
        if (cjj.girdY < 0) cjj.girdY = 0;


        // draw
        body.clear();
        snakes.forEach(snake => {
          if (snake == snakes.firstChild) return;
          if (snake == snakes.lastChild) return;
          let {girdX, girdY} = snake;
          let x = (girdX + (r.mobile ? 0 : 1)) * width;
          let y = (girdY + (r.mobile ? 0 : 1)) * height;
          body.beginFill(0xDE3249);
          body.drawRect(x+2, y+2, width-4, height-4);
          body.endFill();
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
            reset();
            r.play('bday');
          }
        })


        // r.debug.text = `${checked}, ${total}/${snakes.length}, ${count}`;

        



      }

      setPos(cjj);
      

    }
    cjj.update.f = 0.3;
    

    r.cjj = cjj;


    
    snakes.push(cjj);

    let newGift = function() {
      let item = icon();
      item.anchor.set(0.5)
      item.width = width;
      item.height = height;
      item.girdX = between(0, x-1, true);
      item.girdY = between(0, y-1, true);
      setPos(item);
      item.update = () => {
        if (item.state == 'body') {
          item.alpha -= r.fadingSpeed;
          if (item.alpha < 0) stage.removeChild(item);
        }
      }
      snakes.push(item);
    }

    let body = new PIXI.Graphics();

    let score = new PIXI.Text(`cjj ${r.score} 岁啦！`, {
      fontSize: 20,
      fill: 0xff9191,
      dropShadow: true,
      dropShadowBlur: 3,
      dropShadowDistance: 0,
    })
    score.update = () => {
      score.text = `cjj ${r.score} 岁啦！`;
    }
    score.x = 10;
    score.y = 10;
    stage.addChild(body);
    stage.addChild(cjj);
    stage.addChild(score);

  }

};

r.initiliaze();
r.debug();
r.bg();
r.game();
r.title();
r.input();


























