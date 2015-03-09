    ;(function(window, document) {
        if (window.mapleque == undefined){
           window.mapleque = {}; 
        }
            
        if (window.mapleque.arrow != undefined){
            return;
        }
        
        var proc = {
            paintArrow: function(ctx) {
                paintArrow(this, ctx);
            },

            paintLine: function (ctx) {
                paintLine(this, ctx);
            },

            set: function(sp, ep, size, sharp, lineWidth, color) {
                init(this, sp, ep, size, sharp, lineWidth, color);
            }
        };

        var init = function(a, sp, ep, size, sharp, lineWidth, color) {
            a.sp = sp; // 起点
            a.ep = ep; // 终点
            a.size = size;   // 箭头大小
            a.color = color; // 箭头颜色
            a.sharp = sharp; // 箭头锐钝
            a.lineWidth = lineWidth; // 箭头线条宽度
        };

        var paintLine = function (a, ctx) {
            var sp = a.sp;
            var ep = a.ep;
            if (ctx == undefined) {
                return;
            }
            ctx.beginPath();
            ctx.moveTo(sp.x, sp.y);
            ctx.lineTo(ep.x, ep.y);
            ctx.strokeStyle = a.color; 
            ctx.closePath();
        };

        var paintArrow = function (a, ctx) {
            var sp = a.sp;
            var ep = a.ep;
            if (ctx == undefined) {
                return;
            }
            var h = _calcH(a, sp, ep, ctx);
            ctx.beginPath();
            ctx.moveTo(ep.x, ep.y);
            ctx.lineTo(h.h1.x, h.h1.y);
            ctx.moveTo(ep.x, ep.y);
            ctx.lineTo(h.h2.x, h.h2.y);
            ctx.lineWidth = a.lineWidth;
            ctx.lineCap = "round";
            ctx.strokeStyle = a.color; 
            ctx.stroke();
            ctx.closePath();
        };

        //计算头部坐标
        var _calcH = function(a, sp, ep, ctx) {
            var theta = Math.atan((ep.x - sp.x) / (ep.y - sp.y));
            var cep = _scrollXOY(ep, -theta);
            var csp = _scrollXOY(sp, -theta);
            var ch1 = {
                x: 0,
                y: 0
            };
            var ch2 = {
                x: 0,
                y: 0
            };
            var l = 250;
            if (cep.y - csp.y < 0) {
                l *= -1;
            }
            ch1.x = cep.x + l * (a.sharp || 0.025);
            ch1.y = cep.y - l * (a.size || 0.05);
            ch2.x = cep.x - l * (a.sharp || 0.025);
            ch2.y = cep.y - l * (a.size || 0.05);

            var h1 = _scrollXOY(ch1, theta);
            var h2 = _scrollXOY(ch2, theta);
            return {
                h1: h1,
                h2: h2
            };
        };

        //旋转坐标
        var _scrollXOY = function(p, theta) {
            return {
                x: p.x * Math.cos(theta) + p.y * Math.sin(theta),
                y: p.y * Math.cos(theta) - p.x * Math.sin(theta)
            };
        };

        var arrow = new Function();
        arrow.prototype = proc;
        window.mapleque.arrow = arrow;
    })(window, document);

