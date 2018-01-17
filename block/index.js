(function () {
    // requestAnimationFrame polyfill
    Date.now = !Date.now && function () {
        return new Date().getTime();
    };
    (function () {
        'use strict';
        var vendors = ['webkit', 'moz'];
        for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
            var vp = vendors[i];
            window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = (window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame']);
        }
        if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
            ||
            !window.requestAnimationFrame || !window.cancelAnimationFrame) {
            var lastTime = 0;
            window.requestAnimationFrame = function (callback) {
                var now = Date.now();
                var nextTime = Math.max(lastTime + 16, now);
                return setTimeout(function () {
                        callback(lastTime = nextTime);
                    },
                    nextTime - now);
            };
            window.cancelAnimationFrame = clearTimeout;
        }
    }());

    //碰撞检测
    function detectCollision(rect, circle) {
        var cx, cy;

        if (circle.x < rect.x) {
            cx = rect.x;
        } else if (circle.x > rect.x + rect.width) {
            cx = rect.x + rect.width;
        } else {
            cx = circle.x;
        }

        if (circle.y < rect.y) {
            cy = rect.y;
        } else if (circle.y > rect.y + rect.height) {
            cy = rect.y + rect.height;
        } else {
            cy = circle.y;
        }

        if (distance(circle.x, circle.y, cx, cy) < circle.radius) {
            return true;
        }

        return false;
    }

    function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    //主逻辑
    var Game = function () {
        var _ = this;
        _.score = 0; //分数
        _.level = 1; //关卡
        _.paused = false; //开始/暂停
        _.canvas = document.getElementById('canvas');
        _.ctx = canvas.getContext('2d');
        _.actions = {};
        _.keydowns = {};
        //注册按钮事件
        _.registerAction = function (key, callback) {
            _.actions[key] = callback;
        };
        //监听按键操作
        window.addEventListener('keydown', function (e) {
            _.keydowns[e.keyCode] = true;
        });
        window.addEventListener('keyup', function (e) {
            _.keydowns[e.keyCode] = false;
        });
        //循环
        var loop = function () {
            var actions = Object.keys(_.actions);
            for (var i = 0; i < actions.length; i++) {
                var key = actions[i];
                _.keydowns[key] && _.actions[key]();
            }
            _.clear();
            _.update();
            _.draw();
            requestAnimationFrame(loop);
        };
        //清除画布
        _.clear = function () {
            _.ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        //开始
        _.start = function () {
            loop();
        };
    };

    //球
    var Ball = function (game) {
        var _ = this;
        _.radius = 15;
        _.x = game.canvas.width / 2;
        _.y = 245;
        _.speedX = 2;
        _.speedY = 3;
        _.fired = false; //开始
        _.draw = function () {
            game.ctx.beginPath();
            game.ctx.arc(_.x, _.y, _.radius, 0, 2 * Math.PI);
            game.ctx.fill();
        };
        _.move = function () {
            if (_.fired) {
                if (_.x < _.radius || _.x > game.canvas.width - _.radius) {
                    _.speedX = -_.speedX;
                }
                if (_.y < _.radius || _.y > game.canvas.height - _.radius) {
                    _.speedY = -_.speedY;
                }
                _.x += _.speedX;
                _.y -= _.speedY;
            }
        };
        _.rebound = function () {
            _.speedY *= -1;
        };
        //发射
        _.fire = function () {
            _.fired = true;
        };
    };

    //砖块
    var Blocks = function (game, position) {
        var _ = this;
        _.width = 80;
        _.height = 20;
        _.x = position[0];
        _.y = position[1];
        _.alive = true;
        _.lifes = position[2] || 1;
        _.draw = function () {
            game.ctx.fillRect(_.x, _.y, _.width, _.height);
        };
        _.kill = function () {
            _.lifes--;
            if (_.lifes < 1) {
                _.alive = false;
            }
        };
    };

    //玩家挡板
    var Player = function (game) {
        var _ = this;
        _.width = 100;
        _.height = 20;
        _.x = (game.canvas.width - _.width) / 2;
        _.y = 261;
        _.speed = 5;
        _.moveLeft = function () {
            _.x = _.x <= 0 ? 0 : _.x - _.speed;
        };
        _.moveRight = function () {
            _.x = _.x >= game.canvas.width - _.width ? game.canvas.width - _.width : _.x + _.speed;
        };
        _.draw = function () {
            game.ctx.fillRect(_.x, _.y, _.width, _.height);
        };
    };

    //关卡
    var Level = function (game) {
        var _ = this;
        var levels = [
            [
                [25, 30],
                [115, 30],
                [205, 30],
                [295, 30],
                [25, 60],
                [115, 60],
                [205, 60],
                [295, 60],
                [25, 90],
                [115, 90],
                [205, 90],
                [295, 90],
            ],
            [
                [50, 0],
                [100, 100]
            ],
            [
                [50, 30],
                [100, 100, 2],
                [200, 100, 2]
            ],
        ];
        _.load = function (n) {
            var n = n - 1;
            var level = levels[n];
            var blocks = [];
            for (var i = 0; i < level.length; i++) {
                var b = new Blocks(game, level[i]);
                blocks.push(b);
            }
            return blocks;
        };
    };

    //主程序
    var main = function () {
        var game = new Game();
        var player = new Player(game);
        var ball = new Ball(game);
        var level = new Level(game);
        var blocks = level.load(game.level);
        game.registerAction('39', function () {
            player.moveRight();
        });
        game.registerAction('37', function () {
            player.moveLeft();
        });
        game.registerAction('32', function () {
            ball.fire();
        });
        game.registerAction('80', function () {
            game.paused = true;
        });
        game.registerAction('79', function () {
            game.paused = false;
        });
        game.draw = function () {
            ball.draw();
            player.draw();
            for (var i = 0; i < blocks.length; i++) {
                var block = blocks[i];
                if (block.alive) {
                    block.draw();
                }
            }
            game.ctx.font = "14px Open Sans";
            game.ctx.fillText('分数: ' + game.score, 10, 20);
            game.ctx.fillText('第' + game.level + '关', 350, 20);
        };
        game.update = function () {
            if (game.paused) {
                return;
            }
            ball.move();
            if (ball.y > player.y) { //游戏结束
                console.log('game over');
            }
            if (detectCollision(player, ball)) { //碰挡板
                ball.rebound(); //反弹
            }
            for (var i = 0; i < blocks.length; i++) { //碰砖块
                var block = blocks[i];
                if (block.alive && detectCollision(block, ball)) {
                    block.kill();
                    ball.rebound();
                    player.width += 1;
                    game.score += 100;
                }
            }
        };
        game.start();
    };
    main();

})();