;(function(){
    var scrolling;

    linkBelt = function(options) {
        var beltValue = (1 - options.beltSize) / 2,
            color = options.color,
            canvas = options.canvas,
            canvas_width = parseInt(canvas.css("width")),
            canvas_height = parseInt(canvas.css("height")),
            ctx = canvas[0].getContext('2d'),
           // devicePixelRatio = window.devicePixelRatio,
            parentContainer = options.parent,
            childContainer = options.child,
            parentItems = parentContainer.find("li"),
            childItems = childContainer.find("li"),
            curvature = options.curvature || null,
            isStraight = options.isStraight || false,
            arrows = options.arrows || false,
            scroll = options.scroll || false;

        var trim  = function(str) {
    　　    return str && str.replace(/(^\s*)|(\s*$)/g, "");
    　　 };

        var getEndPos = function (id, proportion) {
            var item = childItemsWithId[id];
            if (!item) {
                return;
            }
            var height = parseInt($(item).css("height")),
                parent = $(item).parent()[0],
                x2 = canvas_width,
                y2 = item.offsetTop - childContainer[0].scrollTop - parent.offsetTop + height * (1 - (proportion || beltValue)),
                x4 = x2,
                y4 = item.offsetTop - childContainer[0].scrollTop - parent.offsetTop + height * (proportion || beltValue);
            return [[x2, y2], [x4, y4]];
        };

        var getTop = function (container, item) {
            return item.offsetTop - container.offsetTop - container.scrollTop;
        };

        var getVisibleItems = function (container, items) {
            var container = container[0],
                conHeight = container.offsetHeight,
                visibleItems = [];

            items.each(function (index, item) {
                if (item.offsetHeight === 0) { return; }
                var top = getTop(container, item);
                if (top >= -item.offsetHeight && top < conHeight) {
                    visibleItems.push(item);
                }
            });
            return visibleItems;
        };

        var bindEvent = function () {
            var isBind = parentContainer.attr("data-bind");
            if (!scroll.open || isBind) {
                return;
            }
            parentContainer.attr("data-bind", "1");
            parentContainer.on("scroll", function () {
                scrolling = true;
                if (scrolling) {
                    linkBelt(options);
                    scroll.pre && linkBelt(scroll.pre);
                    scroll.callback && scroll.callback(); 
                }
            });

            if (scroll.childIsLast && scroll.childIsLast.open) {
                childContainer.on("scroll", function () {
                    linkBelt(options);
                    scroll.childIsLast.callback && scroll.childIsLast.callback(); 
                });
            }
        };

        var render = function (l1, l2, l3, l4) {
            var control = curvature && [canvas_width * curvature[0], canvas_height * curvature[1]];

            ctx.beginPath();
            ctx.moveTo(l1[0], l1[1]);

            if (isStraight) {
                ctx.lineTo(l2[0], l2[1]);
            } else {
                ctx.quadraticCurveTo(control[0], control[1], l2[0], l2[1]);
            }
            
            ctx.lineTo(l4[0], l4[1]);

            if (isStraight) {
                ctx.lineTo(l3[0], l3[1]);
            } else {
                ctx.quadraticCurveTo(control[0], control[1], l3[0], l3[1]);
            }
            ctx.lineTo(l1[0], l1[1]);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.closePath();//闭合路径 

            if (arrows.has) {
                var arrow = new window.mapleque.arrow();
                arrow.set({  //sp, ep, size, sharp, lineWidth, color
                        x: isStraight ? (l1[0] + l3[0]) / 2 : control[0],
                        y: isStraight ? (l1[1] + l3[1]) / 2 : control[1]
                    }, {
                        x: (l2[0] + l4[0]) / 2,
                        y: (l2[1] + l4[1]) / 2
                    }, 
                    arrows.size,
                    arrows.sharp,
                    arrows.lineWidth,
                    arrows.color || color
                );
                arrow.paintArrow(ctx);
            }
        };

        ctx.clearRect(0, 0, canvas.width(), canvas.height());

        // L1 L2
        // L3 L4
        var L1 = [],
            L3 = [],
            childItemsWithId = {},
            visibleParentItems = getVisibleItems(parentContainer, parentItems),
            visibleChildItems = getVisibleItems(childContainer, childItems);

        $.each(visibleChildItems, function (index, item) {
            var id = $(item).attr("data-id");
            childItemsWithId[id] = item;
        });

        $.each(visibleParentItems, function (index, item) {
            var height = parseInt($(item).css("height")),
                parent = $(item).parent()[0],
                
                childIds = [],
                childPorportions = [],
                childData = $(item).attr("data-childIds").split(","),
                top = getTop(parentContainer[0],item);

            $.each(childData, function (index, id_proportion_str) {
                var id_proportion = trim(id_proportion_str).split("|"),
                    id = trim(id_proportion[0]),
                    proportion = (1 - trim(id_proportion[1])) / 2,
                    x1 = 0,
                    y1 = item.offsetTop - parentContainer[0].scrollTop - parent.offsetTop + height * ((1 - (proportion || beltValue))),
                    x3 = x1,
                    y3 = item.offsetTop - parentContainer[0].scrollTop - parent.offsetTop + height * (proportion || beltValue);
                L1.push([x1, y1, id, proportion]);
                L3.push([x3, y3]);
            });
        });



        L1.forEach(function (item, index) {
            var l1_item = item,
                l3_item = L3[index],
                childId = item[2],
                childProportion = item[3],
                endPos = getEndPos(childId, childProportion);
            if (!endPos) {
                return;
            }
            var l2_item = endPos[0],
                l4_item = endPos[1];

            render(l1_item, l2_item, l3_item, l4_item);
        });
        scrolling = false;
        bindEvent();
        
    }
})();